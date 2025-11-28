"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserDetailsValidationSchema = exports.refreshTokenValidationSchema = exports.LoginAccountValidationSchema = exports.CreateNewAccountValidationSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CreateNewAccountValidationSchema = zod_1.default.object({
    email: zod_1.default.email().nonempty(),
    password: zod_1.default.string().nonempty(),
    first_name: zod_1.default.string().min(2).max(30).nonempty(),
    last_name: zod_1.default.string().min(2).max(30).nonempty(),
    profile_image_url: zod_1.default.string(),
    phone_number: zod_1.default.string().regex(new RegExp(/^\+[1-9]\d{10,14}$/), 'Invalid form number provided'),
    date_of_birth: zod_1.default.string(),
    address_line_1: zod_1.default.string(),
    address_line_2: zod_1.default.string(),
    city: zod_1.default.string(),
    postalCode: zod_1.default.string(),
    country: zod_1.default.string(),
    profile_completed: zod_1.default.boolean().optional(),
    stripe_customer_id: zod_1.default.string().optional(),
    trust_score: zod_1.default.number().positive().optional(),
    total_groups_completed: zod_1.default.number().optional(),
    on_time_payment_rate: zod_1.default.number().optional()
});
exports.LoginAccountValidationSchema = zod_1.default.object({
    email: zod_1.default.email().nonempty(),
    password: zod_1.default.string().nonempty()
});
exports.refreshTokenValidationSchema = zod_1.default.object({
    token: zod_1.default.string().nonempty().min(10),
    user_id: zod_1.default.string().min(24)
});
exports.updateUserDetailsValidationSchema = zod_1.default.object({
    first_name: zod_1.default.string().min(2).max(30).nonempty(),
    last_name: zod_1.default.string().min(2).max(30).nonempty(),
    profile_image_url: zod_1.default.string().optional(),
    phone_number: zod_1.default.string().regex(new RegExp(/^\+[1-9]\d{10,14}$/), 'Invalid form number provided').optional(),
    date_of_birth: zod_1.default.string().optional(),
    address_line_1: zod_1.default.string().optional(),
    address_line_2: zod_1.default.string().optional(),
    city: zod_1.default.string().optional(),
    postalCode: zod_1.default.string().optional(),
});
