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
dotenv_1.default.config();
const data = new discord_js_1.SlashCommandBuilder()
    .setName('user-vote-power')
    .setDescription('Get the voting power of a user').addUserOption(option => option.setName('member').setDescription('The member of the server you want to get the voting power of').setRequired(true));
module.exports = {
    cooldown: 20,
    data: data,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const member = interaction.options.getUser('member');
                if (!member) {
                    yield interaction.reply({ content: `No user found with the nickname given.`, flags: discord_js_1.MessageFlags.Ephemeral });
                    return;
                }
                const request = yield fetch(`${process.env.BACKEND_ENDPOINT}/gov_token/influence/${member.id}`);
                const response = yield request.json();
                console.log(response);
                if (!response || response.error) {
                    yield interaction.reply({ content: response.error, flags: discord_js_1.MessageFlags.Ephemeral });
                    return;
                }
                yield interaction.reply({ content: response.message, flags: discord_js_1.MessageFlags.Ephemeral });
            }
            catch (error) {
                console.error(`Error executing ${interaction}:`, error);
                yield interaction.reply({ content: 'There was an error while executing this command!' });
            }
        });
    }
};
