import { ContractRepository } from "../repository/contract.repository";
import redis from "../config/redis";
import { ContractAnalysis, CreateContractReviewDto } from "../types";
import { retrieveTextFromPDF, recognizeContractType, reviewContractWithAI } from "../utils/ai.utils";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError
} from "../utils/error.utils";

export class ContractService {
  constructor(
    private contractRepository: ContractRepository,
  ) {
    this.contractRepository = contractRepository;
  }

  async recognizeContractType(userId: string, fileBuffer: Buffer): Promise<string> {
 
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestError("User ID must be a non-empty string");
    }

    if (!fileBuffer || !Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
      throw new BadRequestError("File buffer must be a valid non-empty buffer");
    }

    const fileKey = await this.storeTemporaryFile(userId, fileBuffer, 3600);

    try {
      const textualPdf = await retrieveTextFromPDF(fileKey);
      const recognizedType = await recognizeContractType(textualPdf);
      return recognizedType;
    } catch (error: any) {

      if (
        error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }

      throw new InternalServerError(`Contract type recognition failed: ${error.message}`);
    } finally {
      await this.deleteFile(fileKey);
    }
  }

  async reviewContract(
    userId: string,
    fileBuffer: Buffer,
    contractType: string
  ) {
    // Input validation
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestError("User ID must be a non-empty string");
    }

    if (!fileBuffer || !Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
      throw new BadRequestError("File buffer must be a valid non-empty buffer");
    }

    if (!contractType || typeof contractType !== 'string' || contractType.trim() === '') {
      throw new BadRequestError("Contract type must be a non-empty string");
    }

    const fileKey = await this.storeTemporaryFile(userId, fileBuffer, 120);

    try {
      const textualPdf = await retrieveTextFromPDF(fileKey);
      const analysis = await reviewContractWithAI(textualPdf, contractType) as ContractAnalysis;

      this.validateAnalysis(analysis);

      const createDto: CreateContractReviewDto = {
        userId,
        contractText: textualPdf,
        contractType,
        analysis
      };

      const newContractReview = await this.contractRepository.createContractReview(createDto);

      await this.contractRepository.createRisksAndOpportunities(
        newContractReview.id,
        analysis.risks,
        analysis.opportunities
      );

      return await this.contractRepository.findReviewWithRelations(newContractReview.id);
    } catch (error: any) {
      // Re-throw custom errors from AI services and repository
      if (
        error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }

      // Handle unexpected errors
      throw new InternalServerError(`Contract review failed: ${error.message}`);
    } finally {
      await this.deleteFile(fileKey);
    }
  }

  async getUserContracts(userId: string) {
    // Input validation
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestError("User ID must be a non-empty string");
    }

    try {
      return await this.contractRepository.findByUserId(userId);
    } catch (error: any) {
      // Repository errors are already properly typed, so re-throw them
      if (
        error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }

      // Handle unexpected errors
      throw new InternalServerError(`Failed to fetch user contracts: ${error.message}`);
    }
  }

  async getContractById(contractId: string) {
    // Input validation
    if (!contractId || typeof contractId !== 'string' || contractId.trim() === '') {
      throw new BadRequestError("Contract ID must be a non-empty string");
    }

    try {
      const contract = await this.contractRepository.findByIdWithRelations(contractId);

      if (!contract) {
        throw new NotFoundError(`Contract with ID ${contractId} not found`);
      }

      return contract;
    } catch (error: any) {
      // Re-throw custom errors
      if (
        error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }

      // Handle unexpected errors
      throw new InternalServerError(`Failed to fetch contract: ${error.message}`);
    }
  }

  async deleteContract(contractId: string) {
    // Input validation
    if (!contractId || typeof contractId !== 'string' || contractId.trim() === '') {
      throw new BadRequestError("Contract ID must be a non-empty string");
    }

    try {
      return await this.contractRepository.deleteById(contractId);
    } catch (error: any) {
      // Repository errors are already properly typed, so re-throw them
      if (
        error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }

      // Handle unexpected errors
      throw new InternalServerError(`Failed to delete contract: ${error.message}`);
    }
  }

  private validateAnalysis(analysis: Partial<ContractAnalysis>): void {
    if (!analysis || typeof analysis !== 'object') {
      throw new BadRequestError("Analysis data is required");
    }

    if (!analysis.summary || typeof analysis.summary !== 'string' || analysis.summary.trim() === '') {
      throw new BadRequestError("Analysis summary is required and must be a non-empty string");
    }

    if (!analysis.risks || !Array.isArray(analysis.risks)) {
      throw new BadRequestError("Analysis risks must be an array");
    }

    if (!analysis.opportunities || !Array.isArray(analysis.opportunities)) {
      throw new BadRequestError("Analysis opportunities must be an array");
    }
  }

  async storeTemporaryFile(userId: string, fileBuffer: Buffer, expirationSeconds: number): Promise<string> {
    // Input validation
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestError("User ID must be a non-empty string");
    }

    if (!fileBuffer || !Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
      throw new BadRequestError("File buffer must be a valid non-empty buffer");
    }

    if (!expirationSeconds || typeof expirationSeconds !== 'number' || expirationSeconds <= 0) {
      throw new BadRequestError("Expiration seconds must be a positive number");
    }

    try {
      const fileKey = `file:${userId}:${Date.now()}`;
      await redis.set(fileKey, fileBuffer);
      await redis.expire(fileKey, expirationSeconds);
      return fileKey;
    } catch (error: any) {
      throw new InternalServerError(`Failed to store temporary file: ${error.message}`);
    }
  }

  async deleteFile(fileKey: string): Promise<void> {
    // Input validation
    if (!fileKey || typeof fileKey !== 'string' || fileKey.trim() === '') {
      throw new BadRequestError("File key must be a non-empty string");
    }

    try {
      await redis.del(fileKey);
    } catch (error: any) {
      // Log the error but don't throw since this is cleanup
      console.warn(`Failed to delete temporary file ${fileKey}: ${error.message}`);
    }
  }
}