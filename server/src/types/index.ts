// src/types.ts
import { Session } from 'express-session';

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