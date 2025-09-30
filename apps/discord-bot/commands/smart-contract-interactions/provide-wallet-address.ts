import { ChatInputCommandInteraction, MessageFlags, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ActionRowBuilder } from "discord.js";

module.exports = {
data: new SlashCommandBuilder().setName('register-wallet').setDescription('This command registers you with your wallet to DB for future use !'),
async execute(interaction:ChatInputCommandInteraction){


const modal = new ModalBuilder().setCustomId('wallet-modal').setTitle('Please enter your wallet address');

        const input = new TextInputBuilder().setCustomId('walletAddress').setLabel('Enter your wallet address').setPlaceholder('0x...').setStyle(TextInputStyle.Short).setRequired(true).setMinLength(42).setMaxLength(42);

        const inputRow = new ActionRowBuilder<TextInputBuilder>().addComponents(input);


        modal.addComponents(inputRow);
    try {
        await interaction.showModal(modal);
        
    } catch (error) {
        console.error(error);
        await interaction.editReply({ content: 'There was an error while executing this command !', });
    }


},

}