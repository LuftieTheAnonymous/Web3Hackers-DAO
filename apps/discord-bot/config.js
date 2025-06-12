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
exports.getTokenURL = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getTokenURL = (symbol, targetSymbols) => __awaiter(void 0, void 0, void 0, function* () {
    const baseUrl = 'https://min-api.cryptocompare.com/data/price';
    const params = { "tsyms": targetSymbols, "fsym": symbol, "tryConversion": true, "relaxedValidation": true, "sign": true };
    const url = new URL(baseUrl);
    url.search = new URLSearchParams(params).toString();
    const cryptoPriceTickerRequest = yield fetch(`${url}`, {
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Api-Key': process.env.COINDESK_API_KEY,
        }
    });
    const cryptoPriceTicker = yield cryptoPriceTickerRequest.json();
    return cryptoPriceTicker;
});
exports.getTokenURL = getTokenURL;
