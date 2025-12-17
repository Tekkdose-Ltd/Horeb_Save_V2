"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newAccountModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const NewAccountSchema = new mongoose_1.default.Schema({
    email: {
        type: mongoose_1.default.Schema.Types.String
    },
    password: {
        type: mongoose_1.default.Schema.Types.String,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    first_name: {
        type: mongoose_1.default.Schema.Types.String
    },
    last_name: {
        type: mongoose_1.default.Schema.Types.String
    },
    profile_image_url: {
        type: mongoose_1.default.Schema.Types.String
    },
    phone_number: {
        type: mongoose_1.default.Schema.Types.String
    },
    date_of_birth: {
        type: mongoose_1.default.Schema.Types.Date
    },
    address_line_1: {
        type: mongoose_1.default.Schema.Types.String
    },
    address_line_2: {
        type: mongoose_1.default.Schema.Types.String
    },
    city: {
        type: mongoose_1.default.Schema.Types.String
    },
    postalCode: {
        type: mongoose_1.default.Schema.Types.String
    },
    country: {
        type: mongoose_1.default.Schema.Types.String
    },
    profile_completed: {
        type: mongoose_1.default.Schema.Types.Boolean,
        default: false
    },
    stripe_customer_id: {
        type: mongoose_1.default.Schema.Types.String,
        default: null
    },
    trust_score: {
        type: mongoose_1.default.Schema.Types.Number,
        default: 0
    },
    total_groups_completed: {
        type: mongoose_1.default.Schema.Types.Number,
        default: 0
    },
    on_time_payment_rate: {
        type: mongoose_1.default.Schema.Types.Number,
        default: 0
    },
    last_seen: {
        type: mongoose_1.default.Schema.Types.Date,
        default: Date.now()
    },
    isLoggedIn: {
        type: mongoose_1.default.Schema.Types.Boolean,
        default: false
    },
    lastLoggedInToken: {
        type: mongoose_1.default.Schema.Types.String,
        default: null,
        select: false
    }
}, { timestamps: true });
exports.newAccountModel = mongoose_1.default.model('users', NewAccountSchema);
