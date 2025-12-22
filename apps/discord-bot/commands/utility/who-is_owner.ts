import {  ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';



const data = new SlashCommandBuilder()
.setName('who-is_owner')
.setDescription('Get the owner of the server');


module.exports = {
    data: data,
    async execute(interaction:ChatInputCommandInteraction
) {
try{
    console.log("Guild interaction", interaction, "Guild interaction");
    if(!interaction.guild) {
 return       await interaction.reply("This command can only be used in a server.");
    };

    const owner = await interaction.guild.fetchOwner();
    
    console.log(owner);

    if(!owner) {
        return await interaction.reply("The owner of this server could not be found.");
    }
  
    await interaction.reply(`The owner of this server is: ${owner.user.globalName} (${owner.id})`);
}
catch(error) {
    console.error(`Error executing ${interaction}:`, error);

    await interaction.reply(`Error occured: ${error}`);

    }
}
}