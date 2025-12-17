"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitlistValidationSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.waitlistValidationSchema = zod_1.default.object({
    first_name: zod_1.default.string().nonempty(),
    last_name: zod_1.default.string().nonempty(),
    email: zod_1.default.email().nonempty(),
    phone_number: zod_1.default.string().regex(new RegExp(/^\+[1-9]\d{10,14}$/), 'Invalid form number provided'),
    saving_method: zod_1.default.string().nonempty(),
    income_pattern: zod_1.default.string().nonempty(),
    priority: zod_1.default.string().nonempty(),
    goal: zod_1.default.string().nonempty(),
    early_access: zod_1.default.string().nonempty()
});
