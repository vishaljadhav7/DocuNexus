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
exports.getAllContracts = exports.getContractById = exports.reviewContract = exports.recognizeAndConfirmContractType = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const redis_1 = __importDefault(require("../config/redis"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const ai_services_1 = require("../services/ai.services");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        }
        else {
            cb(null, false);
            // cb(new Error("Only pdf files are allowed"));
        }
    },
}).single("contract");
exports.uploadMiddleware = upload;
const recognizeAndConfirmContractType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!req.file) {
            throw new Error("No file uploaded!");
        }
        ;
        const fileKey = `file:${user.id}:${Date.now()}`;
        yield redis_1.default.set(fileKey, req.file.buffer);
        yield redis_1.default.expire(fileKey, 3600);
        const textualPdf = yield (0, ai_services_1.retrieveTextFromPDF)(fileKey);
        const recognizedType = yield (0, ai_services_1.recognizeContractType)(textualPdf);
        yield redis_1.default.del(fileKey);
        res.status(201).json(new ApiResponse_1.default(200, recognizedType, "type detected successfully"));
    }
    catch (error) {
        res.status(400).json(new ApiError_1.default(400, `Error : ${error.message}`));
    }
});
exports.recognizeAndConfirmContractType = recognizeAndConfirmContractType;
const reviewContract = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const user = req.user;
        const { contractType } = req.body;
        if (!req.file)
            throw new Error("No file uploaded!");
        if (!contractType)
            throw new Error("No contract type provided!");
        const fileKey = `file:${user.id}:${Date.now()}`;
        yield redis_1.default.set(fileKey, req.file.buffer);
        yield redis_1.default.expire(fileKey, 3600);
        const textualPdf = yield (0, ai_services_1.retrieveTextFromPDF)(fileKey);
        let analysis;
        if (!user.isPremium) {
            analysis = yield (0, ai_services_1.reviewContractWithAI)(textualPdf, "premium", contractType);
        }
        else {
            analysis = yield (0, ai_services_1.reviewContractWithAI)(textualPdf, "free", contractType);
        }
        if (!analysis.summary || !analysis.risks || !analysis.opportunities) {
            throw new Error("Failed to analyze contract");
        }
        const newContractReview = yield prisma.contractReview.create({
            data: {
                userId: user.id,
                contractText: textualPdf,
                contractType,
                summary: analysis.summary,
                aiModel: "gemini-pro",
                version: 1,
                overallScore: analysis.overallScore || 0,
                recommendations: analysis.recommendations,
                clauses: analysis.clauses,
                negotiationPoints: analysis.negotiationPoints,
                performanceMetrics: analysis.performanceMetrics,
                contractFinancialTerms: {
                    create: {
                        description: ((_a = analysis.contractFinancialTerms) === null || _a === void 0 ? void 0 : _a.description) || "",
                        details: (_b = analysis.contractFinancialTerms) === null || _b === void 0 ? void 0 : _b.details
                    }
                },
                compensationStructure: {
                    create: {
                        baseSalary: (_c = analysis.compensationStructure) === null || _c === void 0 ? void 0 : _c.baseSalary,
                        bonuses: (_d = analysis.compensationStructure) === null || _d === void 0 ? void 0 : _d.bonuses,
                        equity: (_e = analysis.compensationStructure) === null || _e === void 0 ? void 0 : _e.equity,
                        otherBenefits: (_f = analysis.compensationStructure) === null || _f === void 0 ? void 0 : _f.otherBenefits
                    }
                },
                terminationConditions: analysis.terminationConditions,
            }
        });
        if (!newContractReview)
            throw new Error("contract not updated in db");
        const { risks, opportunities } = analysis;
        const risksData = risks.map((risk) => (Object.assign(Object.assign({}, risk), { contractReviewId: newContractReview.id, severity: risk.severity })));
        const opportunitiesData = opportunities.map((opportunity) => (Object.assign(Object.assign({}, opportunity), { contractReviewId: newContractReview.id, impact: opportunity.impact })));
        yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            yield tx.risk.createMany({ data: risksData });
            yield tx.opportunity.createMany({ data: opportunitiesData });
        }));
        const reviewedContract = yield prisma.contractReview.findUnique({
            where: { id: newContractReview.id },
            include: { risks: true, opportunities: true }
        });
        res.status(200).json(new ApiResponse_1.default(200, reviewedContract, "contract fetched successfully!"));
    }
    catch (error) {
        console.error(`${error.message}`);
        res.status(200).json(`Error : ${error.message}`);
    }
});
exports.reviewContract = reviewContract;
const getContractById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const contractId = req.params.contractId;
        const contract = yield prisma.contractReview.findUnique({
            where: {
                userId: user.id,
                id: contractId
            }
        });
        if (!contract) {
            throw new Error("Could not fetch contract for given contractId");
        }
        res.status(201).json(new ApiResponse_1.default(201, contract, "contract fetched  for given contractId"));
    }
    catch (error) {
        res.status(401).json(new ApiError_1.default(401, `Error : ${error.message}`));
    }
});
exports.getContractById = getContractById;
const getAllContracts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const allContracts = yield prisma.contractReview.findMany({
            where: {
                userId: user.id,
            }
        });
        if (!allContracts.length) {
            throw new Error("Could not fetch contract for given contractId");
        }
        res.status(201).json(new ApiResponse_1.default(201, allContracts, "contract fetched  for given contractId"));
    }
    catch (error) {
        res.status(401).json(new ApiError_1.default(401, `Error : ${error.message}`));
    }
});
exports.getAllContracts = getAllContracts;
