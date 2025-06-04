import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserRepository } from '../repository/user.repository';
import { 
ConflictError,
UnauthorizedError, 
NotFoundError, 
InternalServerError  
} from '../utils/error.utils';
import { SignupRequestBody, SigninRequestBody} from '../types';


export class AuthService {
  private userRepository: UserRepository;
  private readonly SALT_ROUNDS = 10;

  constructor() {
    this.userRepository = new UserRepository();
  }

  public async registerUser(userData: SignupRequestBody, req: Request) {
    const { userName, emailId, password, isPremium = false } = userData;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(emailId);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = await this.userRepository.create({
      userName,
      emailId,
      password: hashedPassword,
      isPremium: isPremium || false,
    });

    // Set session
    await this.setUserSession(req, user.id);

    // Return user data without password
    return {
      id: user.id,
      emailId: user.emailId,
      userName: user.userName,
    };
  }

  public async signInUser(credentials: SigninRequestBody, req: Request) {
    const { emailId, password } = credentials;

    // Find user by email
    const user = await this.userRepository.findByEmail(emailId);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Set session
    await this.setUserSession(req, user.id);

    // Return user data without password
    return {
      id: user.id,
      emailId: user.emailId,
      userName: user.userName,
    };
  }

  public async getUserProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  public async logoutUser(req: Request, res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy(err => {
        if (err) {
          reject(new InternalServerError('Failed to logout'));
        } else {
          // Clear the session cookie
          res.clearCookie('connect.sid');
          resolve();
        }
      });
    });
  }

  private async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.SALT_ROUNDS);
    } catch (error) {
      console.error('Password hashing error:', error);
      throw new InternalServerError('Password processing failed');
    }
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Password verification error:', error);
      throw new InternalServerError('Password verification failed');
    }
  }

  private async setUserSession(req: Request, userId: string): Promise<void> {
    req.session.userId = userId;
    await this.saveSession(req);
  }

  private saveSession(req: Request): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          reject(new InternalServerError('Session save failed'));
        } else {
          resolve();
        }
      });
    });
  }
}
