import { BadRequestError } from "../utils/error.utils";
import { NextFunction, Request, Response } from "express";
import { validationResult } from 'express-validator';


export const validationHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array()
      .map(error => `${error.type}: ${error.msg}`)
      .join(', ');
    
    const error = new BadRequestError(`Validation failed: ${errorMessages}`);
    return next(error);
  }
  
  next();
};