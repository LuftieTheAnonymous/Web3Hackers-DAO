import { formatDate } from 'date-fns';
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
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
         

         const proposalStates = ["Pending 🚄", "Active ✅", "Canceled ❌", "Defeated 🥊", "Succeeded 🏆", "Queued 🛤️", "Executed 💣"];

        

        const proposalId = interaction.options.getString('proposal-id');

        if(!proposalId){
            return await interaction.reply({content:`Invalid proposal id. (${proposalId})`, flags:MessageFlags.Ephemeral });
        }

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

    if(!proposalEmbedDetails.data){
        return await interaction.editReply({content:proposalEmbedDetails.error.message });
    }
    

    const proposalOptions= proposalEmbedDetails.data.db_data && proposalEmbedDetails.data.db_data.dao_vote_options && proposalEmbedDetails.data.db_data.dao_vote_options.length > 0  ? proposalEmbedDetails.data.db_data.dao_vote_options.map((option:any) => ({name:option.voting_option_text,value:option.isExecuting ? 'Executes the callbacks' : 'Does not execute the callbacks',inline:true})) : [{name:'For', value:'You vote for approval of the proposal', inline:true}, {name:'Against', value:'You vote against approval of the proposal', inline:true}, {name:'Abstain', value:'You vote against approval of the proposal', inline:true}];

    const callbackData= proposalEmbedDetails.data.db_data && proposalEmbedDetails.data.db_data.calldata_objects && proposalEmbedDetails.data.db_data.calldata_objects.length > 0 ? proposalEmbedDetails.data.db_data.calldata_objects.map((callback:any)=>({name:callback.functionDisplayName, value:`${callback.amountParameter} Tokens`, inline:false})) : [{name:'No Functions !', 'value':'This proposal is only a general proposal, whose execution doesnt execute any functions !'}];

const exampleEmbed= new EmbedBuilder()
   .setColor(0x05F29B)
    .setTitle(`${proposalEmbedDetails.data.db_data.proposal_title}`)
    .setDescription(`${proposalEmbedDetails.data.sm_data.description}`).setAuthor({'name':`Web3 Builders DAO`,'iconURL':interaction.guild.iconURL() as string});

    exampleEmbed.addFields([{'name':'Proposal State', value:proposalStates[Number(proposalEmbedDetails.data.sm_data.state)]}]);

        exampleEmbed.addFields([{'inline':false, 'name':'Execution Details', 'value':'Here you will find the details of what will be executed if you vote for approving it.'}, ...callbackData ]);
    
        
        exampleEmbed.addFields([{'inline':false, 'name':'Voting Options', 'value':'Here you see the options you can vote for and what they will do \n\n'}, ...proposalOptions]);
    
    
    exampleEmbed.setFooter({'iconURL':`${proposalEmbedDetails.data.db_data.dao_members.photoURL}`, text:`Proposer : ${proposalEmbedDetails.data.db_data.dao_members.nickname} | Proposal ID: ${proposalEmbedDetails.data.db_data.proposal_id}`});
    
    exampleEmbed.addFields([{name:'Start Date', value:`${formatDate(proposalEmbedDetails.data.sm_data.startBlockTimestamp * 1000, 'dd-MM-yyyy, HH:mm')}`, inline:true}]);
    exampleEmbed.addFields([{name:'Deadline Date', value:`${formatDate(proposalEmbedDetails.data.sm_data.endBlockTimestamp * 1000, 'dd-MM-yyyy, HH:mm')}`, inline:true}]);


        await interaction.editReply({content:`Here you are 😁`, embeds:[exampleEmbed]});
       }catch(err){
           console.log(err);
           await interaction.editReply({content:'There was an error while executing this command!'});
       }
    }
}