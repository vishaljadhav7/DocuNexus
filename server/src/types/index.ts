// src/types.ts
import { Session } from 'express-session';
import { Severity, Impact } from '@prisma/client';

// User model type
export interface User {
  id: string;
  userName: string;
  emailId: string;
  password: string;
  profilePic: string;
  isPremium: boolean;
}

// Request body types
export interface SignupRequestBody {
  userName: string;
  emailId: string;
  password: string;
  isPremium?: boolean;
}

export interface SigninRequestBody {
  emailId: string;
  password: string;
}

// Extend express-session with custom properties
declare module 'express-session' {
  interface SessionData {
    userId: string;
    emailId?: string;
  }
}


export interface ContractAnalysis {
  risks: { 
    risk: string; 
    riskDetails: string , 
    severity : Severity
    }[];
  opportunities: {
     opportunity: string; 
     opportunityDetails: string , 
     impact : Impact
    }[];
  summary: string;
  financialTerms : {description : string, details : string[]},
  clauses : string[];
  legalCompliance  : string;
  negotiationPoints : string[];
  overallScore : number;
  recommendations : string[];
  terminationConditions : string;
  contractDuration : string;
  performanceMetrics : string[];
  contractFinancialTerms : {
    description : "",
    details : string[]
  },
  compensationStructure : {
    baseSalary : string;
    bonuses : string;
    equity : string;
    otherBenefits : string;
  }
}



export interface Risk {
    risk: string; 
    riskDetails: string , 
    severity : Severity
}

export interface Opportunity {
     opportunity: string; 
     opportunityDetails: string , 
     impact : Impact
}

export interface CreateContractReviewDto {
  userId: string;
  contractText: string;
  contractType: string;
  analysis: ContractAnalysis;
}



