import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface User {
    id: string;
    userName: string;
    emailId: string;
    contractReviews : [];
    googleId : string;
    isPremium : boolean;
    profilePic : string;
}

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
      baseUrl: process.env.NEXT_PUBLIC_API_URL, 
      credentials: 'include', 
      prepareHeaders: (headers) => {
        return headers;
      },
    }),
    endpoints: (builder) => ({
      getCurrentUser: builder.query<User, void>({
        query: () => '/auth/me', 
        transformResponse: (res: { data: User }) => res.data as User,
      }),
    }),
  });

export const { useGetCurrentUserQuery} = authApi;