import { User } from "@prisma/client";
import { prisma } from "../utils/clients.utils";
import { InternalServerError, NotFoundError } from "../utils/error.utils";

export class UserRepository {
  public async findById(id: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error('Database error in findById:', error);
      throw new InternalServerError('Database error occurred while finding user');
    }
  }

  public async findByEmail(emailId: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { emailId },
      });
    } catch (error) {
      console.error('Database error in findByEmail:', error);
      throw new InternalServerError('Database error occurred while finding user by email');
    }
  }

  public async create(userData: {
    userName: string;
    emailId: string;
    password: string;
    isPremium: boolean;
  }): Promise<User> {
    try {
      return await prisma.user.create({
        data: userData,
      });
    } catch (error : any) {
      console.error('Database error in create:', error);
      
      if (error.code === 'P2002') {
        throw new InternalServerError('User with this email already exists');
      }
      
      throw new InternalServerError('Failed to create user');
    }
  }

  public async update(id: string, userData: Partial<User>): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id },
        data: userData,
      });
    } catch (error : any) {
      console.error('Database error in update:', error);
      
      if (error.code === 'P2025') {
        throw new NotFoundError('User not found');
      }
      
      throw new InternalServerError('Failed to update user');
    }
  }

} 