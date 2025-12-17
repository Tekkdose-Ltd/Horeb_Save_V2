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
exports.contributeToGroup = exports.startGroupContribution = void 0;
const CODE_1 = __importDefault(require("../../../util/interface/CODE"));
const contritubitions_1 = require("../model/contritubitions");
const groups_1 = require("../model/groups");
const startGroupContribution = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { group_id, creator_of_group_id } = req.body;
    try {
        const group = yield groups_1.newGroupModel.findOne({ _id: group_id, creator_id: creator_of_group_id });
        if (!group) {
            return res.status(CODE_1.default.BAD_REQUEST).json({
                title: 'Start Group Contribution Message',
                status: CODE_1.default.BAD_REQUEST,
                successful: false,
                message: 'Group not found.'
            });
        }
        if (group.creator_id.toString() !== (user === null || user === void 0 ? void 0 : user._id.toString())) {
            return res.status(CODE_1.default.UNAUTHORIZED).json({
                title: 'Start Group Contribution Message',
                status: CODE_1.default.UNAUTHORIZED,
                successful: false,
                message: 'Only group creator can start contribution.'
            });
        }
        //update next payout date based on frequency
        let nextPayoutDate = new Date();
        if (group.frequency === 'weekly') {
            nextPayoutDate.setDate(nextPayoutDate.getDate() + 7);
        }
        else if (group.frequency === 'bi-weekly') {
            nextPayoutDate.setDate(nextPayoutDate.getDate() + 14);
        }
        else if (group.frequency === 'monthly') {
            nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);
        }
        yield group.updateOne({ contribution_started: true, start_date: Date.now(), current_round: 1, next_payout_date: nextPayoutDate.toDateString() });
        //initialize contrtibution document for the group
        const contribution = yield contritubitions_1.ContributionModel.findOne({ group_id: group._id });
        if (contribution) {
            return res.status(CODE_1.default.BAD_REQUEST).json({
                title: 'Start Group Contribution Message',
                status: CODE_1.default.BAD_REQUEST,
                successful: false,
                message: 'Group contribution already started.'
            });
        }
        new contritubitions_1.ContributionModel({
            group_id: group._id,
            constribution_started: true,
            amount: group.contribution_amount,
            current_round: 1,
            member_due_for_payment: group.members[generateRandomNumber(0, group.members.length)].id
        }).save();
        res.status(CODE_1.default.SUCCESS).json({
            title: 'Start Group Contribution Message',
            status: CODE_1.default.SUCCESS,
            successful: true,
            message: 'Group contribution started successfully.'
        });
    }
    catch (error) {
        res.status(CODE_1.default.INTERNAL_SERVER_ERROR).json({
            title: 'Start Group Contribution Message',
            status: CODE_1.default.INTERNAL_SERVER_ERROR,
            successful: false,
            message: 'Internal server error.',
            error: error.message
        });
    }
});
exports.startGroupContribution = startGroupContribution;
const contributeToGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { group_id, member_id, amount } = req.body;
    try {
        const group = yield groups_1.newGroupModel.findById({ group_id: group_id, 'members.id': member_id });
        if (!group) {
            return res.status(CODE_1.default.BAD_REQUEST).json({
                title: 'Group Contribution Message',
                status: CODE_1.default.BAD_REQUEST,
                successful: false,
                message: 'Group not found.'
            });
        }
        if (group.contribution_amount !== amount) {
            return res.status(CODE_1.default.BAD_REQUEST).json({
                title: 'Group Contribution Message',
                status: CODE_1.default.BAD_REQUEST,
                successful: false,
                message: `Contribution amount must be ${group.contribution_amount}.`
            });
        }
    }
    catch (error) {
        res.status(CODE_1.default.INTERNAL_SERVER_ERROR).json({
            title: 'Group Contribution Message',
            status: CODE_1.default.INTERNAL_SERVER_ERROR,
            successful: false,
            message: 'Internal server error.'
        });
    }
});
exports.contributeToGroup = contributeToGroup;
const getDueMemberForPayment = (groupId, currentRound) => __awaiter(void 0, void 0, void 0, function* () {
    const group = yield groups_1.newGroupModel.findById(groupId);
    if (!group) {
        throw new Error('Group not found.');
    }
    const numberOfMembers = group.members.length;
    const dueMemberIndex = (currentRound - 1) % numberOfMembers;
    return group.members[dueMemberIndex].id;
});
const generateRandomNumber = (min, max) => {
    const number = Math.floor(Math.random() * (max - min + 1)) + min;
    while (number > max) {
        generateRandomNumber(min, max);
    }
    return number;
};
