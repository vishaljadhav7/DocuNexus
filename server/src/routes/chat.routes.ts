import express from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { body, param } from 'express-validator';
import { validationHandler } from '../middlewares/validation.middleware';
import { ChatController } from '../controllers/chat.controller';


const chatRouter = express.Router();
const chatController = new ChatController()


const chatValidation = [
  param('contractId')
    .isUUID()
    .withMessage('Contract ID must be a valid UUID'),
  body('chatQuery')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Chat query must be between 1 and 1000 characters'),
];

chatRouter.get(
  "/:contractId", 
  param('contractId').isUUID().withMessage('Contract ID must be a valid UUID'),
  validationHandler,
  isAuthenticated, 
  chatController.retrieveChatsForContracts
);

chatRouter.post(
  "/:contractId", 
  chatValidation,
  validationHandler,
  isAuthenticated, 
  chatController.analyzeQueryForContract
);

export default chatRouter;
