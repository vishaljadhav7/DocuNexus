import redis from "../config/redis";

import { getDocument, PDFPageProxy, PDFDocumentProxy } from "pdfjs-dist";
import { aiModel } from "../utils/GeminiModel";
import { promptForContractRecognition, promptForReviewingContract } from "../utils/promptsForAI";
import { Impact, Severity } from "@prisma/client";

export class PDFProcessingError extends Error {
  cause: any;
  name: string;
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'PDFProcessingError';
    this.cause = cause;
  }
}

export interface Analysis {
  risks: { 
    risk: string; 
    riskDetails: string , 
    severity : Severity
    }[];
  opportunities: {
     opportunity: string; 
     opportunityDetails: string , 
     impact : Impact
    }[];
  summary: string;
  financialTerms : {description : string, details : string[]},
  clauses : string[];
  legalCompliance  : string;
  negotiationPoints : string[];
  overallScore : number;
  recommendations : string[];
  terminationConditions : string;
  contractDuration : string;
  performanceMetrics : string[];
  contractFinancialTerms : {
    description : "",
    details : string[]
  },
  compensationStructure : {
    baseSalary : string;
    bonuses : string;
    equity : string;
    otherBenefits : string;
  }
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
  contractType: string
): Promise<Partial<Analysis>> => {

  let prompt = `
 Analyze the following ${contractType} contract and provide:
1. A list of at least 10 potential risks for the party receiving the contract, each with a brief explanation and severity level (low, medium, high).
2. A list of at least 10 potential opportunities or benefits for the receiving party, each with a brief explanation and impact level (low, medium, high).
3. A comprehensive summary of the contract, including key terms and conditions, and a summary of any specific clauses relevant to this type of contract.
4. Any recommendations for improving the contract from the receiving party's perspective.
5. A list of key clauses in the contract.
6. An assessment of the contract's legal compliance.
7. A list of potential negotiation points.
8. The contract duration or term, if applicable.
9. A summary of termination conditions, if applicable.
10. A breakdown of any general financial terms, if applicable.
11. A breakdown of the compensation structure, including base salary, bonuses, equity, and other benefits, if applicable.
12. Any performance metrics or KPIs mentioned, if applicable.
13. An overall score from 1 to 100, with 100 being the highest. This score represents the overall favorability of the contract based on the identified risks and opportunities.

Format your response as a JSON object with the following structure:
{
"risks": [{"risk": "Risk description", "riskDetails": "Brief explanation", "severity": "LOW" | "MEDIUM" | "HIGH"}],
"opportunities": [{"opportunity": "Opportunity description", "opportunityDetails": "Brief explanation", "impact": "LOW" | "MEDIUM" | "HIGH"}],
"summary": "Comprehensive summary of the contract",
"recommendations": ["Recommendation 1", "Recommendation 2", ...],
"clauses": ["Clause 1", "Clause 2", ...],
"legalCompliance": "Assessment of legal compliance",
"negotiationPoints": ["Point 1", "Point 2", ...],
"contractDuration": "Duration of the contract, if applicable",
"terminationConditions": "Summary of termination conditions, if applicable",
"overallScore": 65,
"contractFinancialTerms": {
"description": "Overview of general financial terms",
"details": ["Detail 1", "Detail 2", ...]
},
"compensationStructure": {
"baseSalary": "value or null",
"bonuses": "value or null",
"equity": "value or null",
"otherBenefits": "value or null"
},
"performanceMetrics": ["Metric 1", "Metric 2", ...]
}
  `;

  prompt += `
Important: Provide only the JSON object in your response, without any additional text or formatting.
Contract text:
  ${contractText}
  `;

  const results = await aiModel.generateContent(prompt);

  let text = results.response.text();

  // Check for AI model errors like recitation blocks
  if (!text) {
    throw new PDFProcessingError("Could not analyze contract: No response from AI model");
  }

  if (text.startsWith("[GoogleGenerativeAI Error]: ")) {
    throw new PDFProcessingError(`AI model error: ${text.split('\n')[0]}`);
  }


  
  text = text.replace(/```json\n?|\n?```/g, "").trim();

  try {
   
    return JSON.parse(text) as Analysis;

  } catch (error : any) {
 

    // If parsing fails, apply regex modifications and try again
    text = text
      .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3') // Quote keys
      .replace(/:\s*([^"][^,}\]\n]*)(?=[,}\]])/g, ': "$1"') // Quote unquoted string values
      .replace(/,\s*([}\]])/g, "$1"); // Remove trailing commas

    try {
      return JSON.parse(text) as Analysis;
    } catch (error : any) {
    

      const fallback: Partial<Analysis> = {
        risks: [],
        opportunities: [],
        summary: "Error analyzing contract",
      };

  
      // Parse risks
      fallback.risks = (text.match(/"risks"\s*:\s*\[([\s\S]*?)\]/)?.[1]?.split("},") || []).map((item) => {
        const riskMatch = item.match(/"risk"\s*:\s*"([^"]*)"/i);
        const explanationMatch = item.match(/"explanation"\s*:\s*"([^"]*)"/i);
        const severityMatch  = item.match(/"severity"\s*:\s*"([^"]*)"/i);
        return {
          risk: riskMatch?.[1] || "Unknown",
          riskDetails: explanationMatch?.[1] || "Unknown",
          severity : severityMatch?.[1] as Severity || "Unknown",
        };
      });

     
      // Parse opportunities
      fallback.opportunities = (text.match(/"opportunities"\s*:\s*\[([\s\S]*?)\]/)?.[1]?.split("},") || []).map((item) => {
        const opportunityMatch = item.match(/"opportunity"\s*:\s*"([^"]*)"/i);
        const explanationMatch = item.match(/"explanation"\s*:\s*"([^"]*)"/i);
        const impactMatch = item.match(/"impact"\s*:\s*"([^"]*)"/i);
        return {
          opportunity: opportunityMatch?.[1] || "Unknown",
          opportunityDetails: explanationMatch?.[1] || "Unknown",
          impact : impactMatch?.[1] as Impact|| "Unknown",
        };
      });

      const summaryMatch = text.match(/"summary"\s*:\s*"([^"]*)"/);
      if (summaryMatch) fallback.summary = summaryMatch[1];

      return fallback;
    }
  }
};






const reviewContractWithAI2 = async (
  contractText: string,
  contractType: string,
  max_retries: number = 3
): Promise<Partial<Analysis>> => {
  const generatePrompt = (text: string) => `
    Analyze the following ${contractType} contract and provide:
    1. A list of at least 10 potential risks for the party receiving the contract, each with a brief explanation and severity level (low, medium, high).
    2. A list of at least 10 potential opportunities or benefits for the receiving party, each with a brief explanation and impact level (low, medium, high).
    3. A comprehensive summary of the contract, including key terms and conditions, and a summary of any specific clauses relevant to this type of contract.
    4. Any recommendations for improving the contract from the receiving party's perspective.
    5. A list of key clauses in the contract.
    6. An assessment of the contract's legal compliance.
    7. A list of potential negotiation points.
    8. The contract duration or term, if applicable.
    9. A summary of termination conditions, if applicable.
    10. A breakdown of any general financial terms, if applicable.
    11. A breakdown of the compensation structure, including base salary, bonuses, equity, and other benefits, if applicable.
    12. Any performance metrics or KPIs mentioned, if applicable.
    13. An overall score from 1 to 100, with 100 being the highest.

    Format your response as a JSON object with the specified structure.
    Contract text: ${text}
  `;

  const parseResponse = (text: string): Partial<Analysis> => {
    try {
      const cleanedText = text
        .replace(/```json\n?|\n?```/g, "")
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
        .replace(/:\s*([^"][^,}\]\n]*)(?=[,}\]])/g, ': "$1"')
        .replace(/,\s*([}\]])/g, "$1")
        .trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('JSON Parse Error:', error);
      return {
        risks: [],
        opportunities: [],
        summary: "Error analyzing contract",
      };
    }
  };

  let attempts = 0;
  while (attempts < max_retries) {
    try {
      const prompt = generatePrompt(contractText);
      const results = await aiModel.generateContent(prompt);
      
      if (!results.response?.text()) {
        throw new Error("Empty response from AI model");
      }

      const responseText = results.response.text();
      return parseResponse(responseText);

    } catch (error: any) {
      attempts++;
      
      if (error.message.includes("RECITATION") && attempts < max_retries) {
        console.warn(`Recitation error detected, retrying (${attempts + 1}/ ${max_retries})`);
        await new Promise((resolve) => setTimeout(() => resolve(null), 1000 * Math.pow(2, attempts))); // Exponential backoff
        continue;
      }

      console.error(`Analysis failed after ${attempts} attempts:`, error);
      
      return {
        risks: [],
        opportunities: [],
        summary: `Contract analysis failed: ${error.message}`
      };
    }
  }

  return {
    risks: [],
    opportunities: [],
    summary: "Contract analysis failed after maximum retries"
  };
};