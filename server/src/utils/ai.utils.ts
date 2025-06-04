import redis from "../config/redis";
import { ContractAnalysis as Analysis } from "../types";
import { getDocument, PDFPageProxy, PDFDocumentProxy } from "pdfjs-dist";
import { aiModel } from "./gemini.utils";
import {
  promptForContractRecognition,
  promptForReviewingContract,
} from "./prompt.utils";
import { Impact, Severity } from "@prisma/client";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "./error.utils";

interface BufferData {
  type?: string;
  data?: number[];
}

const toUint8Array = (fileInfo: unknown): Uint8Array => {
  if (Buffer.isBuffer(fileInfo)) {
    return new Uint8Array(fileInfo);
  }

  if (typeof fileInfo === "object" && fileInfo !== null) {
    const bufferData = fileInfo as BufferData;
    if (bufferData.type === "Buffer" && Array.isArray(bufferData.data)) {
      return new Uint8Array(bufferData.data);
    }
  }

  throw new BadRequestError(
    "Invalid file data format - file must be a valid buffer or buffer-like object"
  );
};

const extractTextFromPDF = async (pdf: PDFDocumentProxy): Promise<string> => {
  const textLines: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page: PDFPageProxy = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => (item as { str: string }).str)
      .join(" ");
    textLines.push(pageText);
  }
  return textLines.join("\n");
};

export const retrieveTextFromPDF = async (fileKey: string): Promise<string> => {
  // Input validation
  if (!fileKey || typeof fileKey !== "string" || fileKey.trim() === "") {
    throw new BadRequestError("File key must be a non-empty string");
  }

  try {
    // Fetch file data from Redis
    const fileInfo = await redis.get(fileKey);
    if (!fileInfo) {
      throw new NotFoundError(`File not found in storage with key: ${fileKey}`);
    }

    // Convert to Uint8Array
    const fileBuffer = toUint8Array(fileInfo);

    // Load PDF document
    const pdf = await getDocument({ data: fileBuffer }).promise;

    if (!pdf || pdf.numPages === 0) {
      throw new BadRequestError(
        "Invalid PDF file - document is empty or corrupted"
      );
    }

    // Extract and return text
    return await extractTextFromPDF(pdf);
  } catch (error: any) {
    // Re-throw custom errors as-is
    if (
      error instanceof BadRequestError ||
      error instanceof NotFoundError ||
      error instanceof InternalServerError
    ) {
      throw error;
    }

    // Wrap unknown errors
    throw new InternalServerError(`PDF processing failed: ${error.message}`);
  }
};

export const recognizeContractType = async (
  contractText: string
): Promise<string> => {
  if (
    !contractText ||
    typeof contractText !== "string" ||
    contractText.trim() === ""
  ) {
    throw new BadRequestError("Contract text must be a non-empty string");
  }

  if (contractText.length < 50) {
    throw new BadRequestError(
      "Contract text is too short for reliable type recognition (minimum 100 characters)"
    );
  }

  try {
    const prompt = promptForContractRecognition(contractText);

    const results = await aiModel.generateContent(prompt);

    if (!results || !results.response) {
      throw new InternalServerError(
        "AI model failed to generate a response for contract type recognition"
      );
    }

    const responseText = results.response.text();

    if (!responseText || responseText.trim() === "") {
      throw new InternalServerError(
        "AI model returned empty response for contract type recognition"
      );
    }

    const contractType = responseText.trim();

    // Basic validation of the response
    if (contractType.length > 50) {
      throw new InternalServerError(
        "AI model returned unusually long contract type - possible error in response"
      );
    }

    return contractType;
  } catch (error: any) {
    // Re-throw custom errors as-is
    if (
      error instanceof BadRequestError ||
      error instanceof InternalServerError
    ) {
      throw error;
    }

    throw new InternalServerError(
      `Contract type recognition failed: ${error.message}`
    );
  }
};

export const reviewContractWithAI = async (
  contractText: string,
  contractType: string
): Promise<Partial<Analysis>> => {
  if (
    !contractText ||
    typeof contractText !== "string" ||
    contractText.trim() === ""
  ) {
    throw new BadRequestError("Contract text must be a non-empty string");
  }

  if (
    !contractType ||
    typeof contractType !== "string" ||
    contractType.trim() === ""
  ) {
    throw new BadRequestError("Contract type must be a non-empty string");
  }

  if (contractText.length < 200) {
    throw new BadRequestError(
      "Contract text is too short for comprehensive analysis (minimum 200 characters)"
    );
  }

  let promptForGemini = promptForReviewingContract(contractType, contractText);

  try {
    const results = await aiModel.generateContent(promptForGemini);

    if (!results || !results.response) {
      throw new InternalServerError(
        "AI model failed to generate analysis response"
      );
    }

    let text = results.response.text();

    // Check for AI model errors
    if (!text || text.trim() === "") {
      throw new InternalServerError(
        "AI model returned empty analysis response"
      );
    }

    if (text.startsWith("[GoogleGenerativeAI Error]: ")) {
      const errorMessage = text.split("\n")[0];
      throw new InternalServerError(`AI model error: ${errorMessage}`);
    }

    // Clean the response
    text = text.replace(/```json\n?|\n?```/g, "").trim();

    try {
      const analysis = JSON.parse(text) as Analysis;

      // Validate the analysis structure
      if (!analysis.risks || !Array.isArray(analysis.risks)) {
        throw new InternalServerError(
          "AI analysis missing or invalid risks array"
        );
      }

      if (!analysis.opportunities || !Array.isArray(analysis.opportunities)) {
        throw new InternalServerError(
          "AI analysis missing or invalid opportunities array"
        );
      }

      if (!analysis.summary || typeof analysis.summary !== "string") {
        throw new InternalServerError("AI analysis missing or invalid summary");
      }

      return analysis;
    } catch (jsonError: any) {
      console.warn(
        "Initial JSON parsing failed, attempting recovery:",
        jsonError.message
      );

      // Attempt to fix common JSON issues
      text = text
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3') // Quote keys
        .replace(/:\s*([^"][^,}\]\n]*)(?=[,}\]])/g, ': "$1"') // Quote unquoted string values
        .replace(/,\s*([}\]])/g, "$1"); // Remove trailing commas

      try {
        const recoveredAnalysis = JSON.parse(text) as Analysis;

        // Validate recovered analysis
        if (!recoveredAnalysis.summary) {
          throw new InternalServerError("Recovered analysis missing summary");
        }

        return recoveredAnalysis;
      } catch (recoveryError: any) {
        console.error("JSON recovery failed, creating fallback analysis");

        // Create fallback analysis with parsed data where possible
        const fallback: Partial<Analysis> = {
          risks: [],
          opportunities: [],
          summary:
            "AI analysis completed with parsing issues - partial results available",
        };

        // Attempt to parse risks
        try {
          const risksMatch = text.match(/"risks"\s*:\s*\[([\s\S]*?)\]/);
          if (risksMatch) {
            fallback.risks = (risksMatch[1]?.split("},") || [])
              .map((item) => {
                const riskMatch = item.match(/"risk"\s*:\s*"([^"]*)"/i);
                const explanationMatch =
                  item.match(/"riskDetails"\s*:\s*"([^"]*)"/i) ||
                  item.match(/"explanation"\s*:\s*"([^"]*)"/i);
                const severityMatch = item.match(/"severity"\s*:\s*"([^"]*)"/i);

                return {
                  risk: riskMatch?.[1] || "Risk analysis incomplete",
                  riskDetails: explanationMatch?.[1] || "Details unavailable",
                  severity:
                    (severityMatch?.[1]?.toUpperCase() as Severity) || "MEDIUM",
                };
              })
              .filter((risk) => risk.risk !== "Risk analysis incomplete");
          }
        } catch (riskParseError) {
          console.error("Failed to parse risks from fallback text");
        }

        // Attempt to parse opportunities
        try {
          const opportunitiesMatch = text.match(
            /"opportunities"\s*:\s*\[([\s\S]*?)\]/
          );
          if (opportunitiesMatch) {
            fallback.opportunities = (opportunitiesMatch[1]?.split("},") || [])
              .map((item) => {
                const opportunityMatch = item.match(
                  /"opportunity"\s*:\s*"([^"]*)"/i
                );
                const explanationMatch =
                  item.match(/"opportunityDetails"\s*:\s*"([^"]*)"/i) ||
                  item.match(/"explanation"\s*:\s*"([^"]*)"/i);
                const impactMatch = item.match(/"impact"\s*:\s*"([^"]*)"/i);

                return {
                  opportunity:
                    opportunityMatch?.[1] || "Opportunity analysis incomplete",
                  opportunityDetails:
                    explanationMatch?.[1] || "Details unavailable",
                  impact:
                    (impactMatch?.[1]?.toUpperCase() as Impact) || "MEDIUM",
                };
              })
              .filter(
                (opp) => opp.opportunity !== "Opportunity analysis incomplete"
              );
          }
        } catch (oppParseError) {
          console.error("Failed to parse opportunities from fallback text");
        }

        // Try to extract summary
        const summaryMatch = text.match(/"summary"\s*:\s*"([^"]*)"/);
        if (summaryMatch && summaryMatch[1]) {
          fallback.summary = summaryMatch[1];
        }

        if (
          fallback.risks?.length === 0 &&
          fallback.opportunities?.length === 0
        ) {
          throw new InternalServerError(
            "Contract analysis failed - unable to extract meaningful results from AI response"
          );
        }

        return fallback;
      }
    }
  } catch (error: any) {
    if (
      error instanceof BadRequestError ||
      error instanceof InternalServerError
    ) {
      throw error;
    }

    throw new InternalServerError(`Contract analysis failed: ${error.message}`);
  }
};
