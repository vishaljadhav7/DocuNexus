import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface User {
    id: string;
    userName: string;
    emailId: string;
    contractReviews : [];
    googleId : string;
}

export const authApi = createApi({
    reducerPath : "authApi",
    baseQuery : fetchBaseQuery ({
      baseUrl : process.env.NEXT_PUBLIC_API_URL, 
      credentials: 'include',       
    }),
    endpoints : (builder) => ({
        getCurrentUser : builder.query<User, void>({
            query : () => '/auth/user-profile',
            transformResponse : (res : any) => res.data?.data || res.data,
            transformErrorResponse : (res : any) => {
                console.error('Error fetching current user:', res);
                return null; 
            } 
        }),
        googleSignIn : builder.mutation<string, void>({
            queryFn : async () => {
                window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`
                return {data : "success"}
            }
        })
    })
})

export const { useGetCurrentUserQuery , useGoogleSignInMutation} = authApi;