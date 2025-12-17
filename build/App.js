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
const express_1 = __importDefault(require("express"));
const errorHandlerMiddleware_1 = require("./src/middleware/errorHandlerMiddleware");
const routes_1 = __importDefault(require("./src/routes"));
const databaseConfig_1 = require("./src/config/database/databaseConfig");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggersetup_1 = __importDefault(require("./src/config/api-docummentation/swaggersetup"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const paymentSetup_1 = __importDefault(require("./src/features/payment/paymentSetup"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: '*', allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
// api docummentation setup
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggersetup_1.default));
//allow json body api request
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
//handle all routes of the app
app.use('/api/v1/horebSave', routes_1.default);
app.get('/api/groups/:groupId/members/:memberId/ratings', (req, res) => {
    console.log(`${req.params}`);
    res.send('Horeb Save Backend is running');
});
app.get('/webhook/payment/response', (req, res) => {
    console.log(`${req.body}`);
    res.status(200).end();
});
//handle general error of the app
app.use(errorHandlerMiddleware_1.errorHandler);
//connect to mongose db before starting sever
(0, databaseConfig_1.connectDB)().then((e) => {
    app.listen(3050, () => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Listening to port 3050');
        try {
            const payment = yield paymentSetup_1.default.getPaymentGateWayInstance();
            //    const session = await  payment.create_payment_intent('benjoe',300000,'NGN')
            //
            //  console.log(session)
        }
        catch (error) {
            console.log(`error ${error.message}`);
        }
    }));
}).catch(() => {
    process.exit(1);
});
