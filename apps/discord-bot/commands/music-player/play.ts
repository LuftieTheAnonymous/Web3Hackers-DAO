import { useMainPlayer } from 'discord-player';
import {   ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const data = new SlashCommandBuilder()
.setName('play-song')
.setDescription('Play your favorite song on the channel and chill with your hacker-gang on discord, do not be a caveman 😅')
.addStringOption(input=>input.setName('song').setDescription('The song you want to play').setRequired(true));

module.exports = {
    cooldown:20,
    data: data,
    async execute(interaction:any) {
        if(!interaction.guild) return;
        const song = interaction.options.getString('song', true);
    
        const player = useMainPlayer();
    
        const voiceChannel = interaction.member.voice.channel;
    
        if (!voiceChannel) {
            return await interaction.reply({ content: 'You need to be in a voice channel to use this command.', ephemeral: true });
        }
    
        if(interaction.guild.members.me.voice.channel &&
            interaction.guild.members.me.voice.channelId !== voiceChannel.id) {
            return await interaction.reply({ content: 'You need to be in the same voice channel as me to use this command.', ephemeral: true });
        }
      
        
         // Check if the bot has permission to join the voice channel
      if (
        !interaction.guild.members.me.permissions.has(
          PermissionsBitField.Flags.Connect,
        )
      ) {
        return interaction.reply(
          'I do not have permission to join your voice channel!',
        );
      }
     
      // Check if the bot has permission to speak in the voice channel
      if (
        !interaction.guild.members.me
          .permissionsIn(voiceChannel)
          .has(PermissionsBitField.Flags.Speak)
      ) {
        return interaction.reply(
          'I do not have permission to speak in your voice channel!',
        );
      }
try{
    const result = await player.play(voiceChannel, song, {
      nodeOptions: {
        metadata: { channel: interaction.channel }, // Store text channel as metadata on the queue
      },
    });
 
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