"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinGroupValidationSchema = exports.createNewGroupValidationSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createNewGroupValidationSchema = zod_1.default.object({
    name: zod_1.default.string().nonempty(),
    description: zod_1.default.string().nonempty(),
    frequency: zod_1.default.enum(['weekly', 'monthly', 'bi-weekly']),
    contribution_amount: zod_1.default.number(),
    total_round: zod_1.default.number(),
    is_public: zod_1.default.boolean()
});
exports.joinGroupValidationSchema = zod_1.default.object({
    group_id: zod_1.default.string().nonempty(),
});
