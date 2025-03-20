import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { isAuthenticated } from '../middlewares/auth';
import { SignupRequestBody, SigninRequestBody } from '../types';

const authRouter = express.Router();
const prisma = new PrismaClient();


const saveSession = (req: Request): Promise<void> => {
    return new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };


  
  authRouter.post(
    '/signup',
    [
      body('userName').notEmpty().withMessage('Username is required'),
      body('emailId').isEmail().withMessage('Valid email is required'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
      body('isPremium').optional().isBoolean().withMessage('isPremium must be a boolean value'),
    ],
    async (req: Request, res: Response, next: NextFunction) :  Promise<any> => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(new ApiError(400, errors.array().map(err => err.msg).join(', ')));
      }
  
      const { userName, emailId, password, isPremium = false } = req.body as SignupRequestBody;
  
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { emailId },
        });
  
        if (existingUser) {
          return res.status(409).json(new ApiError(409, 'User with this email already exists'));
        }
  
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
  
        // Create new user
        const user = await prisma.user.create({
          data: {
            userName,
            emailId,
            password: hashedPassword,
            isPremium: isPremium || false,
          },
        });
  
        // Set session and explicitly save it
        req.session.userId = user.id;
        await saveSession(req);
  
        // console.log('Signup - Session ID:', req.sessionID);
        // console.log('Signup - User ID:', req.session.userId);
  
        res.status(201).json(new ApiResponse(
          201, 
          { id: user.id, emailId, userName }, 
          'User created successfully'
        ));
      } catch (error) {
        console.error('Signup error:', error);
        next(new ApiError(500, 'Internal server error'));
      }
    }
  );


  authRouter.post(
    '/signin',
    [
      body('emailId').isEmail().withMessage('Valid email is required'),
      body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req: Request, res: Response, next: NextFunction) :  Promise<any> => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json(new ApiError(400, errors.array().map(err => err.msg).join(', ')));
        }
  
        const { emailId, password } = req.body as SigninRequestBody;
  
        // Find user by email
        const user = await prisma.user.findUnique({
          where: { emailId },
        });
  
        if (!user) {
          return res.status(401).json(new ApiError(401, 'Invalid credentials'));
        }
  
        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
  
        if (!isPasswordValid) {
          return res.status(401).json(new ApiError(401, 'Invalid credentials'));
        }
  
        // Set session and explicitly save it
        req.session.userId = user.id;
        await saveSession(req);
     
        // console.log('Signin - Session ID:', req.session);
        // console.log('Signin - User ID:', req.session.userId);
  
        res.status(200).json(new ApiResponse(
          200,
          { id: user.id, emailId: user.emailId, userName: user.userName },
          'User signed in successfully'
        ));
      } catch (error) {
        console.error('Signin error:', error);
        next(new ApiError(500, 'Internal server error'));
      }
    }
  );



  authRouter.get('/me', isAuthenticated, async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    try {
      if (!req.user) {
         res.status(404).json(new ApiError(404, 'User not found'));
         return
      }
  
      const { password, ...userWithoutPassword } = req.user;
  
      res.status(200).json(new ApiResponse(200, userWithoutPassword, 'User profile retrieved successfully'));
    } catch (error) {
      console.error('Get user error:', error);
      next(new ApiError(500, 'Internal server error'));
    }
  });
  

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