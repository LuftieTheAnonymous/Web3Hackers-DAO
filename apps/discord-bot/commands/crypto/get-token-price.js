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
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = require("../../config");
dotenv_1.default.config();
const data = new discord_js_1.SlashCommandBuilder()
    .setName('get-token-price')
    .setDescription('Get the owner of the server')
    .addStringOption(option => option.setName('price-of')
    .setDescription('The token/coin we want to get the price of')
    .setRequired(true)).addStringOption(option => option.setName('price-in-tickers')
    .setDescription('Write the sequence of tickers you want to get the price of e.g. ETH,USDC')
    .setRequired(true))
    .addChannelOption(option => option.setName('channel').addChannelTypes(discord_js_1.ChannelType.GuildText)
    .setDescription('The channel to send the message').setRequired(true));
module.exports = {
    cooldown: 20,
    data: data,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield interaction.deferReply();
                const priceOf = interaction.options.getString('price-of');
                const priceInTickers = interaction.options.getString('price-in-tickers');
                const cryptoPriceTickers = yield (0, config_1.getTokenURL)(priceOf, priceInTickers);
                if (!cryptoPriceTickers || cryptoPriceTickers.Response === 'Error') {
                    return yield interaction.followUp({ content: `${cryptoPriceTickers.Response}: ${cryptoPriceTickers.Message}` });
                }
                yield interaction.followUp(`The price on ${priceOf} with tickers ${priceInTickers} are:\n ${Object.keys(cryptoPriceTickers).map((ticker) => `${priceOf} 💱 ${ticker} : ${cryptoPriceTickers[ticker]}`).join('\n')}`);
            }
            catch (error) {
                console.error(`Error executing ${interaction}:`, error);
                yield interaction.followUp({ content: 'There was an error while executing this command!' });
            }
        });
    }
};
