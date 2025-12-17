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
const trustRatings_1 = require("../controller/trustRatings");
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
 *                                     max_number_of_members:
 *                                       type: number
 *
 *                                       description: Total number in a group.
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
/**
 * @swagger
 * /api/v1/horebSave/groups/join:
 *     post:
 *        summary: A user provide invition code to join group.
 *        tags: [Groups]
 *        requestBody:
 *                 description: User data
 *                 required: true
 *                 content:
 *                     application/json:
 *                           schema:
 *                             type: object
 *                             properties:
 *                                    invite_code:
 *                                       type: string
 *
 *                                       description: code to join group.
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
groupsRouter.post('/join', (0, validateRequestBody_1.default)(shema_1.joinGroupValidationSchema), userAuthenticationMiddleware_1.default, groups_1.joinGroupByInviteCode);
/**
 * @swagger
 * /api/v1/horebSave/groups/my:
 *     get:
 *        summary: Get user groups.
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
groupsRouter.get('/my', userAuthenticationMiddleware_1.default, groups_1.getMyGroups);
/**
 * @swagger
 * /api/v1/horebSave/groups/rating:
 *     post:
 *        summary: Group member create a trust rating score for  other members.
 *        tags: [Rating]
 *        requestBody:
 *                 description: User data
 *                 required: true
 *                 content:
 *                     application/json:
 *                           schema:
 *                             type: object
 *                             properties:
 *                                   group_id:
 *                                       type: string
 *
 *                                       description: group id.
 *
 *                                   group_member_id:
 *                                       type: string
 *                                       description: group member id to be rated.
 *
 *
 *                                   rating_score:
 *                                      type: number
 *                                      description: trust rating score.
 *                                   description:
 *                                     type: string
 *                                     description: optional description about the rating.
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
groupsRouter.post('/rating', userAuthenticationMiddleware_1.default, (0, validateRequestBody_1.default)(shema_1.newGroupTrustRatingValidationSchema), trustRatings_1.newGroupTrustRating);
exports.default = groupsRouter;
