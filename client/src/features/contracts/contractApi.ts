import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Analysis } from "./contractSlice";

export const contractApi = createApi({
  reducerPath: "contractApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000",
    credentials: 'include',
  }),
  tagTypes: ["Contract"],
  endpoints: (builder) => ({
    recognizeContractType: builder.mutation<string, FormData>({
      query: (formData) => ({
        url: "/contract/recognize-type",
        method: "POST",
        body: formData,
      }),
      transformResponse: (res: { data: string }) => {
        console.log("res recognizeContractType rtk query ", res);
        return res.data;
      },
    }),

    analyzeContract: builder.mutation<Analysis, FormData>({
      query: (formData) => ({
        url: '/contract/analyze',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (res: any) => {
        console.log("res analyzeContract rtk query ", res);    
        return res.data;
      },
      invalidatesTags: ["Contract"],
    }),
//contract/all
    fetchContracts: builder.query<Analysis, void>({
      query: () => '/contract/all',
      transformResponse: (res: any) => {
        console.log("res fetchContract rtk query ", res);
        return res.data;
      },
    }),

  }),
});

export const {
  useRecognizeContractTypeMutation,
  useAnalyzeContractMutation,
  useFetchContractsQuery,

} = contractApi;