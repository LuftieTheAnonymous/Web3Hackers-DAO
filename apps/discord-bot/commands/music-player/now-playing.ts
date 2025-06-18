import { useMainPlayer, useQueue } from 'discord-player';
import {   ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

 const data = new SlashCommandBuilder()
  .setName('now-playing') // Command name
  .setDescription('Show the currently playing song !'); 

module.exports = {
    cooldown:20,
    data: data,
    async execute(interaction:ChatInputCommandInteraction) {
        if(!interaction.guild) return;
const queue=useQueue();
try{
if(!queue) return await interaction.reply({content:"No music is being played right now."});

  // Get the currently playing song
  const currentSong = queue.currentTrack as any;

  console.log(currentSong);
 
  // Check if there is a song playing
  if (!currentSong) {
    return interaction.reply('No song is currently playing.');
  }
 
  // Send the currently playing song information
  return interaction.reply(`Now playing: ${currentSong.name}`);


}
catch(error) {
console.error(`Error executing ${interaction}:`, error);
await interaction.reply({ content: 'There was an error while executing this command!' });
}
}
}