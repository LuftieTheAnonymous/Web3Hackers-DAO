import {  APIApplicationCommandOptionChoice, ChannelType, ChatInputCommandInteraction, MessageFlags, RestOrArray, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const data = new SlashCommandBuilder()
.setName('user-vote-power')
.setDescription('Get the voting power of a user').addUserOption(option => option.setName('member').setDescription('The member of the server you want to get the voting power of').setRequired(true));

module.exports = {
    cooldown:20,
    data: data,
    async execute(interaction:ChatInputCommandInteraction
) {
try{

    const member = interaction.options.getUser('member');

    if(!member){
        await interaction.reply({content:`No user found with the nickname given.`, flags:MessageFlags.Ephemeral });
        return;
    }
    
    const request = await fetch(`http://localhost:2137/gov_token/influence/${member.id}`);

   const response = await request.json();
   
   console.log(response);

   if(!response || response.error){
 await interaction.reply({content:response.error, flags:MessageFlags.Ephemeral });
return;
}
await interaction.reply({content:response.message, flags:MessageFlags.Ephemeral });
}
catch(error) {
    console.error(`Error executing ${interaction}:`, error);
    await interaction.reply({ content: 'There was an error while executing this command!'});
    }
}
}