import { ContractService } from "../services/contract.service";
import { Request, Response, NextFunction } from "express";
import { User } from "@prisma/client";
import ApiResponse from "../utils/apiResponse.utils";
import {
  BadRequestError,
  UnauthorizedError
} from "../utils/error.utils";

export class ContractController {
  constructor(private contractService: ContractService) {
    this.contractService = contractService;
  }

  recognizeAndConfirmContractType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Validate authenticated user
      const user = req.user as User;
      if (!user || !user.id) {
        throw new UnauthorizedError("User authentication required");
      }

      // Validate file upload
      if (!req.file) {
        throw new BadRequestError("No file uploaded - please provide a PDF file");
      }

      if (!req.file.buffer || req.file.buffer.length === 0) {
        throw new BadRequestError("Uploaded file is empty or corrupted");
      }

      // Validate file type (optional but recommended)
      if (req.file.mimetype !== 'application/pdf') {
        throw new BadRequestError("Only PDF files are supported");
      }

      
      const maxSize = 10 * 1024 * 1024; // Validate file size - 10MB
      if (req.file.buffer.length > maxSize) {
        throw new BadRequestError("File size exceeds maximum limit of 10MB");
      }

      const recognizedType = await this.contractService.recognizeContractType(
        user.id,
        req.file.buffer
      );

      res.status(200).json(
        new ApiResponse(200, recognizedType, "Contract type detected successfully")
      );
    } catch (error: any) {
      next(error);
    }
  };

  reviewContract = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate authenticated user
      const user = req.user as User;
      if (!user || !user.id) {
        throw new UnauthorizedError("User authentication required");
      }

      // Validate file upload
      if (!req.file) {
        throw new BadRequestError("No file uploaded - please provide a PDF file");
      }

      if (!req.file.buffer || req.file.buffer.length === 0) {
        throw new BadRequestError("Uploaded file is empty or corrupted");
      }

      // Validate file type
      if (req.file.mimetype !== 'application/pdf') {
        throw new BadRequestError("Only PDF files are supported");
      }

      // Validate file size
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (req.file.buffer.length > maxSize) {
        throw new BadRequestError("File size exceeds maximum limit of 10MB");
      }

      // Validate contract type
      const { contractType } = req.body;
      if (!contractType || typeof contractType !== 'string' || contractType.trim() === '') {
        throw new BadRequestError("Contract type is required and must be a non-empty string");
      }

      const reviewedContract = await this.contractService.reviewContract(
        user.id,
        req.file.buffer,
        contractType.trim()
      );

      res.status(201).json(
        new ApiResponse(201, reviewedContract, "Contract analyzed successfully")
      );
    } catch (error: any) {
      next(error);
    }
  };

  getContracts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate authenticated user
      const user = req.user as User;
      if (!user || !user.id) {
        throw new UnauthorizedError("User authentication required");
      }

      const userContracts = await this.contractService.getUserContracts(user.id);

      res.status(200).json(
        new ApiResponse(
          200, 
          userContracts, 
          "Contracts fetched successfully"
        )
      );
    } catch (error: any) {
      next(error);
    }
  };

  getContractById = async (
    req: Request<{ contractId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Validate authenticated user
      const user = req.user as User;
      if (!user || !user.id) {
        throw new UnauthorizedError("User authentication required");
      }

      // Validate contract ID parameter
      const { contractId } = req.params;
      if (!contractId || typeof contractId !== 'string' || contractId.trim() === '') {
        throw new BadRequestError("Contract ID is required and must be a valid string");
      }

      const contract = await this.contractService.getContractById(contractId.trim());

      // Optional: Add authorization check to ensure user can only access their own contracts
      if (contract.userId !== user.id) {
        throw new UnauthorizedError("You are not authorized to access this contract");
      }

      res.status(200).json(
        new ApiResponse(200, contract, "Contract fetched successfully")
      );
    } catch (error: any) {
      next(error);
    }
  };

  deleteContract = async (
    req: Request<{ contractId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Validate authenticated user
      const user = req.user as User;
      if (!user || !user.id) {
        throw new UnauthorizedError("User authentication required");
      }

      // Validate contract ID parameter
      const { contractId } = req.params;
      if (!contractId || typeof contractId !== 'string' || contractId.trim() === '') {
        throw new BadRequestError("Contract ID is required and must be a valid string");
      }

      // First check if contract exists and belongs to user
      const existingContract = await this.contractService.getContractById(contractId.trim());
      
      if (existingContract.userId !== user.id) {
        throw new UnauthorizedError("You are not authorized to delete this contract");
      }

      const deletedContract = await this.contractService.deleteContract(contractId.trim());

      res.status(200).json(
        new ApiResponse(200, { deletedContract }, "Contract deleted successfully")
      );
    } catch (error: any) {
      next(error);
    }
  };

  // Additional utility method for health check or testing
  healthCheck = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json(
        new ApiResponse(200, { status: "OK", timestamp: new Date().toISOString() }, "Contract service is running")
      );
    } catch (error: any) {
      next(error);
    }
  };
}