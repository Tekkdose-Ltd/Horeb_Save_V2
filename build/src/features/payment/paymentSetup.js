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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
class PaymentGateWay {
    constructor() {
        this.BASE_URL = '';
        this.SECRET_KEY = process.env.TESTING_STRIPE_SECRET_KEY;
        this.stripe_instance = undefined;
        this.create_payment_intent = (customer, amount, currency) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            return yield ((_b = this.stripe_instance) === null || _b === void 0 ? void 0 : _b.paymentIntents.create({
                amount,
                currency
            }));
        });
        this.initPayment = () => __awaiter(this, void 0, void 0, function* () {
            var _b;
            return yield ((_b = this.stripe_instance) === null || _b === void 0 ? void 0 : _b.checkout.sessions.create({
                mode: 'payment',
                line_items: [
                    {
                        price_data: {
                            currency: 'NGN',
                            unit_amount: 4000,
                        },
                        quantity: 1
                    }
                ],
                success_url: `http://localhost:3050/webhook/payment/response?sessionId={CHECKOUT_SESSION_ID}`,
                cancel_url: `http://localhost:3050/webhook/payment/canceled`
            }));
        });
        this.stripe_instance = new stripe_1.default(this.SECRET_KEY);
    }
}
_a = PaymentGateWay;
PaymentGateWay.paymentGateWayInstance = undefined;
PaymentGateWay.getPaymentGateWayInstance = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!_a.paymentGateWayInstance) {
        const instance = yield new Promise((resolve, reject) => {
            resolve(new _a());
        });
        _a.paymentGateWayInstance = instance;
        return _a.paymentGateWayInstance;
    }
    return _a.paymentGateWayInstance;
});
exports.default = PaymentGateWay;
