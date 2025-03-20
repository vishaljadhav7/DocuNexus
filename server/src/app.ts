import express, {NextFunction, Request, Response} from 'express';
import cors from 'cors'
import helmet from 'helmet';
import morgan from 'morgan';
import session from "express-session";
import { sessionStore } from './config/sessionConfig';
import authRouter from './routes/auth.routes';
import contractRouter from './routes/contract.routes';
import { loadUser } from './middlewares/auth';

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true, 
}));

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({limit : "16kb"}));
app.use(express.urlencoded({ extended: true }));


app.use(session({
    store: sessionStore,
    secret: process.env.SECRET_KEY!,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      maxAge: 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  }));


app.use(loadUser);

app.use('/auth', authRouter);
app.use("/contract", contractRouter)


export {app};     