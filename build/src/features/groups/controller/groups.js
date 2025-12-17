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
exports.getPublicGroups = exports.getMyGroups = exports.joinGroup = exports.joinGroupByInviteCode = exports.createNewGroup = void 0;
const CODE_1 = __importDefault(require("../../../util/interface/CODE"));
const groups_1 = require("../model/groups");
const uuid_1 = require("uuid");
const getRandomCode = () => __awaiter(void 0, void 0, void 0, function* () {
    const code = (0, uuid_1.v4)();
    const isCodeGenerated = yield groups_1.newGroupModel.findOne({ invite_code: code });
    while (isCodeGenerated) {
        getRandomCode();
    }
    return code;
});
const createNewGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        /**
        * check if group already created with same name
        */
        const user = req.user;
        const group = yield groups_1.newGroupModel.findOne({ name: req.body.name, creator_id: user === null || user === void 0 ? void 0 : user._id });
        if (group) {
            res.status(CODE_1.default.BAD_REQUEST).json({
                title: 'New Group Message',
                status: CODE_1.default.BAD_REQUEST,
                successful: false,
                message: 'Group with name  already created.'
            });
            return;
        }
        const code = yield getRandomCode();
        const newGroup = new groups_1.newGroupModel({ name: req.body.name,
            is_public: req.body.is_public,
            creator_id: user === null || user === void 0 ? void 0 : user._id,
            total_round: req.body.max_number_of_members,
            max_number_of_members: req.body.max_number_of_members,
            description: req.body.description,
            frequency: req.body.frequency,
            contribution_amount: req.body.contribution_amount });
        yield newGroup.save();
        yield groups_1.newGroupModel.findOneAndUpdate({ _id: newGroup._id }, { members: [{ id: user === null || user === void 0 ? void 0 : user._id, isAdmin: true }], invite_code: yield getRandomCode() });
        const updatedGroup = yield groups_1.newGroupModel.findOne({ _id: newGroup._id });
        res.status(CODE_1.default.CREATED).json({
            title: 'Create New Group Message',
            status: CODE_1.default.CREATED,
            successful: true,
            message: "New Group Created Successfully !!!!",
            data: {
                new_group: updatedGroup
            }
        });
    }
    catch (e) {
        res.status(CODE_1.default.INTERNAL_SERVER_ERROR).json({
            title: 'Create New Group Message',
            status: CODE_1.default.INTERNAL_SERVER_ERROR,
            successful: false,
            message: "New group creation failed",
            error: e.message
        });
    }
});
exports.createNewGroup = createNewGroup;
const joinGroupByInviteCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        /**
        * check if group already created with same name
        */
        const user = req.user;
        const group_invitation_code = req.body.invite_code;
        let group = yield groups_1.newGroupModel.findOne({ invite_code: group_invitation_code });
        if (group) {
            let members = group.members;
            if (members.length === group.max_number_of_members) {
                res.status(CODE_1.default.BAD_REQUEST).json({
                    title: 'Join Group By Invitation Message',
                    status: CODE_1.default.BAD_REQUEST,
                    successful: false,
                    message: "Group full already.",
                });
                return;
            }
            //check if you are already  member
            if (members.filter(member => member.id === user)) {
                res.status(CODE_1.default.BAD_REQUEST).json({
                    title: 'Join Group By Invitation Message',
                    status: CODE_1.default.BAD_REQUEST,
                    successful: false,
                    message: "Already a group member.",
                });
                return;
            }
            members.push({
                id: user,
                isAdmin: false
            });
            group = yield groups_1.newGroupModel.findOneAndUpdate({ _id: group._id }, { members });
            res.status(CODE_1.default.SUCCESS).json({
                title: 'Join Group By Invitation Message',
                status: CODE_1.default.SUCCESS,
                successful: true,
                message: "Successfully join group by invitation.",
            });
            return;
        }
        res.status(CODE_1.default.BAD_REQUEST).json({
            title: 'Join Group By Invitation Message',
            status: CODE_1.default.BAD_REQUEST,
            successful: false,
            message: "Invalid group link",
        });
    }
    catch (e) {
        res.status(CODE_1.default.INTERNAL_SERVER_ERROR).json({
            title: 'Join Group By Invitation Message',
            status: CODE_1.default.INTERNAL_SERVER_ERROR,
            successful: false,
            message: "New group creation failed",
            error: e.message
        });
    }
});
exports.joinGroupByInviteCode = joinGroupByInviteCode;
const joinGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
    }
    catch (error) {
    }
});
exports.joinGroup = joinGroup;
const getMyGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    try {
        const groups = yield groups_1.newGroupModel.find({ 'members.id': user._id });
        if (groups) {
            res.status(CODE_1.default.SUCCESS).json({
                title: 'My Groups Message',
                status: CODE_1.default.SUCCESS,
                successful: true,
                message: "Groups fetched successfully",
                data: groups
            });
            return;
        }
        res.status(CODE_1.default.SUCCESS).json({
            title: 'My Groups Message',
            status: CODE_1.default.SUCCESS,
            successful: true,
            message: "No group joined or created",
        });
    }
    catch (error) {
        res.status(CODE_1.default.INTERNAL_SERVER_ERROR).json({
            title: 'My Groups Message',
            status: CODE_1.default.INTERNAL_SERVER_ERROR,
            successful: false,
            message: "An error occured",
            error: error.message
        });
    }
});
exports.getMyGroups = getMyGroups;
const getPublicGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const publicGroups = yield groups_1.newGroupModel.find({ is_public: true });
        res.status(CODE_1.default.SUCCESS).json({
            title: 'Public Groups Message',
            status: CODE_1.default.SUCCESS,
            successful: true,
            message: 'Public groups successfully fetched',
            data: publicGroups
        });
    }
    catch (e) {
        res.status(CODE_1.default.INTERNAL_SERVER_ERROR).json({
            title: 'Get Public Groups Message',
            status: CODE_1.default.INTERNAL_SERVER_ERROR,
            successful: false,
            message: 'An error occured',
            error: e.message
        });
    }
});
exports.getPublicGroups = getPublicGroups;
