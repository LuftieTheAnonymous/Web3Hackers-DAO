import { useMainPlayer, useQueue } from 'discord-player';
import {   ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

 const data = new SlashCommandBuilder()
  .setName('shuffle') // Command name
  .setDescription('Shuffle the queue !'); 

module.exports = {
    cooldown:20,
    data: data,
    async execute(interaction:ChatInputCommandInteraction) {
        if(!interaction.guild) return;
const queue=useQueue(interaction.guild);
try{
if (!queue) {
    return interaction.reply(
      'This server does not have an active player session.',
    );
  }
 
  // Check if there are enough tracks in the queue
  if (queue.tracks.size < 2)
    return await interaction.reply(
      'There are not enough tracks in the queue to shuffle.',
    );
 
  // Shuffle the tracks in the queue
  queue.tracks.shuffle();
 
  // Send a confirmation message
  return await interaction.reply(`Shuffled ${queue.tracks.size} tracks.`);



}
catch(error) {
console.error(`Error executing ${interaction}:`, error);
await interaction.reply({ content: 'There was an error while executing this command!' });
}
}
}