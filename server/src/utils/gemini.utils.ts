import { GoogleGenerativeAI } from "@google/generative-ai";

const AI_MODEL = 'gemini-1.5-flash';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY!);

export const aiModel = genAI.getGenerativeModel({ model: AI_MODEL });
