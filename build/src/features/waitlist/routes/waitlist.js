"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateRequestBody_1 = __importDefault(require("../../../middleware/validateRequestBody"));
const schema_1 = require("../schema");
const waitlist_1 = require("../controller/waitlist");
const userAuthenticationMiddleware_1 = __importDefault(require("../../../middleware/userAuthenticationMiddleware"));
const waitlistRouter = express_1.default.Router();
/**
 * @swagger
 * /api/v1/horebSave/waitlist/join:
 *     post:
 *        summary: A user provide details to join waitlist.
 *        tags: [Waitlist]
 *        requestBody:
 *                 description: User data
 *                 required: true
 *                 content:
 *                     application/json:
 *                           schema:
 *                             type: object
 *                             properties:
 *                                    email:
 *                                       type: string
 *                                       format: email
 *                                       description: email required to setup account.
 *                                    saving_method:
 *                                       type: string
 *
 *                                       description: saving method.
 *                                    first_name:
 *                                       type: string
 *
 *                                       description: first name to set up new account.
 *
 *                                    last_name:
 *                                       type: string
 *
 *                                       description: last name to set up new account.
 *
 *                                    income_pattern:
 *                                      type: string
 *
 *                                      description: Income pattern.
 *
 *                                    phone_number:
 *                                        type: string
 *
 *                                        description: last name to set up new account.
 *
 *
 *                                    priority:
 *                                        type: string
 *
 *                                        description: piority .
 *
 *                                    goal:
 *                                        type: string
 *
 *                                        description: Goals user intend to achieve.
 *
 *
 *                                    early_access:
 *                                        type: string
 *
 *                                        description: early access.
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
waitlistRouter.post('/join', (0, validateRequestBody_1.default)(schema_1.waitlistValidationSchema), waitlist_1.newWaitlist);
/**
 * @swagger
 * /api/v1/horebSave/waitlist/:
 *     get:
 *        summary: Get all waitlist.
 *        tags: [Waitlist]
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
waitlistRouter.get('/', userAuthenticationMiddleware_1.default, waitlist_1.getAllWaitList);
exports.default = waitlistRouter;
