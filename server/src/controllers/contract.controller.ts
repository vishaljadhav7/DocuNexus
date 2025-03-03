import { Request, Response } from "express";
import multer from "multer";
import redis from "../config/redis";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { 
    retrieveTextFromPDF, 
    reviewContractWithAI, 
    recognizeContractType
} from "../services/ai.services";

import {  PrismaClient , User} from "@prisma/client";

const prisma = new PrismaClient();

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(null, false);
        // cb(new Error("Only pdf files are allowed"));
      }
    },
  }).single("contract");

  export const uploadMiddleware = upload;

  export const recognizeAndConfirmContractType =  async (
    req: Request,
    res: Response
  ) => {
 
    try {
     const user = req.user as User;

     if(!req.file) {
      throw new Error("No file uploaded!")
     };
       
     const fileKey = `file:${user.id}:${Date.now()}`;
     await redis.set(fileKey, req.file.buffer);
     await redis.expire(fileKey, 3600);

     const textualPdf = await retrieveTextFromPDF(fileKey);
     const recognizedType = await recognizeContractType(textualPdf);

     await redis.del(fileKey);

     res.status(201).json(new ApiResponse(200, recognizedType, "type detected successfully"))

    } catch (error : any) {

      res.status(400).json(new ApiError(400, `Error : ${error.message}`))  
    }
  }


  export const reviewContract = async (req: Request, res: Response) => {
     try {
      const user  = req.user as User;
      const { contractType } = req.body; 

      if(!req.file) throw new Error("No file uploaded!");

      if(!contractType) throw new Error("No contract type provided!");
      
      const fileKey = `file:${user.id}:${Date.now()}`;
      await redis.set(fileKey, req.file.buffer);
      await redis.expire(fileKey, 3600);

      const textualPdf = await retrieveTextFromPDF(fileKey);

      let analysis ;
      if (!user.isPremium) {
        analysis = await reviewContractWithAI(textualPdf, "premium", contractType);
      } else {
        analysis = await reviewContractWithAI(textualPdf, "free", contractType);
      }
    

      if (!analysis.summary || !analysis.risks || !analysis.opportunities){
        throw new Error("Failed to analyze contract");
      }
    
      const newContractReview = await prisma.contractReview.create({
        data : {
            userId : user.id ,
            contractText : textualPdf,
            contractType,
            summary : analysis.summary,
            aiModel : "gemini-pro",
            version : 1,
            overallScore : analysis.overallScore || 0, 
            recommendations : analysis.recommendations,
            clauses : analysis.clauses,  
            negotiationPoints : analysis.negotiationPoints,
            performanceMetrics : analysis.performanceMetrics,
            contractFinancialTerms : {
              create : {
                description : analysis.contractFinancialTerms?.description || "",
                details : analysis.contractFinancialTerms?.details
              }
            },
            compensationStructure : {
               create : {
                baseSalary : analysis.compensationStructure?.baseSalary,
                bonuses : analysis.compensationStructure?.bonuses,
                equity : analysis.compensationStructure?.equity,
                otherBenefits : analysis.compensationStructure?.otherBenefits 
               } 
            },
            terminationConditions : analysis.terminationConditions,     
        }
      })
      
      if(!newContractReview) throw new Error("contract not updated in db");
      
      const {risks, opportunities} = analysis
  
      const risksData = risks.map((risk) => ({ ...risk, contractReviewId: newContractReview.id , severity : risk.severity}));
      const opportunitiesData = opportunities.map((opportunity) => ({ ...opportunity, contractReviewId: newContractReview.id , impact : opportunity.impact}));      

      await prisma.$transaction(async (tx) => {
      
          await tx.risk.createMany({ data: risksData });
     
          await tx.opportunity.createMany({ data: opportunitiesData });
      });
      
      const reviewedContract = await prisma.contractReview.findUnique({
          where: { id: newContractReview.id },
          include: { risks: true, opportunities: true }
      });
      res.status(200).json(new ApiResponse(200, reviewedContract, "contract fetched successfully!"))
       
     } catch (error : any) {
        console.error(`${error.message}`)
        res.status(200).json(`Error : ${error.message}`)
     }
  }