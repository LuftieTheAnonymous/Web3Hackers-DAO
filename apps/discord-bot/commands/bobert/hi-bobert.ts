import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
import { getResponseFromBobert } from '../../bobert/bobertConfig';
dotenv.config();

const data = new SlashCommandBuilder()
.setName('hi-bobert')
.setDescription('Run this command and chat with our AI based Bobert Bot !')
.addStringOption(option =>
      option.setName('message-content')
        .setDescription('The message you want to send to Bobert 🤖')
        .setRequired(true).setMinLength(10).setMaxLength(500)
);
module.exports = {
    cooldown:20,
    data: data,
    async execute(interaction:ChatInputCommandInteraction
) {
try{

    await interaction.deferReply();

    const messageContent = interaction.options.getString('message-content');

    const bobertAnswer = await getResponseFromBobert(messageContent as string);

    await interaction.followUp({content:bobertAnswer });

}
catch(error) {
    console.error(`Error executing ${interaction}:`, error);
    await interaction.followUp({ content: 'There was an error while executing this command!' });
    }
}
}