"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewContractWithAI = exports.recognizeContractType = exports.retrieveTextFromPDF = void 0;
const redis_1 = __importDefault(require("../config/redis"));
const pdfjs_dist_1 = require("pdfjs-dist");
const generative_ai_1 = require("@google/generative-ai");
const promptsForAI_1 = require("../utils/promptsForAI");
const AI_MODEL = 'gemini-1.5-flash';
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_KEY);
// const aiModel = genAI.getGenerativeModel({ model: AI_MODEL });
const aiModel = genAI.getGenerativeModel({ model: AI_MODEL });
class PDFProcessingError extends Error {
    constructor(message, cause) {
        super(message);
        this.name = 'PDFProcessingError';
        this.cause = cause;
    }
}
const toUint8Array = (fileInfo) => {
    if (Buffer.isBuffer(fileInfo)) {
        return new Uint8Array(fileInfo);
    }
    if (typeof fileInfo === 'object' && fileInfo !== null) {
        const bufferData = fileInfo;
        if (bufferData.type === 'Buffer' && Array.isArray(bufferData.data)) {
            return new Uint8Array(bufferData.data);
        }
    }
    throw new PDFProcessingError('Invalid file data format');
};
const extractTextFromPDF = (pdf) => __awaiter(void 0, void 0, void 0, function* () {
    const textLines = [];
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = yield pdf.getPage(i);
        const content = yield page.getTextContent();
        const pageText = content.items
            .map((item) => item.str)
            .join(' ');
        textLines.push(pageText);
    }
    return textLines.join('\n');
});
const retrieveTextFromPDF = (fileKey) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate input
    if (typeof fileKey !== 'string' || fileKey.trim() === '') {
        throw new PDFProcessingError('File key must be a non-empty string');
    }
    try {
        // Fetch file data from Redis
        const fileInfo = yield redis_1.default.get(fileKey);
        if (!fileInfo) {
            throw new PDFProcessingError('File not found in Redis');
        }
        // Convert to Uint8Array
        const fileBuffer = toUint8Array(fileInfo);
        // Load PDF document
        const pdf = yield (0, pdfjs_dist_1.getDocument)({ data: fileBuffer }).promise;
        // Extract and return text
        return yield extractTextFromPDF(pdf);
    }
    catch (error) {
        // Wrap and rethrow errors with context
        if (error instanceof PDFProcessingError) {
            throw error; // Already a custom error
        }
        throw new PDFProcessingError('Failed to extract text from PDF', error);
    }
});
exports.retrieveTextFromPDF = retrieveTextFromPDF;
const recognizeContractType = (contractText) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const prompt = (0, promptsForAI_1.promptForContractRecognition)(contractText);
        const results = yield aiModel.generateContent(prompt);
        if (!results)
            throw new Error(`Error Could not generate results with AI`);
        const response = results.response;
        return response.text().trim();
    }
    catch (error) {
        throw new Error(`Error is : ${error.message}`);
    }
});
exports.recognizeContractType = recognizeContractType;
//@ts-ignore
const reviewContractWithAI = (contractText, tier, contractType) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
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
    const results = yield aiModel.generateContent(prompt);
    if (!results)
        throw new Error("Could not analyze!");
    let text = results.response.text()
        .replace(/```json\n?|\n?```/g, "")
        .trim();
    try {
        // First, try to parse without any modifications
        return JSON.parse(text);
    }
    catch (error) {
        // If parsing fails, apply regex modifications and try again
        text = text
            .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3') // Quote keys
            .replace(/:\s*([^"][^,}\]\n]*)(?=[,}\]])/g, ': "$1"') // Quote unquoted string values
            .replace(/,\s*([}\]])/g, "$1"); // Remove trailing commas
        try {
            return JSON.parse(text);
        }
        catch (error) {
            console.error(`Error parsing JSON after modifications: ${error.message}`);
            const fallback = {
                risks: [],
                opportunities: [],
                summary: "Error analyzing contract",
            };
            //@ts-ignore
            // Parse risks
            fallback.risks = (((_b = (_a = text.match(/"risks"\s*:\s*\[([\s\S]*?)\]/)) === null || _a === void 0 ? void 0 : _a[1]) === null || _b === void 0 ? void 0 : _b.split("},")) || []).map((item) => {
                const riskMatch = item.match(/"risk"\s*:\s*"([^"]*)"/i);
                const explanationMatch = item.match(/"explanation"\s*:\s*"([^"]*)"/i);
                const severityMatch = item.match(/"severity"\s*:\s*"([^"]*)"/i);
                return {
                    risk: (riskMatch === null || riskMatch === void 0 ? void 0 : riskMatch[1]) || "Unknown",
                    riskDetails: (explanationMatch === null || explanationMatch === void 0 ? void 0 : explanationMatch[1]) || "Unknown",
                    severity: (severityMatch === null || severityMatch === void 0 ? void 0 : severityMatch[1]) || "Unknown",
                };
            });
            //@ts-ignore
            // Parse opportunities
            fallback.opportunities = (((_d = (_c = text.match(/"opportunities"\s*:\s*\[([\s\S]*?)\]/)) === null || _c === void 0 ? void 0 : _c[1]) === null || _d === void 0 ? void 0 : _d.split("},")) || []).map((item) => {
                const opportunityMatch = item.match(/"opportunity"\s*:\s*"([^"]*)"/i);
                const explanationMatch = item.match(/"explanation"\s*:\s*"([^"]*)"/i);
                const impactMatch = item.match(/"impact"\s*:\s*"([^"]*)"/i);
                return {
                    opportunity: (opportunityMatch === null || opportunityMatch === void 0 ? void 0 : opportunityMatch[1]) || "Unknown",
                    opportunityDetails: (explanationMatch === null || explanationMatch === void 0 ? void 0 : explanationMatch[1]) || "Unknown",
                    impact: (impactMatch === null || impactMatch === void 0 ? void 0 : impactMatch[1]) || "Unknown",
                };
            });
            const summaryMatch = text.match(/"summary"\s*:\s*"([^"]*)"/);
            if (summaryMatch)
                fallback.summary = summaryMatch[1];
            return fallback;
        }
    }
});
exports.reviewContractWithAI = reviewContractWithAI;
