import express, { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { isAuthenticated } from '../middlewares/auth';
import { registerUser , signInUser, myProfile} from '../controllers/auth.controller';

const authRouter = express.Router();
  
  authRouter.post(
    '/signup',
    [
      body('userName').notEmpty().withMessage('Username is required'),
      body('emailId').isEmail().withMessage('Valid email is required'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
      body('isPremium').optional().isBoolean().withMessage('isPremium must be a boolean value'),
    ],
    registerUser
  );


  authRouter.post(
    '/signin',
    [
      body('emailId').isEmail().withMessage('Valid email is required'),
      body('password').notEmpty().withMessage('Password is required'),
    ],
    signInUser
  );



  authRouter.get('/me', isAuthenticated, myProfile);
  

  authRouter.post('/logout',  async (req: Request, res: Response) => {
    try {
      // Destroy the session which will remove it from both memory and database
      await new Promise<void>((resolve, reject) => {
        req.session.destroy(err => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      // Clear the cookie
      res.clearCookie('connect.sid');
      res.status(200).json(new ApiResponse(200, {}, 'Logged out successfully'));
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json(new ApiError(500, 'Failed to logout'));
    }
  });

  
  export default authRouter