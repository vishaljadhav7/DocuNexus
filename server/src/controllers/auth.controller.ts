
import {  NextFunction , Request, Response} from 'express';
import {  validationResult } from 'express-validator';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const saveSession = (req: Request): Promise<void> => {
    return new Promise((resolve, reject) => {
        req.session.save((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};


export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(new ApiError(400, errors.array().map(err => err.msg).join(', ')));
    }

    const { emailId, password, userName } = req.body;
    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { emailId } });
        if (existingUser) {
            return res.status(409).json(new ApiError(409, 'User with this email already exists'));
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = await prisma.user.create({
            data: {
                emailId,
                password: hashedPassword,
                userName,
                isPremium: false,
            },
        });

        // Set session
        req.session.userId = user.id;
        await saveSession(req);

        console.log('Signup - Session ID:', req.sessionID);
        console.log('Signup - User ID:', req.session.userId);

        res.status(201).json(new ApiResponse(201, { id: user.id, emailId, userName }, 'User created successfully'));
    } catch (error) {
        console.error('Signup error:', error);
        next(new ApiError(500, 'Internal server error'));
    }
} 


export const signInUser = async (req: Request, res: Response, next: NextFunction) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(new ApiError(400, errors.array().map(err => err.msg).join(', ')));
    }

    const { emailId, password } = req.body;

    try {
        // Find user
        const user = await prisma.user.findUnique({ where: { emailId } });
        if (!user) {
            return res.status(401).json(new ApiError(401, 'Invalid email or password'));
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json(new ApiError(401, 'Invalid email or password'));
        }

        // Set session
        req.session.userId = user.id;
        await saveSession(req);

        console.log('Signin - Session ID:', req.sessionID);
        console.log('Signin - User ID:', req.session.userId);

        res.status(200).json(new ApiResponse(200, { id: user.id, emailId, userName: user.userName }, 'Login successful'));
    } catch (error) {
        console.error('Signin error:', error);
        next(new ApiError(500, 'Internal server error'));
    }
}