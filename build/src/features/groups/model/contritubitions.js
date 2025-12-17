"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContributionModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const contributionModelSchema = new mongoose_1.default.Schema({
    group_id: {
        type: mongoose_1.default.Schema.ObjectId,
        required: [true, 'group id must be provided'],
        ref: 'groups'
    },
    constribution_started: {
        type: mongoose_1.default.Schema.Types.Boolean,
        default: false
    },
    amount: {
        type: mongoose_1.default.Schema.Types.Number,
        required: [true, 'contribution amount must be provided']
    },
    current_round: {
        type: mongoose_1.default.SchemaTypes.Number,
        default: 0
    },
    members_paid: [{
            member_id: {
                type: mongoose_1.default.Schema.ObjectId,
                ref: 'users'
            },
            contributed_at: {
                type: mongoose_1.default.Schema.Types.Date,
                default: Date.now()
            },
        }],
    member_due_for_payment: {
        type: mongoose_1.default.Schema.ObjectId,
    }
});
exports.ContributionModel = mongoose_1.default.model('contributions', contributionModelSchema);
