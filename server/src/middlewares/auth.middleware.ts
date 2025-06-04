// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient, User } from '@prisma/client';
import { InternalServerError , UnauthorizedError, NotFoundError} from '../utils/error.utils';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const prisma = new PrismaClient();

export const loadUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.session?.userId) {
    return next();
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId }
    });

    if (user) {
      req.user = user;
    } else {
      // Clear invalid session
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
      });
    }
  } catch (error) {
    console.error('Error loading user:', error);
  }

  next();
};



export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
  
    if (!req.session?.userId) {
      res.status(401).json(new UnauthorizedError('Unauthorized - Please log in'));
      return;
    }

    if (req.user) {
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
    });

    if (!user) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
      });
      
      res.status(404).json(new NotFoundError('User not found'));
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json(new InternalServerError('Authentication failed'));
  }
};
