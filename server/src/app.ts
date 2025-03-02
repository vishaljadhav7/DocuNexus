import express, {Request, Response} from 'express';
import cors from 'cors'
import helmet from 'helmet';
import morgan from 'morgan';
import session from "express-session";
import passport from 'passport';
import authRouter from './routes/auth.routes';
const app = express();

app.use(cors({
    origin : "http://localhost:3000",
    methods : ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true,
}));

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({limit : "16kb"}));

app.use(session({
    secret : process.env.SECRET_KEY!,
    resave : false,
    saveUninitialized : false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000, 
      },
}))


import './config/passport';

app.use(passport.initialize());
app.use(passport.session());

app.get("/" , (req : Request, res : Response) => {
    res.send("this is home route")
})

app.use('/api/v1', authRouter);


export {app};     