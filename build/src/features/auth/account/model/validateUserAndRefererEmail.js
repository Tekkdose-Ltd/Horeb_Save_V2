"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateUserAndRefererEmail = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const newUSerAndRefererEmailSchema = new mongoose_1.default.Schema({
    who_to_validate: { type: String, required: true, enum: ['user_email', 'referer_email'] },
    email_to_validate: { type: String, required: true },
    standing_for: { type: String },
    magic_link: { type: String, required: true },
    user_validated_email: { type: zod_1.boolean },
    surety_consent: { type: zod_1.boolean },
    temp_data: { type: mongoose_1.default.Schema.Types.Mixed },
    createdAt: {
        type: Date,
        expires: '10m',
        default: Date.now
    }
});
exports.ValidateUserAndRefererEmail = mongoose_1.default.model('ValidateUserAndRefererEmail', newUSerAndRefererEmailSchema);
