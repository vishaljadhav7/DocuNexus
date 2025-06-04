import {Router} from 'express';
import { body } from 'express-validator';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { AuthController } from '../controllers/auth.controller';
import { validationHandler } from '../middlewares/validation.middleware';

const authRouter = Router();
const authController = new AuthController();
  
// Validation middleware
const signupValidation = [
  body('userName').notEmpty().withMessage('Username is required'),
  body('emailId').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('isPremium').optional().isBoolean().withMessage('isPremium must be a boolean value'),
];

const signinValidation = [
  body('emailId').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];


authRouter.post('/signup', signupValidation, validationHandler, authController.registerUser);
authRouter.post('/signin', signinValidation, validationHandler,  authController.signInUser);
authRouter.get('/me', isAuthenticated, authController.myProfile);
authRouter.post('/logout', authController.logout);

export default authRouter;