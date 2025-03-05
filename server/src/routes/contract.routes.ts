import express from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { isAuthenticated } from '../middlewares/auth';
import { getContractById, recognizeAndConfirmContractType, reviewContract } from '../controllers/contract.controller';
// recognizeAndConfirmContractType reviewContract
import { uploadMiddleware } from '../controllers/contract.controller';

const contractRouter = express.Router();


contractRouter.post("/recognize-type", isAuthenticated , uploadMiddleware ,recognizeAndConfirmContractType) // asyncHandler

contractRouter.post("/analyze", isAuthenticated , uploadMiddleware , reviewContract);



contractRouter.get("/:contractId", isAuthenticated, getContractById)

contractRouter.get("/user-contracts", isAuthenticated , () => {})



export default contractRouter;
