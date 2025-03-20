import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Analysis } from "./contractSlice";

export const contractApi = createApi({
  reducerPath: "contractApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
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
        return res.data;
      },
    }),

    analyzeContract: builder.mutation<Analysis, FormData>({
      query: (formData) => ({
        url: '/contract/analyze',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (res: {data : Analysis}) => {
        // console.log("(res.data) => rtk analyzeContract ", res.data);
        return res.data
      }, 
      invalidatesTags: ["Contract"],
    }),

    fetchContracts: builder.query<Analysis[], void>({
      query: () => '/contract/all',
      transformResponse: (res: {data : Analysis[]}) => res.data,
      providesTags : ["Contract"]
    }),

    fetchContractById : builder.query({
      query : ({contractId}) => `contract/${contractId}`,
      transformResponse: (res: {data : Analysis}) =>  res.data,
    }),
    deleteContractById : builder.mutation({
      query : ({contractId}) => ({
        url : `/contract/${contractId}`,
        method : "DELETE",
      }),
      invalidatesTags : ["Contract"]
    }) 
  }),
});

export const {
  useRecognizeContractTypeMutation,
  useAnalyzeContractMutation,
  useFetchContractsQuery,
 useFetchContractByIdQuery,
 useDeleteContractByIdMutation
} = contractApi;