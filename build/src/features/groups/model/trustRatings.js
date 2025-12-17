"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupTrustRatingModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const groupTrustRatingSchema = new mongoose_1.default.Schema({
    group_id: {
        type: mongoose_1.default.Schema.ObjectId,
        required: [true, 'group id must be provided'],
        ref: 'groups'
    },
    member_id: {
        type: mongoose_1.default.Schema.ObjectId,
        required: [true, 'member id must be provided'],
        ref: 'users'
    },
    description: {
        type: mongoose_1.default.Schema.Types.String,
    },
    trust_rating: {
        type: mongoose_1.default.Schema.Types.Number,
        required: [true, 'trust rating must be provided']
    },
    rated_by: {
        type: mongoose_1.default.Schema.ObjectId,
        required: [true, 'rater id must be provided'],
        ref: 'users'
    }
}, { timestamps: true });
exports.GroupTrustRatingModel = mongoose_1.default.model('group_member_trust_ratings', groupTrustRatingSchema);
