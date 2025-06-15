import { ChatInputCommandInteraction, MessageFlags,  SlashCommandBuilder } from 'discord.js';
module.exports = {
data: new SlashCommandBuilder().setName('cancel-proposal').setDescription('This command allows you as the member of the discord server to cancel a proposal !').addStringOption(input=>input.setName('proposal-id').setDescription('Pass the proposal id, you want to cancel').setRequired(true)),
async execute(interaction:ChatInputCommandInteraction){

try{
    const proposalId = interaction.options.getString('proposal-id');

await interaction.deferReply();

const proposalRequest = await fetch(`http://localhost:2137/governance/cancel_proposal/${proposalId}`, {
    method: 'POST',
    headers: {
        'x-backend-eligibility': process.env.DISCORD_BOT_INTERNAL_SECRET as string,
    },
});

const proposalResponse = await proposalRequest.json();

if(!proposalResponse || proposalResponse.error){
    await interaction.followUp({content:proposalResponse.error, flags:MessageFlags.Ephemeral });
    return;
}

await interaction.followUp({content:proposalResponse.message, flags:MessageFlags.Ephemeral });
}catch(err){
    console.error(`Error executing ${interaction}:`, err);
    await interaction.followUp({ content: 'There was an error while executing this command!' });
}


},

}