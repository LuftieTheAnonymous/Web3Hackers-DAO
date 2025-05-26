import {  ChannelType, ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
import { getTokenURL } from '../../config';
dotenv.config();

const data = new SlashCommandBuilder()
.setName('notify-every-user')
.setDescription('Notify every user of the DAO Member').addStringOption(option => option.setName('message').setDescription('The message you want to send').setRequired(true).setMaxLength(200));

module.exports = {
    cooldown:20,
    data: data,
    async execute(interaction:ChatInputCommandInteraction
) {
try{
    
    const message = interaction.options.getString('message');

    await interaction.deferReply();

    const fetchNotifications= await fetch('http://localhost:2137/notifications/notify-dao-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
    });

    const notifications = await fetchNotifications.json();

    console.log(notifications);

    if(notifications.status !== 200){
        return await interaction.followUp({content:'Something went wrong'});
    }

    await interaction.followUp({content:'Notifications sent !'});

}
catch(error) {
    console.error(`Error executing ${interaction}:`, error);
    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    }
}
}