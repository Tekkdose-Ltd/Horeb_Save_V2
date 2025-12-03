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
exports.encryptAES256 = void 0;
const crypto_1 = __importDefault(require("crypto"));
const encryptAES256 = (paymentData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv('aes-256-gcm', (_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.kora_payment_gateway_enc, iv);
    const encrypted = cipher.update(paymentData);
    const ivToHex = iv.toString('hex');
    const encryptedToHex = Buffer.concat([encrypted, cipher.final()]).toString('hex');
    return `${ivToHex}:${encryptedToHex}:${cipher.getAuthTag().toString('hex')}`;
});
exports.encryptAES256 = encryptAES256;
