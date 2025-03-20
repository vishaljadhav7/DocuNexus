import express from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { getContractById, getContracts, recognizeAndConfirmContractType, reviewContract, deleteContract} from '../controllers/contract.controller';
import { uploadMiddleware } from '../controllers/contract.controller';

const contractRouter = express.Router();


contractRouter.post("/recognize-type", isAuthenticated , uploadMiddleware ,recognizeAndConfirmContractType) // asyncHandler

contractRouter.post("/analyze", isAuthenticated , uploadMiddleware , reviewContract);


contractRouter.get("/all", isAuthenticated, getContracts)

contractRouter.get("/:contractId", isAuthenticated, getContractById);

contractRouter.delete("/:contractId", isAuthenticated, deleteContract);


export default contractRouter;
