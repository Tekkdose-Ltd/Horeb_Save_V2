"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupInvite = void 0;
const express_1 = __importDefault(require("express"));
const userAuthenticationMiddleware_1 = __importDefault(require("../../../middleware/userAuthenticationMiddleware"));
const validateRequestBody_1 = __importDefault(require("../../../middleware/validateRequestBody"));
const shema_1 = require("../shema");
const groups_1 = require("../controller/groups");
const groupsRouter = express_1.default.Router();
exports.groupInvite = express_1.default.Router();
/**
 * @swagger
 * /api/v1/horebSave/groups/:
 *     post:
 *        summary: A user provide name  and other details required  to create new group.
 *        tags: [Groups]
 *        requestBody:
 *                 description: User data
 *                 required: true
 *                 content:
 *                     application/json:
 *                           schema:
 *                             type: object
 *                             properties:
 *                                     name:
 *                                       type: string
 *
 *                                       description: name of the group.
 *                                     is_public:
 *                                       type: boolean
 *
 *                                       description: If group is private or public.
 *                                     description:
 *                                       type: string
 *
 *                                       description: A description about group.
 *                                     total_round:
 *                                       type: number
 *
 *                                       description: Total rounds to go.
 *                                     frequency:
 *                                       type: string
 *
 *                                       description: The frequency either 'weekly' or 'monthly' or'bi-weekly'.
 *
 *                                     contribution_amount:
 *                                       type: number
 *
 *                                       description: Contribution amount.
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *                           required:
 *                               -email
 *                               -password
 *        responses:
 *                200:
 *                 description: New account created successfully.
 *        content:
 *           application/json:
 *                shema:
 *                     type: object
 *                     properties:
 *                         email:
 *                            type: string
 *                            format: email
 *
 *
 *
 *
 *
 *
 */
groupsRouter.post('/', userAuthenticationMiddleware_1.default, (0, validateRequestBody_1.default)(shema_1.createNewGroupValidationSchema), groups_1.createNewGroup);
/**
 * @swagger
 * /api/v1/horebSave/groups/public:
 *     get:
 *        summary: Get public groups.
 *        tags: [Groups]
 *
 *        responses:
 *                200:
 *                 description: Groups fetched successfully.
 *        content:
 *           application/json:
 *                shema:
 *                     type: object
 *                     properties:
 *                         email:
 *                            type: string
 *                            format: email
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
groupsRouter.get('/public', userAuthenticationMiddleware_1.default, groups_1.getPublicGroups);
exports.default = groupsRouter;
