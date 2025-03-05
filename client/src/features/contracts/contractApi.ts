// process.env.NEXT_PUBLIC_API_URL
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const contractApi = createApi({
  reducerPath : "contractApi",
  baseQuery : fetchBaseQuery ({ 
    baseUrl : "http://localhost:4000",
    credentials: 'include',     
  }),
  endpoints : (builder) => ({
    recognizeContractType : builder.mutation({
      query : (formData) => ({
        url : "/contract/recognize-type",
        method : "POST",
        body : formData,
      }),
      transformResponse: (res: {detectedType : string}) => {
        console.log("res  ", res)
        return res.data        
      },
    }),
    analyzeContract: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/contract/analyze',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (res: any) => {
        console.log("analyzeContract <<<<>>>>><<<>>>  ", res)
        return res.data        
      },
    }),
    
  })
});


export const {useRecognizeContractTypeMutation, useAnalyzeContractMutation} =  contractApi;

 

