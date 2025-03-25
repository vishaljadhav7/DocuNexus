import  { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { SignupRequestBody, SigninRequestBody } from '../types';


const prisma = new PrismaClient()

const saveSession = (req: Request): Promise<void> => {
    return new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };




export const registerUser = async (req: Request, res: Response, next: NextFunction) :  Promise<any> => {
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


export const signInUser = async (req: Request, res: Response, next: NextFunction) :  Promise<any> => {
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


  export const myProfile = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
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
  }