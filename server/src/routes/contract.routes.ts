import express from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { isAuthenticated } from '../middlewares/auth';

const contractRouter = express.Router();


contractRouter.post("/recognize-type", isAuthenticated ,()=>{}) // asyncHandler

contractRouter.post("/analyze", isAuthenticated , ()=>{});


contractRouter.get("/user-contracts", isAuthenticated , () => {})

contractRouter.get("/contract/:contractId", isAuthenticated, ()=>{})


export default contractRouter;
