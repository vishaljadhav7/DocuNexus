import express from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware';

import { uploadMiddleware } from '../middlewares/upload.middleware';
import { ContractController } from '../controllers/contract.controller';
import { ContractService } from '../services/contract.service';
import { ContractRepository } from '../repository/contract.repository';
import {  param } from 'express-validator';
import { validationHandler } from '../middlewares/validation.middleware';


const contractRepository = new ContractRepository();
const contractService = new ContractService(contractRepository);
const contractController = new ContractController(contractService)

const contractRouter = express.Router();


contractRouter.post("/recognize-type", isAuthenticated , uploadMiddleware ,contractController.recognizeAndConfirmContractType) // asyncHandler

contractRouter.post("/analyze", isAuthenticated , uploadMiddleware , contractController.reviewContract);


contractRouter.get("/all", isAuthenticated, contractController.getContracts)

contractRouter.get(
    "/:contractId", 
    param('contractId').isUUID().withMessage('Contract ID must be a valid UUID'),
    validationHandler,
    isAuthenticated, 
    contractController.getContractById);

contractRouter.delete(
    "/:contractId", 
    param('contractId').isUUID().withMessage('Contract ID must be a valid UUID'),
    validationHandler,
    isAuthenticated, 
    contractController.deleteContract);


export default contractRouter;
