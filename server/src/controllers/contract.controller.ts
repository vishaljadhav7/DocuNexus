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

import {User} from "@prisma/client";
import { prisma } from "../utils/clients";


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
    } finally {
      prisma.$disconnect()
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
      await redis.expire(fileKey, 120);

      const textualPdf = await retrieveTextFromPDF(fileKey);  
    
      const analysis = await reviewContractWithAI(textualPdf,  contractType);
     
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

        res.status(500).json(new ApiError(500, `Error: ${error.message}`));
     } finally {
      prisma.$disconnect()
    }
  }


  export const getContracts = async (req: Request, res: Response) => {
    try {
       const user : any = req.user;

       const all = await prisma.contractReview.findMany({});

       const userContracts = all.filter(contract => contract.userId === user.id);
    
      res.status(201).json(new ApiResponse(201, userContracts, "contracts fetched"))
    } catch (error : any) {
      res.status(401).json(new ApiError(401, `Error : ${error.message}`))
    } finally {
      prisma.$disconnect()
    }
  }


  export const getContractById = async (req : Request<{contractId : string}>, res : Response) => {
    try {
      const contractId = req.params.contractId;

      const contract =  await prisma.contractReview.findUnique({
        where : {
          id : contractId
        },
        include : {
          compensationStructure : true,
          contractFinancialTerms : true,
          risks : true,
          opportunities : true,
        }
      });

      if(!contract){
         throw new Error("Could not fetch contract for given contractId")   
      }

      res.status(201).json(new ApiResponse(201, contract, "contracts fetched"))
      
    } catch (error : any) {
      res.status(401).json(new ApiError(401, `Error : ${error.message}`))
    } finally {
      prisma.$disconnect()
    }
  } 

  export const deleteContract = async (req: Request<{contractId : string}>, res: Response) => {
    try{
      const contractId = req.params.contractId;
   
      const deletedContract = await prisma.contractReview.delete({
        where : {
          id : contractId
        }
      });
   
      res.status(201).json(new ApiResponse(201, deletedContract, "contract deleted successfully"));
    } catch (error : any) {
      console.log("error ", error) 
      res.status(401).json(new ApiError(401, "Could not delete contract"));
    } finally {
      prisma.$disconnect();  
    }
  }

  