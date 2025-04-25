import express from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { retrieveChatsForContracts, analyzeQueryForContract } from '../controllers/chat.controller';

const chatRouter = express.Router();

chatRouter.get("/:contractId",isAuthenticated , retrieveChatsForContracts);

chatRouter.post("/:contractId",isAuthenticated , analyzeQueryForContract);

export default chatRouter;      