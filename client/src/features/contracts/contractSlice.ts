import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Analysis {
  id ?: string;
  contractType : string;
  risks: { 
    risk: string; 
    riskDetails: string , 
    severity : "LOW" | "MEDIUM" |"HIGH" 
    }[];
  opportunities: {
     opportunity: string; 
     opportunityDetails: string , 
     impact : "LOW" | "MEDIUM" |"HIGH"
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


interface ContractState {
  analysisResults: Analysis | undefined;
}

const initialState: ContractState = {
  analysisResults: undefined,
};

const contractSlice = createSlice({
  name: 'contract',
  initialState,
  reducers: {
    setAnalysisResults: (state, action: PayloadAction<Analysis>) => {
      state.analysisResults = action.payload;
    }
  },
});

export const { setAnalysisResults } = contractSlice.actions;
export default contractSlice.reducer;