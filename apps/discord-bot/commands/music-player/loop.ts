import { SlashCommandBuilder } from 'discord.js';
import { QueueRepeatMode, useQueue } from 'discord-player';
 
export const data = new SlashCommandBuilder()
  .setName('loop') // Command name
  .setDescription('Loop the queue in different modes') // Command description
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
      async execute(interaction:any) {
  // Get the loop mode
  const loopMode = interaction.options.getNumber('mode');
 
  // Get the current queue
  const queue = useQueue(interaction.guild);
 
try{
      if (!queue) {
    return interaction.reply(
      'This server does not have an active player session.',
    );
  }
 
  // Set the loop mode
  queue.setRepeatMode(loopMode);
 
  // Send a confirmation message
  return interaction.reply(`Loop mode set to ${QueueRepeatMode[loopMode as (keyof typeof QueueRepeatMode)]}.`);
}catch(err){
console.log(err);

await interaction.reply({ content: 'There was an error while executing this command!' });
}
}
  }


