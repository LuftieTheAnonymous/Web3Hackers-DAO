import { useMainPlayer, useQueue } from 'discord-player';
import {   ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const data = new SlashCommandBuilder()
.setName('skip-song')
.setDescription('Play your favorite song on the channel and chill with your hacker-gang on discord, do not be a caveman 😅')
.addStringOption(input=>input.setName('song').setDescription('The song you want to play').setRequired(true));

module.exports = {
    cooldown:20,
    data: data,
    async execute(interaction:any) {
        if(!interaction.guild) return;

        // Get the current queue
        const queue = useQueue();
try{
 
  if (!queue) {
    return interaction.reply(
      'This server does not have an active player session.',
    );
  }
 
  if (!queue.isPlaying()) {
    return interaction.reply('There is no track playing.');
  }
 
  // Skip the current track
  queue.node.skip();
 
  // Send a confirmation message
  return interaction.reply('The current song has been skipped.');

}
catch(error) {
console.error(`Error executing ${interaction}:`, error);
await interaction.reply({ content: 'There was an error while executing this command!' });
}
}
}