"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newWaitlistModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const waitListSchema = new mongoose_1.default.Schema({
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    email: {
        type: String
    },
    phone_number: {
        type: String
    },
    saving_method: {
        type: String
    },
    income_pattern: {
        type: String
    },
    priority: {
        type: String
    },
    goal: {
        type: String
    },
    early_access: {
        type: String
    },
    joined_at: {
        type: Date,
        default: Date.now()
    },
    notified: {
        type: zod_1.boolean
    }
}, { timestamps: true });
exports.newWaitlistModel = mongoose_1.default.model('waitlist', waitListSchema);
