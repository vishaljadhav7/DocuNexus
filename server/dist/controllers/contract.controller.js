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
exports.reviewContract = exports.recognizeAndConfirmContractType = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const util_1 = require("pdfjs-dist/types/src/shared/util");
const redis_1 = __importDefault(require("../config/redis"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const ai_services_1 = require("../services/ai.services");
const client_1 = require("@prisma/client");
// import { Analysis } from "../services/ai.services";
// @ts-nocheck
const prisma = new client_1.PrismaClient();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        }
        else {
            cb(null, false);
            cb(new Error("Only pdf files are allowed"));
        }
    },
}).single("contract");
exports.uploadMiddleware = upload;
const recognizeAndConfirmContractType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!req.file)
            throw new Error("No file uploaded!");
        const fileKey = `file:${user.id}:${(0, util_1.getUuid)()}`;
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
    try {
        const user = req.user;
        const { contractType } = req.body;
        if (!req.file)
            throw new Error("No file uploaded!");
        if (!contractType)
            throw new Error("No contract type provided!");
        const fileKey = `file:${user.id}:${(0, util_1.getUuid)()}`;
        yield redis_1.default.set(fileKey, req.file.buffer);
        yield redis_1.default.expire(fileKey, 3600);
        const textualPdf = yield (0, ai_services_1.retrieveTextFromPDF)(fileKey);
        let analysis;
        if (user.isPremium) {
            analysis = yield (0, ai_services_1.reviewContractWithAI)(textualPdf, "premium", contractType);
        }
        else {
            analysis = yield (0, ai_services_1.reviewContractWithAI)(textualPdf, "free", contractType);
        }
        console.log(`!analysis.summary || !analysis.risks || !analysis.opportunities -<< >>-`, analysis);
        if (!analysis.summary || !analysis.risks || !analysis.opportunities) {
            throw new Error("Failed to analyze contract");
        }
        //   const newContractReview = await prisma.contractReview.create({
        //     data : {
        //         userId : user.id ,
        //         contractText : textualPdf,
        //         contractType ,
        //         summary : analysis.summary,
        //         aiModel : "gemini-pro",
        //         version : 1,
        //         overallScore : 75 
        //     }
        //   })
        //   if(!newContractReview) throw new Error("contract analysis failed");
        //   const {risks, opportunities} = analysis
        //   const riskData  = risks.map((risk) => ({...risk, contractReviewId : newContractReview.id , severity : "LOW"}));
        //   const opportunitiesData = opportunities.map((opportuniy) => ({...opportuniy, contractReviewId : newContractReview.id, impact : "LOW"}))
        //   //@ts-ignore
        //   const allRisks = await prisma.risk.createMany({ data : {riskData} })
        //  //@ts-ignore
        //   const allOpportunities = await prisma.opportunity.createMany({ data : [opportunitiesData]})
        //   console.log(riskData, opportunitiesData);
        //   res.status(200).json({data : newContractReview})
    }
    catch (error) {
        console.error(`${error.message}`);
    }
});
exports.reviewContract = reviewContract;
