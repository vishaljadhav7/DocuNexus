"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const contractRouter = express_1.default.Router();
contractRouter.post("/recognize-type", auth_1.isAuthenticated, () => { }); // asyncHandler
contractRouter.post("/analyze", auth_1.isAuthenticated, () => { });
contractRouter.get("/user-contracts", auth_1.isAuthenticated, () => { });
contractRouter.get("/contract/:contractId", auth_1.isAuthenticated, () => { });
exports.default = contractRouter;
