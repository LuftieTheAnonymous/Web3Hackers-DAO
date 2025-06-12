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
    .setName('vote-proposal')
    .setDescription('Vote a proposal with your voting power !')
    .addStringOption(option => option.setName('proposal-id')
    .setDescription('Pass the proposal id, you want to vote for.')
    .setRequired(true));
module.exports = {
    cooldown: 20,
    data: data,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const proposalId = interaction.options.getString('proposal-id');
                const member = interaction.options.getUser('member');
                if (!proposalId || (proposalId && !proposalId.startsWith('0x') && proposalId.length !== 42)) {
                    yield interaction.reply({ content: `Invalid proposal id.`, flags: discord_js_1.MessageFlags.Ephemeral });
                    return;
                }
                const proposalRequest = yield fetch(`http://localhost:2137/governance/get_proposal_details/${proposalId}`, {
                    method: 'GET',
                    headers: {
                        'x-backend-eligibility': process.env.DISCORD_BOT_INTERNAL_SECRET,
                    },
                });
                const proposalResponse = yield proposalRequest.json();
                if (!proposalResponse || proposalResponse.error) {
                    yield interaction.reply({ content: proposalResponse.error, flags: discord_js_1.MessageFlags.Ephemeral });
                    return;
                }
                if (!member) {
                    yield interaction.reply({ content: `No user found with the nickname given.`, flags: discord_js_1.MessageFlags.Ephemeral });
                    return;
                }
                const request = yield fetch(`http://localhost:2137/gov_token/influence/${member.id}`);
                const response = yield request.json();
                console.log(response);
                if (!response || response.error) {
                    yield interaction.reply({ content: response.error, flags: discord_js_1.MessageFlags.Ephemeral });
                    return;
                }
                if (Number(response.tokenAmount) === 0 || !response.tokenAmount) {
                    yield interaction.reply({ content: `You don't have any voting power.`, flags: discord_js_1.MessageFlags.Ephemeral });
                    return;
                }
                const delegateTokens = new discord_js_1.ButtonBuilder().setCustomId('delegate-tokens').setLabel('Delegate').setStyle(discord_js_1.ButtonStyle.Primary);
            }
            catch (error) {
                console.error(`Error executing ${interaction}:`, error);
                yield interaction.reply({ content: 'There was an error while executing this command!' });
            }
        });
    }
};
