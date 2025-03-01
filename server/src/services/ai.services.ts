import redis from "../config/redis";
import { getDocument, PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { promptForContractRecognition, promptForReviewingContract } from "../utils/promptsForAI";

const AI_MODEL = "gemini-pro";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const aiModel = genAI.getGenerativeModel({ model: AI_MODEL });

class PDFProcessingError extends Error {
  cause: any;
  name: string;
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'PDFProcessingError';
    this.cause = cause;
  }
}


interface Analysis {
  risks: { risk: string; riskDetails: string }[];
  opportunities: { opportunity: string; opportunityDetails: string }[];
  summary: string;
}

interface BufferData {
  type?: string;
  data?: number[];
}

const toUint8Array = (fileInfo: unknown): Uint8Array => {
  if (Buffer.isBuffer(fileInfo)) {
    return new Uint8Array(fileInfo);
  }

  if (typeof fileInfo === 'object' && fileInfo !== null) {
    const bufferData = fileInfo as BufferData;
    if (bufferData.type === 'Buffer' && Array.isArray(bufferData.data)) {
      return new Uint8Array(bufferData.data);
    }
  }

  throw new PDFProcessingError('Invalid file data format');
};

const extractTextFromPDF = async (pdf: PDFDocumentProxy): Promise<string> => {
  const textLines: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page: PDFPageProxy = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => (item as { str: string }).str)
      .join(' ');
    textLines.push(pageText);
  }

  return textLines.join('\n');
};

export const retrieveTextFromPDF = async (
  fileKey: string,
): Promise<string> => {
  // Validate input
  if (typeof fileKey !== 'string' || fileKey.trim() === '') {
    throw new PDFProcessingError('File key must be a non-empty string');
  }

  try {
    // Fetch file data from Redis
    const fileInfo = await redis.get(fileKey);
    if (!fileInfo) {
      throw new PDFProcessingError('File not found in Redis');
    }

    // Convert to Uint8Array
    const fileBuffer = toUint8Array(fileInfo);

    // Load PDF document
    const pdf = await getDocument({ data: fileBuffer }).promise;

    // Extract and return text
    return await extractTextFromPDF(pdf);
  } catch (error : any) {
    // Wrap and rethrow errors with context
    if (error instanceof PDFProcessingError) {
      throw error; // Already a custom error
    }
    throw new PDFProcessingError('Failed to extract text from PDF', error);
  }
};

export const recognizeContractType = async ( contractText: string) : Promise<string> => {
  try {
    const prompt = promptForContractRecognition(contractText);
  
    const results = await aiModel.generateContent(prompt);
    
    if(!results) throw new Error(`Error Could not generate results with AI`)

    const response = results.response;
    return response.text().trim();
    
  } catch (error : any) {
    throw new Error(`Error is : ${error.message}`)
  }
}


export const reviewContractWithAI = async (
  contractText: string,
  tier: "free" | "premium",
  contractType: string
): Promise<Analysis> => {
  const prompt = `${promptForReviewingContract(tier, contractType)}\n` +
    `Important: Provide only the JSON object in your response, without any additional text or formatting.\n` +
    `Contract text:\n${contractText}`;

  const results = await aiModel.generateContent(prompt);
  if (!results) throw new Error("Could not analyze!");

  let text = results.response.text()
    .replace(/```json\n?|\n?```/g, "")
    .trim();

  try {
    text = text
      .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3') // Quote keys
      .replace(/:\s*([^"][^,}\]\n]*)(?=[,}\]])/g, ': "$1"') // Quote unquoted string values
      .replace(/,\s*([}\]])/g, "$1"); // Remove trailing commas

    return JSON.parse(text) as Analysis;
  } catch (error : any) {
    console.error(`Error parsing JSON: ${error.message}`);

    const fallback: Analysis = {
      risks: [],
      opportunities: [],
      summary: "Error analyzing contract",
    };

    // Parse risks
    fallback.risks = (text.match(/"risks"\s*:\s*\[([\s\S]*?)\]/)?.[1]?.split("},") || []).map((item) => {
      const riskMatch = item.match(/"risk"\s*:\s*"([^"]*)"/i);
      const explanationMatch = item.match(/"explanation"\s*:\s*"([^"]*)"/i);
      return {
        risk: riskMatch?.[1] || "Unknown",
        riskDetails: explanationMatch?.[1] || "Unknown",
      };
    });

    // Parse opportunities
    fallback.opportunities = (text.match(/"opportunities"\s*:\s*\[([\s\S]*?)\]/)?.[1]?.split("},") || []).map((item) => {
      const opportunityMatch = item.match(/"opportunity"\s*:\s*"([^"]*)"/i);
      const explanationMatch = item.match(/"explanation"\s*:\s*"([^"]*)"/i);
      return {
        opportunity: opportunityMatch?.[1] || "Unknown",
        opportunityDetails: explanationMatch?.[1] || "Unknown",
      };
    });

    const summaryMatch = text.match(/"summary"\s*:\s*"([^"]*)"/);
    if (summaryMatch) fallback.summary = summaryMatch[1];

    return fallback;
  }
};