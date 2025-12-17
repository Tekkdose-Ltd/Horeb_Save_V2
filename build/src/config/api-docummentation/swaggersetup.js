"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: "Horeb Save Api Doc",
            version: '1.0.0',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                },
            },
        },
        security: [
            {
                bearerAuth: []
            }
        ],
    },
    apis: ['./src/swagger-api/*.ts', './src/features/auth/account/route/accountRoute.ts', './src/features/groups/route/groups.ts',
        './src/features/waitlist/routes/waitlist.ts'
    ]
};
exports.default = (0, swagger_jsdoc_1.default)(options);
