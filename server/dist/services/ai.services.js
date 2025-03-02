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
const AI_MODEL = "gemini-pro";
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_KEY);
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
const reviewContractWithAI = (contractText, tier, contractType) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const prompt = `${(0, promptsForAI_1.promptForReviewingContract)(tier, contractType)}\n` +
        `Important: Provide only the JSON object in your response, without any additional text or formatting.\n` +
        `Contract text:\n${contractText}`;
    const results = yield aiModel.generateContent(prompt);
    if (!results)
        throw new Error("Could not analyze!");
    let text = results.response.text()
        .replace(/```json\n?|\n?```/g, "")
        .trim();
    try {
        text = text
            .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3') // Quote keys
            .replace(/:\s*([^"][^,}\]\n]*)(?=[,}\]])/g, ': "$1"') // Quote unquoted string values
            .replace(/,\s*([}\]])/g, "$1"); // Remove trailing commas
        return JSON.parse(text);
    }
    catch (error) {
        console.error(`Error parsing JSON: ${error.message}`);
        const fallback = {
            risks: [],
            opportunities: [],
            summary: "Error analyzing contract",
        };
        // Parse risks
        fallback.risks = (((_b = (_a = text.match(/"risks"\s*:\s*\[([\s\S]*?)\]/)) === null || _a === void 0 ? void 0 : _a[1]) === null || _b === void 0 ? void 0 : _b.split("},")) || []).map((item) => {
            const riskMatch = item.match(/"risk"\s*:\s*"([^"]*)"/i);
            const explanationMatch = item.match(/"explanation"\s*:\s*"([^"]*)"/i);
            return {
                risk: (riskMatch === null || riskMatch === void 0 ? void 0 : riskMatch[1]) || "Unknown",
                riskDetails: (explanationMatch === null || explanationMatch === void 0 ? void 0 : explanationMatch[1]) || "Unknown",
            };
        });
        // Parse opportunities
        fallback.opportunities = (((_d = (_c = text.match(/"opportunities"\s*:\s*\[([\s\S]*?)\]/)) === null || _c === void 0 ? void 0 : _c[1]) === null || _d === void 0 ? void 0 : _d.split("},")) || []).map((item) => {
            const opportunityMatch = item.match(/"opportunity"\s*:\s*"([^"]*)"/i);
            const explanationMatch = item.match(/"explanation"\s*:\s*"([^"]*)"/i);
            return {
                opportunity: (opportunityMatch === null || opportunityMatch === void 0 ? void 0 : opportunityMatch[1]) || "Unknown",
                opportunityDetails: (explanationMatch === null || explanationMatch === void 0 ? void 0 : explanationMatch[1]) || "Unknown",
            };
        });
        const summaryMatch = text.match(/"summary"\s*:\s*"([^"]*)"/);
        if (summaryMatch)
            fallback.summary = summaryMatch[1];
        return fallback;
    }
});
exports.reviewContractWithAI = reviewContractWithAI;
