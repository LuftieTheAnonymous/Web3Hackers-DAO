import { GuildQueueTimeline, useMainPlayer, useQueue, useTimeline } from 'discord-player';
import {   ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

 const data = new SlashCommandBuilder()
  .setName('pause-song') // Command name
  .setDescription('Pause the song !'); 

module.exports = {
    cooldown:20,
    data: data,
    async execute(interaction:ChatInputCommandInteraction) {
        if(!interaction.guild) return;

        // Get the queue's timeline
    
        const timeline = useTimeline({'node':interaction.guild});
try{
 
  if (!timeline) {
    return await interaction.reply(
      'This server does not have an active player session.',
    );
  }
 
  // Invert the pause state
  const wasPaused = timeline.paused;
 
  wasPaused ? timeline.resume() : timeline.pause();
 
  // If the timeline was previously paused, the queue is now back to playing
  return await interaction.reply(
    `The player is now ${wasPaused ? 'playing' : 'paused'}.`,
  );

}
catch(error) {
console.error(`Error executing ${interaction}:`, error);
await interaction.reply({ content: 'There was an error while executing this command!' });
}
}
}