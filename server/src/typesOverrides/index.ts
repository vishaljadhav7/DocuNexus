

export interface User {
    googleId: string;
    emailId: string;
    userName: string;
    // password : string;
    profilePic: string;
    isPremium: boolean;
    userContractReviews? : IContractAnalysis[];
  }

  enum Severity {
   LOW,
   HIGH,
   MEDIUM
  }
  
  enum Impact {
    LOW,
    HIGH,
    MEDIUM
   }

  interface Risk {
    risk: string;
    riskDetails: string;
    severity: Severity; 
    contractReviewId : string;
  }
  
  interface Opportunity {
    opportunity: string;
    opportunityDetails: string;
    impact: Impact;
    contractReviewId : string;
  }
  
  interface CompensationStructure {
    baseSalary: string;
    bonuses: string;
    equity: string;
    otherBenefits: string;
    contractReviewId : string;
  }

  interface UserFeedback {
    rating: number;
    comments: string;
    contractReviewId : string;
  }

  interface FinancialTerms{
    description: string;
    details: string[];
    contractReviewId : string;
  }
  
  export interface IContractAnalysis {
    userId: string;
    contractText: string;
    contractType: string;
    summary: string;

    risks: Risk[];
    opportunities: Opportunity[];
    feedbacks?: UserFeedback[];

    compensationStructure: CompensationStructure;
    financialTerms?: FinancialTerms;

    recommendations: string[];
    clauses: string[];
    negotiationPoints: string[];
    performanceMetrics: string[];

    legalCompliance?: string;
    contractDuration?: string;
    terminationConditions?: string;

    overallScore:  number;


    // intellectualPropertyClauses: string | string[];
    createdAt: Date;
    expirationDate: Date;
    
    version: number;
    // customFields: { [key: string]: string };
    language: string;
    aiModel: string;

  }
  