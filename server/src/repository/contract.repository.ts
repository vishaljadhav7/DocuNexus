import { PrismaClient, ContractReview } from "@prisma/client";
import { CreateContractReviewDto, Risk, Opportunity } from "../types";
import { prisma } from "../utils/clients.utils";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../utils/error.utils";

export class ContractRepository {
  async createContractReview(data: CreateContractReviewDto): Promise<ContractReview> {
    // Input validation
    if (!data || typeof data !== 'object') {
      throw new BadRequestError("Contract review data is required");
    }

    const { analysis, userId, contractText, contractType } = data;

    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestError("User ID must be a non-empty string");
    }

    if (!contractText || typeof contractText !== 'string' || contractText.trim() === '') {
      throw new BadRequestError("Contract text must be a non-empty string");
    }

    if (!contractType || typeof contractType !== 'string' || contractType.trim() === '') {
      throw new BadRequestError("Contract type must be a non-empty string");
    }

    if (!analysis || typeof analysis !== 'object') {
      throw new BadRequestError("Contract analysis data is required");
    }

    if (!analysis.summary || typeof analysis.summary !== 'string') {
      throw new BadRequestError("Analysis summary is required");
    }

    try {
      const contractReview = await prisma.contractReview.create({
        data: {
          userId,
          contractText,
          contractType,
          summary: analysis.summary,
          aiModel: "gemini-pro",
          version: 1,
          overallScore: analysis.overallScore || 0,
          recommendations: analysis.recommendations,
          clauses: analysis.clauses,
          negotiationPoints: analysis.negotiationPoints,
          performanceMetrics: analysis.performanceMetrics,
          contractFinancialTerms: analysis.contractFinancialTerms ? {
            create: {
              description: analysis.contractFinancialTerms.description || "",
              details: analysis.contractFinancialTerms.details
            }
          } : undefined,
          compensationStructure: analysis.compensationStructure ? {
            create: {
              baseSalary: analysis.compensationStructure.baseSalary,
              bonuses: analysis.compensationStructure.bonuses,
              equity: analysis.compensationStructure.equity,
              otherBenefits: analysis.compensationStructure.otherBenefits
            }
          } : undefined,
          terminationConditions: analysis.terminationConditions,
        }
      });

      return contractReview;
    } catch (error: any) {

      // P1008 -> InternalServerError Database operation timed out
      // P1008, P1001, P1002 -> InternalServerError Database connection failed
      // P2006, P2007 -> BadRequestError Invalid data format
      // P2025 -> NotFoundError Referenced record not found
      // P2003 -> BadRequestError Invalid user ID - user does not exist
      // P2002 -> ConflictError("A contract review with these details already exists");

      if (error.code === 'P1001' || error.code === 'P1002' || error.code === 'P1008') {
        throw new InternalServerError("Database connection failed - please try again later");
      }

      // Generic database error
      throw new InternalServerError(`Failed to create contract review: ${error.message}`);
    }
  }

  async createRisksAndOpportunities(
    contractReviewId: string,
    risks: Risk[],
    opportunities: Opportunity[]
  ): Promise<void> {
    // Input validation
    if (!contractReviewId || typeof contractReviewId !== 'string' || contractReviewId.trim() === '') {
      throw new BadRequestError("Contract review ID must be a non-empty string");
    }

    if (!Array.isArray(risks)) {
      throw new BadRequestError("Risks must be an array");
    }

    if (!Array.isArray(opportunities)) {
      throw new BadRequestError("Opportunities must be an array");
    }

    try {
      // Check if contract review exists
      const contractExists = await prisma.contractReview.findUnique({
        where: { id: contractReviewId },
        select: { id: true }
      });

      if (!contractExists) {
        throw new NotFoundError(`Contract review with ID ${contractReviewId} not found`);
      }

      const risksData = risks.map(risk => ({
        ...risk,
        contractReviewId,
        severity: risk.severity
      }));

      const opportunitiesData = opportunities.map(opportunity => ({
        ...opportunity,
        contractReviewId,
        impact: opportunity.impact
      }));

      await prisma.$transaction(async (tx) => {
        if (risksData.length > 0) {
          await tx.risk.createMany({ data: risksData });
        }
        if (opportunitiesData.length > 0) {
          await tx.opportunity.createMany({ data: opportunitiesData });
        }
      });
    } catch (error: any) {
      // Re-throw custom errors as-is
      if (
        error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }

      if (error.code === 'P1001' || error.code === 'P1002' || error.code === 'P1008') {
        throw new InternalServerError("Database connection failed - please try again later");
      }

      throw new InternalServerError(`Failed to create risks and opportunities: ${error.message}`);
    }
  }

  async findByIdWithRelations(id: string): Promise<ContractReview | null> {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new BadRequestError("Contract ID must be a non-empty string");
    }

    try {
      const contract = await prisma.contractReview.findUnique({
        where: { id },
        include: {
          compensationStructure: true,
          contractFinancialTerms: true,
          risks: true,
          opportunities: true,
        }
      });

      return contract;
    } catch (error: any) {
      // Handle connection errors
      if (error.code === 'P1001' || error.code === 'P1002' || error.code === 'P1008') {
        throw new InternalServerError("Database connection failed - please try again later");
      }

      if (error.code === 'P2023') {
        throw new BadRequestError("Invalid contract ID format");
      }

      // Generic database error
      throw new InternalServerError(`Failed to fetch contract: ${error.message}`);
    }
  }

  async findByUserId(userId: string): Promise<ContractReview[]> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestError("User ID must be a non-empty string");
    }

    try {
      const contracts = await prisma.contractReview.findMany({
        where: { userId }
      });

      return contracts;
    } catch (error: any) {
      // Handle connection errors
      if (error.code === 'P1001' || error.code === 'P1002' || error.code === 'P1008') {
        throw new InternalServerError("Database connection failed - please try again later");
      }

      // Handle invalid ID format
      if (error.code === 'P2023') {
        throw new BadRequestError("Invalid user ID format");
      }

      // Generic database error
      throw new InternalServerError(`Failed to fetch user contracts: ${error.message}`);
    }
  }

  async findAll(): Promise<ContractReview[]> {
    try {
      const contracts = await prisma.contractReview.findMany({});
      return contracts;
    } catch (error: any) {
      // Handle connection errors
      if (error.code === 'P1001' || error.code === 'P1002' || error.code === 'P1008') {
        throw new InternalServerError("Database connection failed - please try again later");
      }

      // Generic database error
      throw new InternalServerError(`Failed to fetch contracts: ${error.message}`);
    }
  }

  async deleteById(id: string): Promise<ContractReview> {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new BadRequestError("Contract ID must be a non-empty string");
    }

    try {
      // Check if contract exists first
      const existingContract = await prisma.contractReview.findUnique({
        where: { id },
        select: { id: true }
      });

      if (!existingContract) {
        throw new NotFoundError(`Contract with ID ${id} not found`);
      }

      const deletedContract = await prisma.contractReview.delete({
        where: { id }
      });

      return deletedContract;
    } catch (error: any) {
      // Re-throw custom errors as-is
      if (
        error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }

      // Handle Prisma-specific errors
      if (error.code === 'P2025') {
        throw new NotFoundError(`Contract with ID ${id} not found`);
      }

      if (error.code === 'P2023') {
        throw new BadRequestError("Invalid contract ID format");
      }

      // Handle connection errors
      if (error.code === 'P1001' || error.code === 'P1002' || error.code === 'P1008') {
        throw new InternalServerError("Database connection failed - please try again later");
      }

      // Generic database error
      throw new InternalServerError(`Failed to delete contract: ${error.message}`);
    }
  }

  async findReviewWithRelations(id: string): Promise<ContractReview | null> {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new BadRequestError("Contract review ID must be a non-empty string");
    }

    try {
      const contractReview = await prisma.contractReview.findUnique({
        where: { id },
        include: {
          risks: true,
          opportunities: true,
          compensationStructure: true,
          contractFinancialTerms: true
        }
      });

      return contractReview;
    } catch (error: any) {
      // Handle connection errors
      if (error.code === 'P1001' || error.code === 'P1002' || error.code === 'P1008') {
        throw new InternalServerError("Database connection failed - please try again later");
      }

      // Handle invalid ID format
      if (error.code === 'P2023') {
        throw new BadRequestError("Invalid contract review ID format");
      }

      // Generic database error
      throw new InternalServerError(`Failed to fetch contract review: ${error.message}`);
    }
  }
}