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
const bobertConfig_1 = require("../../bobert/bobertConfig");
dotenv_1.default.config();
const data = new discord_js_1.SlashCommandBuilder()
    .setName('hi-bobert')
    .setDescription('Run this command and chat with our AI based Bobert Bot !')
    .addStringOption(option => option.setName('message-content')
    .setDescription('The message you want to send to Bobert 🤖')
    .setRequired(true).setMinLength(10).setMaxLength(500));
module.exports = {
    cooldown: 20,
    data: data,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield interaction.deferReply();
                const messageContent = interaction.options.getString('message-content');
                const bobertAnswer = yield (0, bobertConfig_1.getResponseFromBobert)(messageContent);
                yield interaction.followUp({ content: bobertAnswer });
            }
            catch (error) {
                console.error(`Error executing ${interaction}:`, error);
                yield interaction.followUp({ content: 'There was an error while executing this command!' });
            }
        });
    }
};
