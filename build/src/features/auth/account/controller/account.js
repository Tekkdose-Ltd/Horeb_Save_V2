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
exports.updateUserDetails = exports.refreshToken = exports.getUserProfile = exports.logout = exports.loginAccount = exports.createNewAccount = void 0;
const CODE_1 = __importDefault(require("../../../../util/interface/CODE"));
const createAccountModel_1 = require("../model/createAccountModel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createNewAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        /**
               * check if account already created with same email
               */
        const accountAlreadyCreated = yield createAccountModel_1.newAccountModel.findOne({ email: req.body.email });
        if (accountAlreadyCreated) {
            res.status(CODE_1.default.BAD_REQUEST).json({
                title: 'New Account Message',
                status: CODE_1.default.BAD_REQUEST,
                successful: false,
                message: 'Account already created.'
            });
            return;
        }
        /**
         * check if password follows the right standard alphanumeric characters
         */
        if (!(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/.test(req.body.password))) {
            res.status(CODE_1.default.BAD_REQUEST).json({
                title: 'New Account Message',
                status: CODE_1.default.BAD_REQUEST,
                successful: false,
                message: 'password must contain atleast aphanumeric characters and symbols .'
            });
            return;
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(req.body.password, salt);
        const newAccount = new createAccountModel_1.newAccountModel(Object.assign(Object.assign({}, req.body), { password: hashedPassword }));
        yield newAccount.save();
        const token = jsonwebtoken_1.default.sign({ email: req.body.email, first_name: req.body.first_name, last_name: req.body.last_name }, (_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.APP_SECRET_TOKEN_SIGNER_KEY);
        res.status(CODE_1.default.CREATED).json({
            title: 'Create New Account Message',
            status: CODE_1.default.CREATED,
            successful: true,
            message: "New Account Created Successfully !!!!",
            data: {
                token,
            }
        });
    }
    catch (e) {
        res.status(CODE_1.default.BAD_REQUEST).json({
            title: 'Create New Account Message',
            status: CODE_1.default.BAD_REQUEST,
            successful: false,
            message: "New Account creation failed",
            error: e.message
        });
    }
});
exports.createNewAccount = createNewAccount;
const loginAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { email, password } = req.body;
        let user = yield createAccountModel_1.newAccountModel.findOne({ email });
        if (user) {
            const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
            if (isPasswordValid) {
                const token = jsonwebtoken_1.default.sign({
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email
                }, (_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.APP_SECRET_TOKEN_SIGNER_KEY, { expiresIn: 1500 });
                yield user.updateOne({ last_seen: Date.now(), isLoggedIn: true, lastLoggedInToken: token });
                user = yield createAccountModel_1.newAccountModel.findOne({ email });
                res.status(CODE_1.default.SUCCESS).json({
                    title: 'Login Account',
                    successful: true,
                    status: CODE_1.default.SUCCESS,
                    message: 'Successfully logged in.',
                    data: Object.assign(Object.assign({}, user === null || user === void 0 ? void 0 : user.toObject()), { token })
                });
                return;
            }
            res.status(CODE_1.default.BAD_REQUEST).json({
                title: 'Login Account',
                successful: false,
                status: CODE_1.default.BAD_REQUEST,
                message: 'Invalid credential provided.',
            });
        }
        else {
            res.status(CODE_1.default.BAD_REQUEST).json({
                title: 'Login Account',
                successful: false,
                status: CODE_1.default.BAD_REQUEST,
                message: 'Invalid credential provided.',
            });
        }
    }
    catch (error) {
        res.status(CODE_1.default.INTERNAL_SERVER_ERROR).json({
            title: 'Login Account',
            successful: false,
            status: CODE_1.default.INTERNAL_SERVER_ERROR,
            message: 'Something went wrong try again.',
            error: error.message
        });
    }
});
exports.loginAccount = loginAccount;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield createAccountModel_1.newAccountModel.findOne({ email: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email });
        if (user && user.email && user.isLoggedIn) {
            yield createAccountModel_1.newAccountModel.updateOne({ last_seen: Date.now(), isLoggedIn: false, lastLoggedInToken: '' });
            res.status(CODE_1.default.SUCCESS).json({
                title: 'Logout Account',
                successful: true,
                status: CODE_1.default.SUCCESS,
                message: 'Successfully logged out.',
            });
            return;
        }
        res.status(CODE_1.default.UNAUTHORIZED).json({
            title: 'Logout Account',
            successful: false,
            status: CODE_1.default.UNAUTHORIZED,
            message: 'Not authorized.',
        });
    }
    catch (error) {
        res.status(CODE_1.default.INTERNAL_SERVER_ERROR).json({
            title: 'Logout Account',
            successful: false,
            status: CODE_1.default.INTERNAL_SERVER_ERROR,
            message: 'Something went wrong try again.',
            error: error.message
        });
    }
});
exports.logout = logout;
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const email = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
        const user = yield createAccountModel_1.newAccountModel.findOne({ email });
        if (user && user.isLoggedIn) {
            res.status(CODE_1.default.SUCCESS).json({
                title: 'Get current user profile',
                status: CODE_1.default.SUCCESS,
                successful: true,
                message: "Successfully fetched.",
                data: user
            });
            return;
        }
        res.status(CODE_1.default.UNAUTHORIZED).json({
            title: 'Get current user profile',
            successful: false,
            status: CODE_1.default.UNAUTHORIZED,
            message: 'Unauthorized',
        });
    }
    catch (error) {
        res.status(CODE_1.default.INTERNAL_SERVER_ERROR).json({
            title: 'Logout Account',
            successful: false,
            status: CODE_1.default.INTERNAL_SERVER_ERROR,
            message: 'Something went wrong try again.',
            error: error.message
        });
    }
});
exports.getUserProfile = getUserProfile;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const body = req.body;
        const token = body.token;
        const user_id = body.user_id;
        //check if user is registered 
        const user = yield createAccountModel_1.newAccountModel.findOne({ _id: user_id }).select('+lastLoggedInToken');
        if (user && user.isLoggedIn) {
            if (user.lastLoggedInToken !== token) {
                res.status(CODE_1.default.Forbidden).json({
                    title: 'Refresh Token',
                    successful: false,
                    status: CODE_1.default.Forbidden,
                    message: 'Invalid token provided.',
                });
                return;
            }
            jsonwebtoken_1.default.verify(token, (_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.APP_SECRET_TOKEN_SIGNER_KEY, (err) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                if (err) {
                    if (err.name === 'TokenExpiredError') {
                        const token = jsonwebtoken_1.default.sign({
                            first_name: user.first_name,
                            last_name: user.last_name,
                            email: user.email
                        }, (_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.APP_SECRET_TOKEN_SIGNER_KEY, { expiresIn: 1500 });
                        yield user.updateOne({ lastLoggedInToken: token });
                        res.status(CODE_1.default.SUCCESS).json({
                            title: 'Refresh Token',
                            successful: true,
                            status: CODE_1.default.SUCCESS,
                            message: 'Token refreshed.',
                            data: {
                                new_token: token
                            }
                        });
                        return;
                    }
                    res.status(CODE_1.default.Forbidden).json({
                        title: 'Refresh Token',
                        successful: false,
                        status: CODE_1.default.Forbidden,
                        message: 'Invalid token provided.',
                    });
                    return;
                }
                res.status(CODE_1.default.BAD_REQUEST).json({
                    title: 'Refresh Token',
                    successful: false,
                    status: CODE_1.default.BAD_REQUEST,
                    message: 'Token not expired.',
                });
            }));
            return;
        }
        res.status(CODE_1.default.Forbidden).json({
            title: 'Reresh Token',
            successful: false,
            status: CODE_1.default.Forbidden,
            message: 'Invalid details.',
        });
    }
    catch (error) {
        res.status(CODE_1.default.INTERNAL_SERVER_ERROR).json({
            title: 'Refresh Token',
            successful: false,
            status: CODE_1.default.INTERNAL_SERVER_ERROR,
            message: 'Invalid credential provided.',
        });
    }
});
exports.refreshToken = refreshToken;
const updateUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let user = yield createAccountModel_1.newAccountModel.findOne({ email: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email });
        if (user && user.isLoggedIn) {
            yield user.updateOne(req.body);
            user = yield createAccountModel_1.newAccountModel.findOne({ email: user.email });
            res.status(CODE_1.default.SUCCESS).json({
                title: 'Update user details',
                successful: true,
                status: CODE_1.default.SUCCESS,
                message: 'Successfull.',
            });
        }
        else {
            res.status(CODE_1.default.UNAUTHORIZED).json({
                title: 'Update user details',
                successful: false,
                status: CODE_1.default.UNAUTHORIZED,
                message: 'Unauthorized access.',
            });
        }
    }
    catch (error) {
        res.status(CODE_1.default.INTERNAL_SERVER_ERROR).json({
            title: 'Update user details',
            successful: false,
            status: CODE_1.default.INTERNAL_SERVER_ERROR,
            message: 'Invalid details.',
        });
    }
});
exports.updateUserDetails = updateUserDetails;
