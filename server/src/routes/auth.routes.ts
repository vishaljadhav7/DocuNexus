import express, { NextFunction } from 'express';
import passport from 'passport';
import { Request, Response } from 'express';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import { isAuthenticated } from '../middlewares/auth';

const authRouter = express.Router();

authRouter.get("/google", 
    passport.authenticate("google", { scope: ["profile", "email"] }), 
    (req: Request, res: Response) => {
        res.status(200).json("ok")
    }
);
authRouter.
    get("/google/callback", 
    passport.authenticate("google" , { successRedirect : `${process.env.CLIENT_URL}/dashboard`})
);

authRouter.get("/user-profile", isAuthenticated , async (req : Request, res : Response) => {
    if(req.isAuthenticated()){

        res.status(201).json(new ApiResponse(201, req.user, "user profile retreived successfully!"))
    }else {
        res.status(401).json(new ApiError(400, "unauthorized"))
    }
})

authRouter.post("/logout",  (req : Request, res : Response, next : NextFunction) => {
    req.logout((error) => {
        if(error) return next(error);
        return res.redirect(`${process.env.CLIENT_URL}/login`)
    })
})


export default authRouter;