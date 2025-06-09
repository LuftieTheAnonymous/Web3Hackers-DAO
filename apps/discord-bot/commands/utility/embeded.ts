import { formatDate } from 'date-fns';
import {  ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { EmbedBuilder } from "discord.js";


module.exports = {
    cooldown:15,
    data: new SlashCommandBuilder().setName('get-proposal-info')
        .setDescription('Enables user to see the info of a proposal, to vote on it').addStringOption(option => option.setName('proposal-id').setDescription('Pass the proposal id, you want to vote for.').setRequired(true)),
    async execute(interaction:ChatInputCommandInteraction
    ) {
       try{
         if(!interaction.guild) {
            return;
        };
        const proposalId = interaction.options.getString('proposal-id');

        await interaction.deferReply();

    const proposalEmbedDetailsFetch= await fetch(`http://localhost:2137/governance/get_embeded_proposal_details/${proposalId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-backend-eligibility': process.env.DISCORD_BOT_INTERNAL_SECRET as string,
        },
    });

    const proposalEmbedDetails = await proposalEmbedDetailsFetch.json();

    console.log(proposalEmbedDetails);

    if(!proposalEmbedDetails || proposalEmbedDetails.error){
        await interaction.editReply({content:proposalEmbedDetails.error.message });
        return;
    }
    

    const proposalOptions= proposalEmbedDetails.db_data.dao_vote_options.map((option:any) => ({ name: option.voting_option_text, value: option.isExecuting ? 'Executes the callbacks' : 'Does not execute the callbacks', inline: true }));


const exampleEmbed= new EmbedBuilder()
    .setColor(0x05F29B)
    .setTitle(`${proposalEmbedDetails.db_data.proposal_title}`)
    .setURL(proposalEmbedDetails.db_data.dao_members.photoURL)
    .setDescription(`${proposalEmbedDetails.sm_data.description}`).setAuthor({'name':`${proposalEmbedDetails.db_data.dao_members.nickname}`,'iconURL':`${proposalEmbedDetails.db_data.dao_members.photoURL}`})
    .setThumbnail('../../images/Web3-Builders.jpg')
    .addFields(
        ...proposalOptions
    )
    .setTimestamp()
    .setFooter({ text: `Finishes at ${formatDate(proposalEmbedDetails.db_data.expires_at,'dd/MM/yyyy')}`});


        await interaction.editReply({'content':`Here you are 😁`, 'embeds':[exampleEmbed]});
       }catch(err){
           console.log(err);
           await interaction.editReply({content:'There was an error while executing this command!'});
       }
    }
}