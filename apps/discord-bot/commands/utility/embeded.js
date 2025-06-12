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
const date_fns_1 = require("date-fns");
const discord_js_1 = require("discord.js");
const discord_js_2 = require("discord.js");
module.exports = {
    cooldown: 15,
    data: new discord_js_1.SlashCommandBuilder().setName('get-proposal-info')
        .setDescription('Enables user to see the info of a proposal, to vote on it').addStringOption(option => option.setName('proposal-id').setDescription('Pass the proposal id, you want to vote for.').setRequired(true)),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!interaction.guild) {
                    return;
                }
                ;
                const proposalId = interaction.options.getString('proposal-id');
                yield interaction.deferReply();
                const proposalEmbedDetailsFetch = yield fetch(`http://localhost:2137/governance/get_embeded_proposal_details/${proposalId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-backend-eligibility': process.env.DISCORD_BOT_INTERNAL_SECRET,
                    },
                });
                const proposalEmbedDetails = yield proposalEmbedDetailsFetch.json();
                console.log(proposalEmbedDetails);
                if (!proposalEmbedDetails || proposalEmbedDetails.error) {
                    yield interaction.editReply({ content: proposalEmbedDetails.error.message });
                    return;
                }
                const proposalOptions = proposalEmbedDetails.db_data.dao_vote_options.map((option) => ({ name: option.voting_option_text, value: option.isExecuting ? 'Executes the callbacks' : 'Does not execute the callbacks', inline: true }));
                const exampleEmbed = new discord_js_2.EmbedBuilder()
                    .setColor(0x05F29B)
                    .setTitle(`${proposalEmbedDetails.db_data.proposal_title}`)
                    .setURL(proposalEmbedDetails.db_data.dao_members.photoURL)
                    .setDescription(`${proposalEmbedDetails.sm_data.description}`).setAuthor({ 'name': `${proposalEmbedDetails.db_data.dao_members.nickname}`, 'iconURL': `${proposalEmbedDetails.db_data.dao_members.photoURL}` })
                    .setThumbnail('../../images/Web3-Builders.jpg')
                    .addFields(...proposalOptions)
                    .setTimestamp()
                    .setFooter({ text: `Finishes at ${(0, date_fns_1.formatDate)(proposalEmbedDetails.db_data.expires_at, 'dd/MM/yyyy')}` });
                yield interaction.editReply({ 'content': `Here you are 😁`, 'embeds': [exampleEmbed] });
            }
            catch (err) {
                console.log(err);
                yield interaction.editReply({ content: 'There was an error while executing this command!' });
            }
        });
    }
};
