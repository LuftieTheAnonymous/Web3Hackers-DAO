import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { QueueRepeatMode, useQueue } from 'discord-player';
 
export const data = new SlashCommandBuilder()
  .setName('loop') // Command name
  .setDescription('Put your favourite shit on the loop !') // Command description
  .addNumberOption((option) =>
    option
      .setName('mode') // Option name
      .setDescription('The loop mode') // Option description
      .setRequired(true) // Option is required
      .addChoices(
        {
          name: 'Off',
          value: QueueRepeatMode.OFF,
        },
        {
          name: 'Track',
          value: QueueRepeatMode.TRACK,
        },
        {
          name: 'Queue',
          value: QueueRepeatMode.QUEUE,
        },
        {
          name: 'Autoplay',
          value: QueueRepeatMode.AUTOPLAY,
        },
      ),
  );
 
  module.exports = {
      cooldown:20,
      data: data,
      async execute(interaction:ChatInputCommandInteraction) {
        if(!interaction.guild) return;
  // Get the loop mode
  const loopMode = interaction.options.getNumber('mode');

  if(!loopMode){
    return await interaction.reply({content:"Invalid loop mode.", flags:MessageFlags.Ephemeral });
  }
 
  // Get the current queue
  const queue = useQueue(interaction.guild);
 
try{
      if (!queue) {
    return interaction.reply(
      'This server does not have an active player session.',
    );
  }
 
  // Set the loop mode
  queue.setRepeatMode(loopMode as QueueRepeatMode);
 
  // Send a confirmation message
  const modeNames = {
    [QueueRepeatMode.OFF]: 'Off',
    [QueueRepeatMode.TRACK]: 'Track',
    [QueueRepeatMode.QUEUE]: 'Queue',
    [QueueRepeatMode.AUTOPLAY]: 'Autoplay'
  };
  return interaction.reply(`Loop mode set to ${modeNames[loopMode as QueueRepeatMode]}.`);
}catch(err){
console.log(err);

await interaction.reply({ content: 'There was an error while executing this command!' });
}
}  }


