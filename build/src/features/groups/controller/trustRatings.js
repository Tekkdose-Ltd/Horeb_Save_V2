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
exports.getGroupMemberTrustRatings = exports.newGroupTrustRating = void 0;
const CODE_1 = __importDefault(require("../../../util/interface/CODE"));
const groups_1 = require("../model/groups");
const trustRatings_1 = require("../model/trustRatings");
const newGroupTrustRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { group_id, group_member_id, rating_score, description } = req.body;
        const user = req.user;
        /**
         * create new trust rating
         */
        const isGroupValid = yield groups_1.newGroupModel.findOne({ group_id: group_id, 'members.id': group_member_id });
        if (!isGroupValid) {
            return res.status(CODE_1.default.BAD_REQUEST).json({
                title: 'New Group Trust Rating Message',
                status: CODE_1.default.BAD_REQUEST,
                successful: false,
                message: 'Invalid group or group member.'
            });
        }
        const newTrustRating = yield trustRatings_1.GroupTrustRatingModel.create({
            group_id: group_id,
            member_id: group_member_id,
            trust_rating: rating_score,
            description: description,
            rated_by: user === null || user === void 0 ? void 0 : user._id
        });
        res.status(CODE_1.default.CREATED).json({
            title: 'New Group Trust Rating Message',
            status: CODE_1.default.CREATED,
            successful: true,
            message: 'Group trust rating created successfully.',
            data: newTrustRating
        });
    }
    catch (error) {
        res.status(CODE_1.default.INTERNAL_SERVER_ERROR).json({
            title: 'New Group Trust Rating Message',
            status: CODE_1.default.INTERNAL_SERVER_ERROR,
            successful: false,
            message: 'Internal server error.',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.newGroupTrustRating = newGroupTrustRating;
const getGroupMemberTrustRatings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { group_id, member_id } = req.body;
        /**
         * fetch trust ratings
         */
        const trustRatings = yield trustRatings_1.GroupTrustRatingModel.find({ group_id: group_id, member_id: member_id });
        res.status(CODE_1.default.SUCCESS).json({
            title: 'Get Group Member Trust Ratings Message',
            status: CODE_1.default.SUCCESS,
            successful: true,
            message: 'Group member trust ratings fetched successfully.',
            data: trustRatings
        });
    }
    catch (error) {
        res.status(CODE_1.default.INTERNAL_SERVER_ERROR).json({
            title: 'Get Group Member Trust Ratings Message',
            status: CODE_1.default.INTERNAL_SERVER_ERROR,
            successful: false,
            message: 'Internal server error.',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getGroupMemberTrustRatings = getGroupMemberTrustRatings;
