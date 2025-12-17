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
exports.updateUserDetails = exports.refreshToken = exports.getUserProfile = exports.logout = exports.loginAccount = exports.verifyEmailLink = exports.createNewAccount = void 0;
const uuid_1 = require("uuid");
const nodeMailer_1 = __importDefault(require("../../../../config/mail/nodeMailer"));
const CODE_1 = __importDefault(require("../../../../util/interface/CODE"));
const createAccountModel_1 = require("../model/createAccountModel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validateUserAndRefererEmail_1 = require("../model/validateUserAndRefererEmail");
const createNewAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const isEmailSentLinkAlreadyGenerated = yield validateUserAndRefererEmail_1.ValidateUserAndRefererEmail.findOne({ email_to_validate: req.body.email, who_to_validate: 'user_email' });
        if (isEmailSentLinkAlreadyGenerated) {
            res.status(CODE_1.default.BAD_REQUEST).json({
                title: 'New Account Message',
                status: CODE_1.default.BAD_REQUEST,
                successful: false,
                message: 'A verification link has already been sent to this email address. Please check your inbox.'
            });
            return;
        }
        if (req.body.surety_email === req.body.email) {
            res.status(CODE_1.default.BAD_REQUEST).json({
                title: 'New Account Message',
                status: CODE_1.default.BAD_REQUEST,
                successful: false,
                message: 'You  cannot serve as a surety for yourself.'
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
        //send email with magic link to verify email
        const verify_email_link = yield generateMagicLinkCode();
        yield (0, nodeMailer_1.default)({
            receiver: req.body.email,
            subject: 'Complete your Horeb Save account registration',
            template: 'registeration_email.ejs',
            emailData: {
                fullName: `${req.body.first_name} ${req.body.last_name}`,
                verify_email_link: verify_email_link
            }
        });
        yield (0, nodeMailer_1.default)({
            receiver: req.body.surety_email,
            subject: 'Horeb Save Guarantor Verification',
            template: 'guarantor_verification_email.ejs',
            emailData: {
                fullName: `${req.body.surety_email}`,
                guarantee: `${req.body.first_name} ${req.body.last_name}`,
                verify_email_link: verify_email_link
            }
        });
        yield new validateUserAndRefererEmail_1.ValidateUserAndRefererEmail({
            who_to_validate: 'user_email',
            email_to_validate: req.body.email,
            magic_link: verify_email_link,
            temp_data: req.body
        }).save();
        yield new validateUserAndRefererEmail_1.ValidateUserAndRefererEmail({
            who_to_validate: 'referer_email',
            email_to_validate: req.body.surety_email,
            magic_link: verify_email_link,
            temp_data: req.body,
            standing_for: req.body.email
        }).save();
        res.status(CODE_1.default.SUCCESS).json({
            title: 'Create New Account Message',
            status: CODE_1.default.SUCCESS,
            successful: true,
            message: "Email sent to verify your email address  !!!!",
            data: { isEmailSent: true }
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
const verifyEmailLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const magicLinkCode = req.query.code;
        const validateMagicLink = yield validateUserAndRefererEmail_1.ValidateUserAndRefererEmail.findOne({ magic_link: (_b = (_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.base_url) === null || _b === void 0 ? void 0 : _b.concat('api/v1/horebSave/auth/verify-email?code=').concat(magicLinkCode) });
        if (validateMagicLink && validateMagicLink.who_to_validate === 'user_email') {
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hashedPassword = yield bcryptjs_1.default.hash(validateMagicLink.temp_data.password, salt);
            const newAccount = new createAccountModel_1.newAccountModel(Object.assign(Object.assign({}, validateMagicLink.temp_data), { password: hashedPassword }));
            yield newAccount.save();
            res.redirect((_c = process === null || process === void 0 ? void 0 : process.env) === null || _c === void 0 ? void 0 : _c.FRONTEND_BASE_URL.concat('/login'));
            //   const token = jwt.sign({email:validateMagicLink.temp_data.email,first_name:validateMagicLink.temp_data.first_name,last_name:validateMagicLink.temp_data.last_name},process?.env?.APP_SECRET_TOKEN_SIGNER_KEY!!)
            /*res.status(SERVER_STATUS.CREATED).json({
              title:'Create New Account Message',
              status:SERVER_STATUS.CREATED,
              successful:true,
              message:"New Account Created Successfully !!!!",
              data:{
               
              token,
      
              }
            })*/
            return;
        }
        res.status(CODE_1.default.BAD_REQUEST).json({
            title: 'Verify Email Link',
            successful: false,
            status: CODE_1.default.BAD_REQUEST,
            message: 'Invalid or expired link.',
        });
    }
    catch (error) {
        res.status(CODE_1.default.INTERNAL_SERVER_ERROR).json({
            title: 'Verify Email Link',
            successful: false,
            status: CODE_1.default.INTERNAL_SERVER_ERROR,
            message: 'Something went wrong try again.',
            error
        });
    }
});
exports.verifyEmailLink = verifyEmailLink;
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
const generateMagicLinkCode = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const isMagicLinkGeneratedBefore = yield validateUserAndRefererEmail_1.ValidateUserAndRefererEmail.findOne({ magic_link: (_b = (_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.base_url) === null || _b === void 0 ? void 0 : _b.concat('verify-email?code=').concat((0, uuid_1.v4)()) });
    while (isMagicLinkGeneratedBefore) {
        return generateMagicLinkCode();
    }
    return (_d = (_c = process === null || process === void 0 ? void 0 : process.env) === null || _c === void 0 ? void 0 : _c.base_url) === null || _d === void 0 ? void 0 : _d.concat('api/v1/horebSave/auth/verify-email?code=').concat((0, uuid_1.v4)());
});
