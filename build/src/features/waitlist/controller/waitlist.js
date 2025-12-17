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
exports.getAllWaitList = exports.newWaitlist = void 0;
const CODE_1 = __importDefault(require("../../../util/interface/CODE"));
const UserRole_1 = require("../../../util/interface/UserRole");
const waitlist_1 = require("../model/waitlist");
const newWaitlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newWaitlist = new waitlist_1.newWaitlistModel(req.body);
        yield newWaitlist.save();
        res.status(CODE_1.default.CREATED).json({
            title: 'Waitlist  Message',
            status: CODE_1.default.CREATED,
            successful: true,
            message: "Waitlist created.",
        });
    }
    catch (error) {
        res.status(CODE_1.default.INTERNAL_SERVER_ERROR).json({
            title: 'Waitlist   Message',
            status: CODE_1.default.INTERNAL_SERVER_ERROR,
            successful: false,
            message: "An error occured.",
            error: error.message
        });
    }
});
exports.newWaitlist = newWaitlist;
const getAllWaitList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (user.role === UserRole_1.USER_ROLES.ADMIN) {
            const waitlist = yield waitlist_1.newWaitlistModel.find();
            res.status(CODE_1.default.SUCCESS).json({
                title: 'Waitlist   Message',
                status: CODE_1.default.SUCCESS,
                successful: true,
                message: "Waitlist Successfully fetched.",
                data: waitlist
            });
        }
        else {
            res.status(CODE_1.default.UNAUTHORIZED).json({
                title: 'Waitlist   Message',
                status: CODE_1.default.UNAUTHORIZED,
                successful: false,
                message: "UnAuthorized access.",
            });
        }
    }
    catch (error) {
        res.status(CODE_1.default.INTERNAL_SERVER_ERROR).json({
            title: 'Waitlist   Message',
            status: CODE_1.default.INTERNAL_SERVER_ERROR,
            successful: false,
            message: "An error occured.",
            error: error.message
        });
    }
});
exports.getAllWaitList = getAllWaitList;
