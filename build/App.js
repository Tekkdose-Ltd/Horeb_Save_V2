"use strict";
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
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
// api docummentation setup
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggersetup_1.default));
//allow json body api request
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
//handle all routes of the app
app.use('/api/v1/horebSave', routes_1.default);
//handle general error of the app
app.use(errorHandlerMiddleware_1.errorHandler);
//connect to mongose db before starting sever
(0, databaseConfig_1.connectDB)().then((e) => {
    app.listen(3050, () => {
        console.log('Listening to port 3050');
    });
}).catch(() => {
    process.exit(1);
});
