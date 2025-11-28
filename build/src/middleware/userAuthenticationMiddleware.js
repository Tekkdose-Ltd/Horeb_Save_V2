"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createAccountModel_1 = require("../features/auth/account/model/createAccountModel");
const CODE_1 = __importDefault(require("../util/interface/CODE"));
exports.default = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log('fired now...');
    try {
        const authHeader = (_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a.authorization;
        if (!authHeader) {
            res.status(CODE_1.default.UNAUTHORIZED).json({
                title: "Aunthentication Message",
                status: CODE_1.default.UNAUTHORIZED,
                successful: false,
                message: "Authorization header is needed to continue."
            });
            return;
        }
        const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
        if (!token) {
            res.status(CODE_1.default.BAD_REQUEST).json({
                title: "Aunthentication Message",
                status: CODE_1.default.BAD_REQUEST,
                successful: false,
                message: "Invalid token provided."
            });
        }
        const validToken = jsonwebtoken_1.default.verify(token, (_b = process.env) === null || _b === void 0 ? void 0 : _b.APP_SECRET_TOKEN_SIGNER_KEY);
        const isUserValid = yield createAccountModel_1.newAccountModel.findOne({ email: validToken.email }).select('+lastLoggedInToken');
        if (!isUserValid || isUserValid.lastLoggedInToken !== token) {
            res.status(CODE_1.default.Forbidden).json({
                title: "Aunthentication Message",
                status: CODE_1.default.Forbidden,
                successful: false,
                message: "Invalid token provided.",
            });
            return;
        }
        req.user = Object.assign(Object.assign({}, validToken), { _id: isUserValid._id });
        next();
    }
    catch (error) {
        res.status(CODE_1.default.INTERNAL_SERVER_ERROR).json({
            title: "Aunthentication Message",
            status: CODE_1.default.INTERNAL_SERVER_ERROR,
            successful: false,
            message: "An error occured.",
            error: error.message
        });
    }
});
