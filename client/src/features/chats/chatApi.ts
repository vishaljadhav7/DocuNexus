import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


interface Chat {
    id: string;
    aiResponse: string;
    userQuery: string;
    createdAt: string;
    contractId: string;
  }

export const chatApi = createApi({
    reducerPath : "chatApi",
    baseQuery : fetchBaseQuery({
      baseUrl: process.env.NEXT_PUBLIC_API_URL,
      credentials: 'include',
    }),
    tagTypes: ["Chats"],
    endpoints : (builder) => ({
        retreiveChats : builder.query<Chat[], {contractId : string}>({
            query : ({contractId}) => `/chat/${contractId}`,
            transformResponse : (res : {data : Chat[]}) => res?.data,
            providesTags : ["Chats"]
        }),

        sendQuery : builder.mutation({
            query : ({contractId, chatQuery}) => ({
                url : `/chat/${contractId}`,
                method : 'POST',
                body : {chatQuery}
            }),
            transformResponse : (res : {data : Chat}) => res.data,
            invalidatesTags : ["Chats"]
        })
    })
})


export const {useRetreiveChatsQuery, useSendQueryMutation} = chatApi;