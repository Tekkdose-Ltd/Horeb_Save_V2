"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = __importDefault(require("zod"));
const CODE_1 = __importDefault(require("../util/interface/CODE"));
exports.default = (shema) => {
    return (req, res, next) => {
        try {
            if (req.body.date_of_birth) {
                console.log(req.body.date_of_birth);
                const datetime = zod_1.default.iso.datetime();
                req.body = shema.parse(Object.assign(Object.assign({}, req.body), { date_of_birth: datetime.parse(req.body.date_of_birth) }));
                next();
                return;
            }
            req.body = shema.parse(req.body);
            next();
        }
        catch (e) {
            if (e instanceof zod_1.default.ZodError) {
                const formattedErrors = e.issues.map(issue => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                    code: issue.code,
                }));
                res.status(CODE_1.default.BAD_REQUEST).json({
                    title: "Body Response Validation",
                    status: CODE_1.default.BAD_REQUEST,
                    successful: false,
                    message: 'Failed to validate body response',
                    error: formattedErrors
                });
                return;
            }
            next(e);
        }
    };
};
