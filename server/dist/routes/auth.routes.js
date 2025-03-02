"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const auth_1 = require("../middlewares/auth");
const authRouter = express_1.default.Router();
authRouter.get("/auth/google", passport_1.default.authenticate("google"));
authRouter.
    get("/auth/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/signIn" }), (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
});
authRouter.get("/user-profile", auth_1.isAuthenticated, (req, res) => {
    if (req.isAuthenticated()) {
        res.status(201).json(new ApiResponse_1.default(201, req.user, "user profile retreived successfully!"));
    }
    else {
        res.status(401).json(new ApiError_1.default(400, "unauthorized"));
    }
});
authRouter.post("/signOut", (req, res, next) => {
    req.logout((error) => {
        if (error)
            return next(error);
        return res.status(201).json(new ApiResponse_1.default(201, null, "sign out success!"));
    });
});
exports.default = authRouter;
