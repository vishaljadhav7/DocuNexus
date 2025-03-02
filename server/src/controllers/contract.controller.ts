import { Request, Response } from "express";
import multer from "multer";
import { getUuid } from "pdfjs-dist/types/src/shared/util";
import redis from "../config/redis";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { 
    retrieveTextFromPDF, 
    reviewContractWithAI, 
    recognizeContractType
} from "../services/ai.services";

import { Opportunity, PrismaClient, Risk , User} from "@prisma/client";
// import { Analysis } from "../services/ai.services";

// @ts-nocheck

const prisma = new PrismaClient();

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(null, false);
        cb(new Error("Only pdf files are allowed"));
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
     if(!req.file) throw new Error("No file uploaded!");
       
     const fileKey = `file:${user.id}:${getUuid()}`;
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
      
      const fileKey = `file:${user.id}:${getUuid()}`;
      await redis.set(fileKey, req.file.buffer);
      await redis.expire(fileKey, 3600);

      const textualPdf = await retrieveTextFromPDF(fileKey);
      let analysis;
      
      if (user.isPremium) {
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
            contractType ,
            summary : analysis.summary,
            aiModel : "gemini-pro",
            version : 1,
            overallScore : 75 
        }
      })
      
      if(!newContractReview) throw new Error("contract analysis failed");
      
      const {risks, opportunities} = analysis
  
      const riskData  = risks.map((risk) => ({...risk, contractReviewId : newContractReview.id , severity : "LOW"}));

      const opportunitiesData = opportunities.map((opportuniy) => ({...opportuniy, contractReviewId : newContractReview.id, impact : "LOW"}))

      //@ts-ignore
      const allRisks = await prisma.risk.createMany({ data : {riskData} })

     //@ts-ignore
      const allOpportunities = await prisma.opportunity.createMany({ data : [opportunitiesData]})

      
       
      console.log(riskData, opportunitiesData);

      res.status(200).json({data : newContractReview})
       
     } catch (error : any) {
        console.error(`${error.message}`)
     }
  }