import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { SignupRequestBody, SigninRequestBody } from '../types';
import { BadRequestError, NotFoundError } from '../utils/error.utils';
import { AuthService } from '../services/auth.service';
import ApiResponse from '../utils/apiResponse.utils';


export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

      const userData = req.body as SignupRequestBody;
      
     
      const result = await this.authService.registerUser(userData, req);

      res.status(201).json(
        new ApiResponse(201, result, 'User created successfully')
      );
    } catch (error) {
      next(error);
    }
  };

  public signInUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

      const credentials = req.body as SigninRequestBody;
       
      const result = await this.authService.signInUser(credentials, req);

      res.status(200).json(
        new ApiResponse(200, result, 'User signed in successfully')
      );
    } catch (error) {
      next(error);
    }
  };

  public myProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new NotFoundError('User not found');
      }

      const userProfile = await this.authService.getUserProfile(req.user.id);

      res.status(200).json(
        new ApiResponse(200, userProfile, 'User profile retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authService.logoutUser(req, res);

      res.status(200).json(
        new ApiResponse(200, {}, 'Logged out successfully')
      );
    } catch (error) {
      next(error);
    }
  };
}
