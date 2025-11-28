"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const accountRoute_1 = __importDefault(require("./features/auth/account/route/accountRoute"));
const groups_1 = __importDefault(require("./features/groups/route/groups"));
const mainAppRouter = express_1.default.Router();
mainAppRouter.use('/auth', accountRoute_1.default);
mainAppRouter.use('/groups', groups_1.default);
exports.default = mainAppRouter;
