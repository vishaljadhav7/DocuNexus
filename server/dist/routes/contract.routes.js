"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const contract_controller_1 = require("../controllers/contract.controller");
// recognizeAndConfirmContractType reviewContract
const contract_controller_2 = require("../controllers/contract.controller");
const contractRouter = express_1.default.Router();
contractRouter.post("/recognize-type", auth_1.isAuthenticated, contract_controller_2.uploadMiddleware, contract_controller_1.recognizeAndConfirmContractType); // asyncHandler
contractRouter.post("/analyze", auth_1.isAuthenticated, contract_controller_2.uploadMiddleware, contract_controller_1.reviewContract);
contractRouter.get("/:contractId", auth_1.isAuthenticated, contract_controller_1.getContractById);
contractRouter.get("/user-contracts", auth_1.isAuthenticated, () => { });
exports.default = contractRouter;
