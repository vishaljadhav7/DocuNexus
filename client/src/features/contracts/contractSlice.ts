import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ContractState {
  analysisResults: any;
}

const initialState: ContractState = {
  analysisResults: undefined,
};

const contractSlice = createSlice({
  name: 'contract',
  initialState,
  reducers: {
    setAnalysisResults: (state, action: PayloadAction<any>) => {
      state.analysisResults = action.payload;
    },
  },
});

export const { setAnalysisResults } = contractSlice.actions;
export default contractSlice.reducer;