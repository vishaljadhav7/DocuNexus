import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
   id: string;
   emailId: string;
   userName: string;
   profilePic: string; // Required field
   isPremium: boolean;
   userContractReviews?: ContractAnalysis[];
 }
 
 export interface ContractAnalysis {
   userId: string;
 }
export interface User1 {
    isAuthenticated : boolean,
    userInfo? : User | null 
 }

 const initialState : User1 = {
    isAuthenticated : false,
    userInfo : null
 }

 const userSlice = createSlice({
    name : "userSlice",
    initialState,
    reducers : {
       addUser : (state, action: PayloadAction<User>) => {
        state.isAuthenticated = true; 
        state.userInfo = action.payload;   
       },
       removeUser : (state)  => {
        state.isAuthenticated = false;
        state.userInfo = null;
       }
    }
 });

export const {addUser, removeUser} = userSlice.actions

 export default userSlice.reducer