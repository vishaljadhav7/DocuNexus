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
    origin: ["http://localhost:3000", "https://docu-nexus.vercel.app"],
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true, 
}));


app.use(express.json({limit : "16kb"}));
app.use(express.urlencoded({ extended: true }));

app.set('trust proxy', 1); 
app.use(helmet());
app.use(morgan("dev"));



app.use(session({
    store: sessionStore,
    secret: process.env.SECRET_KEY!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000, 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  }));


app.use(loadUser);

app.use('/auth', authRouter);
app.use("/contract", contractRouter)

app.get("/", (req : Request, res: Response) => {
  res.status(200).send("healthy server")
})

export {app};     