import express, { NextFunction } from 'express';
import passport from 'passport';
import { Request, Response } from 'express';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import { isAuthenticated } from '../middlewares/auth';


const authRouter = express.Router()

authRouter.get("/google", passport.authenticate("google"));

authRouter.
    get("/auth/google/callback", 
    passport.authenticate("google" , {failureRedirect : "/signIn"}),
    (req : Request, res : Response) => {
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    }
);

authRouter.get("/user-profile", isAuthenticated , (req : Request, res : Response) => {
    if(req.isAuthenticated()){
        res.status(201).json(new ApiResponse(201, req.user, "user profile retreived successfully!"))
    }else {
        res.status(401).json(new ApiError(400, "unauthorized"))
    }
})

authRouter.post("/signOut",  (req : Request, res : Response, next : NextFunction) => {
    req.logout((error) => {
        if(error) return next(error);
        return res.status(201).json(new ApiResponse(201, null, "sign out success!"))
    })
})