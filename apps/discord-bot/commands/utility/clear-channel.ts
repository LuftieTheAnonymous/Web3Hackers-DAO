import {  ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

module.exports = {
    cooldown:15,
    data: new SlashCommandBuilder().setName('clear-channel')
        .setDescription('This command clears a channel').addChannelOption(option => option.setName('channel').setDescription('The channel you want to clear').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction:ChatInputCommandInteraction
    ) {
       try{
         if(!interaction.guild) return await interaction.reply("This command can only be used in a server.");
         await interaction.deferReply();
         interaction.channel?.messages.cache.clear();
         await interaction.editReply("Channel cleared!");
       }catch(err){
        console.log(err);
        await interaction.reply("There was an error while executing this command!");
       }
    }
}