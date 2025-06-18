import { useQueue } from 'discord-player';
import {   ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

 const data = new SlashCommandBuilder()
  .setName('queue-song') // Command name
  .setDescription('Queue the song !'); 

module.exports = {
    cooldown:20,
    data: data,
    async execute(interaction:ChatInputCommandInteraction) {
        if(!interaction.guild) return;

        // Get the current queue
  const queue = useQueue(interaction.guild);
 
  if (!queue) {
    return interaction.reply(
      'This server does not have an active player session.',
    );
  }
 
  // Get the current track
  const currentTrack = queue.currentTrack as any;
 
  // Get the upcoming tracks
  const upcomingTracks = (queue.tracks as any).slice(0, 5);
 
  // Create a message with the current track and upcoming tracks
  const message = [
    `**Now Playing:** ${currentTrack.title} - ${currentTrack.author}`,
    '',
    '**Upcoming Tracks:**',
    ...upcomingTracks.map(
      (track:any, index:number) => `${index + 1}. ${track.title} - ${track.author}`,
    ),
  ].join('\n');
 
  // Send the message
  return interaction.reply(message);


}
}