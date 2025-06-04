import { AppError } from "../utils/error.utils";
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {

  console.error(`Error: ${err.message}, Path : ${req.path}, Method : ${req.method}, Stack : ${err.stack}`)

  const isAppError = 'statusCode' in err;
  
  if (isAppError) {
    const appError = err as AppError;
    res.status(appError.statusCode).json({
      success: false,
      message: appError.message,
      errorCode: 'errorCode' in appError ? appError.errorCode : undefined
    });
    return;
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message, stack: err.stack })
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  console.error(`Route not found: ${req.method} ${req.originalUrl}`);
  
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};