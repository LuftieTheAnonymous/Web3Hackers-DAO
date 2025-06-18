import { useMainPlayer } from 'discord-player';
import {   ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
import { player } from '../..';
dotenv.config();

const data = new SlashCommandBuilder()
.setName('play-song')
.setDescription('Play your favorite song on the channel and chill !')
.addStringOption(input=>input.setName('song').setDescription('The song you want to play').setRequired(true));

module.exports = {
    cooldown:20,
    data: data,
    async execute(interaction:ChatInputCommandInteraction) {
        if(!interaction.guild) return;
        const song = interaction.options.getString('song', true);
    
  
      // Get the voice channel of the user
  if(!interaction.channel?.isVoiceBased()){
    return await interaction.reply({ content: 'You need to be in a voice channel to use this command.' });
  }

        const member = interaction.guild.members.me;


        const voiceChannel = interaction.channel;

        if (!member) {
            return await interaction.reply({ content: 'You need to be in a voice channel to use this command.' });
        }
    
        if(member.voice.channel &&
            member.voice.channelId !== voiceChannel.id) {
            return await interaction.reply({ content: 'You need to be in the same voice channel as me to use this command.' });
        }
      
        
         // Check if the bot has permission to join the voice channel
      if (
        !member.permissions.has(
          PermissionsBitField.Flags.Connect,
        )
      ) {
        return await interaction.reply({
          content: 'I do not have permission to join your voice channel!',}
        );
      }
     
      // Check if the bot has permission to speak in the voice channel
      if (
        !member
          .permissionsIn(voiceChannel)
          .has(PermissionsBitField.Flags.Speak)
      ) {
        return await interaction.reply(
        { content: 'I do not have permission to speak in your voice channel!',}
        );
      }
try{
    const result = await player.play(voiceChannel, song, {
      nodeOptions: {
        metadata: { channel: interaction.channel }, // Store text channel as metadata on the queue
      },
    });

    console.log(result);
 
    if (!result) {
      return await interaction.reply({ content: 'There was an error playing the song.' });
    }

    // Reply to the user that the song has been added to the queue
    return interaction.reply(
      `${result.track.title} has been added to the queue!`,
    );


}
catch(error) {
console.error(`Error executing ${interaction}:`, error);
await interaction.reply({ content: 'There was an error while executing this command!' });
}
}
}