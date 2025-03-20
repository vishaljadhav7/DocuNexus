// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient, User } from '@prisma/client';
import ApiError from '../utils/ApiError';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const prisma = new PrismaClient();

export const loadUser = async (req: Request, res: Response, next: NextFunction) => {
 
  if (req.session && req.session.userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.session.userId }
      });
  
      if (user) {
        req.user = user;
      } else {
        // Clear invalid session
        if (req.session) {
          delete req.session.userId;
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }
  next();
};


export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) : Promise<void>  => {
  try {
    if (!req.session || !req.session.userId) {
       res.status(401).json(new ApiError(401, 'Unauthorized - Please log in'));
       return
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
    });
    
    if (!user) {
       res.status(401).json(new ApiError(401, 'User not found'));
       return
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    next(new ApiError(500, 'Internal server error'));
  }
};