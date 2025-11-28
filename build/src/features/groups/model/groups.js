"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newGroupModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const groupSchema = new mongoose_1.default.Schema({
    name: {
        type: mongoose_1.default.SchemaTypes.String,
        required: [true, 'creator of group must be provided'],
        unique: [true, 'Name already used please provide another name.']
    },
    description: {
        type: mongoose_1.default.SchemaTypes.String,
    },
    creator_id: {
        type: mongoose_1.default.Schema.ObjectId,
        required: [true, 'creator of group must be provided'],
        ref: 'users'
    },
    frequency: {
        type: mongoose_1.default.SchemaTypes.String,
        enum: ['weekly', 'monthly', 'bi-weekly']
    },
    contribution_amount: {
        type: mongoose_1.default.SchemaTypes.Number,
        default: 0
    },
    current_round: {
        type: mongoose_1.default.SchemaTypes.Number,
        default: 0
    },
    total_round: {
        type: mongoose_1.default.SchemaTypes.Number,
        default: 0
    },
    next_payout_date: {
        type: mongoose_1.default.SchemaTypes.String,
        default: null
    },
    start_date: {
        type: mongoose_1.default.SchemaTypes.String,
        default: null
    },
    completed_at: {
        type: mongoose_1.default.SchemaTypes.String,
        default: null
    },
    invite_code: {
        type: mongoose_1.default.SchemaTypes.String,
    },
    is_public: {
        type: mongoose_1.default.SchemaTypes.Boolean,
        default: true
    },
    members: [{
            id: {
                type: mongoose_1.default.Schema.ObjectId,
                required: [true, 'creator of group must be provided'],
                ref: 'users'
            },
            isAdmin: {
                type: mongoose_1.default.Schema.Types.Boolean,
                default: false
            },
            joined_at: {
                type: mongoose_1.default.Schema.Types.Date,
                default: Date.now()
            },
            payout_order: {
                type: mongoose_1.default.Schema.Types.Number,
                default: 0
            },
            has_received_payout: {
                type: mongoose_1.default.Schema.Types.Boolean,
                default: false
            },
            payout_received_at: {
                type: mongoose_1.default.Schema.Types.Date,
                default: null
            },
            trust_rating: {},
            is_active: {
                type: mongoose_1.default.Schema.Types.Boolean,
                default: true
            }
        }],
    groupInviteLink: {
        type: String,
    },
    group_status: {
        type: String,
        enum: ['draft', 'active', 'completed', 'cancelled'],
        default: 'active'
    }
}, { timestamps: true });
exports.newGroupModel = mongoose_1.default.model('groups', groupSchema);
