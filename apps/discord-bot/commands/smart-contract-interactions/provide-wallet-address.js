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
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const discord_js_2 = require("discord.js");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder().setName('register-wallet').setDescription('This command registers you with your wallet to DB for future use !'),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const modal = new discord_js_1.ModalBuilder().setCustomId('wallet-modal').setTitle('Please enter your wallet address');
            const input = new discord_js_1.TextInputBuilder().setCustomId('walletAddress').setLabel('Enter your wallet address').setPlaceholder('0x...').setStyle(discord_js_1.TextInputStyle.Short).setRequired(true).setMinLength(42).setMaxLength(42);
            const inputRow = new discord_js_2.ActionRowBuilder().addComponents(input);
            modal.addComponents(inputRow);
            try {
                yield interaction.showModal(modal);
            }
            catch (error) {
                console.error(error);
                yield interaction.editReply({ content: 'There was an error while executing this command !', });
            }
        });
    },
};
