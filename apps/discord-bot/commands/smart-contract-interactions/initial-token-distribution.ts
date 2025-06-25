import { ButtonStyle, ComponentType, MessageFlags, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder } from "discord.js";



module.exports = {
cooldown:25,
data: new SlashCommandBuilder().setName('initial-token-distribution').setDescription('This command allows you as the member of the discord server to receive your initial tokens !'),
async execute(interaction:any){


    const checkAbilityResponse = await fetch(`
    ${process.env.BACKEND_ENDPOINT}/gov_token/influence/${interaction.user.id}`);

    const checkAbilityResponseJson = await checkAbilityResponse.json();

    if(!checkAbilityResponseJson || checkAbilityResponseJson.error){ 
        return await interaction.reply({content:checkAbilityResponseJson.error, flags:MessageFlags.Ephemeral});
    }

    if(Number(checkAbilityResponseJson.tokenAmount) > 0){
        return await interaction.reply({content:`You already have ${Number(checkAbilityResponseJson.tokenAmount)} tokens, you can use them to vote on proposals, create proposals and more !`, flags:MessageFlags.Ephemeral});
    }

const customObject:{
    PSR:number,
    JEXS:number,
    W3I:number,
    TKL:number,
    KVTR:number
}={
    PSR:0,
    JEXS:0,
    W3I:0,
    TKL:0,
    KVTR:0
};

const select = new StringSelectMenuBuilder().setCustomId('PSR').setPlaceholder('Select your seniorty in programming (noncommercial + commercial)')
.addOptions(
new StringSelectMenuOptionBuilder().setLabel('<1 year').setValue('0').setEmoji('👶🏼'),
new StringSelectMenuOptionBuilder().setLabel('1-2 years ').setValue('1').setEmoji('👦🏼'),
new StringSelectMenuOptionBuilder().setLabel('3-5 years').setValue('2').setEmoji('🧔🏼'),
new StringSelectMenuOptionBuilder().setLabel('>=5 years').setValue('3').setEmoji('🥷🏼'),
);


const jexsSelect = new StringSelectMenuBuilder().setCustomId('JEXS').setPlaceholder('Select your COMMERCIAL seniorty in programming')
.addOptions(
new StringSelectMenuOptionBuilder().setLabel('<1 year').setValue('0').setEmoji('👻'),
new StringSelectMenuOptionBuilder().setLabel('1-2 years ').setValue('1').setEmoji('👦🏼'),
new StringSelectMenuOptionBuilder().setLabel('3-5 years').setValue('2').setEmoji('🧑🏼‍💻'),
new StringSelectMenuOptionBuilder().setLabel('>=5 years').setValue('3').setEmoji('🥷🏼'),
);

const web3InterestSelect = new StringSelectMenuBuilder().setCustomId('W3I').setPlaceholder('How long are you interested in Web3 (in all fields, not just development) ?')
.addOptions(
new StringSelectMenuOptionBuilder().setLabel('<1 year').setValue('0').setEmoji('🧪'),
new StringSelectMenuOptionBuilder().setLabel('1-2 years ').setValue('1').setEmoji('📖'),
new StringSelectMenuOptionBuilder().setLabel('3-5 years').setValue('2').setEmoji('📚'),
new StringSelectMenuOptionBuilder().setLabel('>=5 years').setValue('3').setEmoji('🤓'),
);

const programmingLanguagesKnown = new StringSelectMenuBuilder().setCustomId('TKL').setPlaceholder('If you are already programming blockchain smart contracts, how do you feel about it ?')
.addOptions(
new StringSelectMenuOptionBuilder().setLabel('Newbie (< 2 months)').setValue('0'),
new StringSelectMenuOptionBuilder().setLabel('Experienced (2-6 months)').setValue('1'),
new StringSelectMenuOptionBuilder().setLabel('Medium-advanced (6 months - 1 year)').setValue('2'),
new StringSelectMenuOptionBuilder().setLabel('Advanced (1-3 years)').setValue('3'),
new StringSelectMenuOptionBuilder().setLabel('Expert (4-10 years)').setValue('4'),
);



const programmingKnowledgeRow= new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(programmingLanguagesKnown);

const psrRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

const jexsRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(jexsSelect);

const web3InterestRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(web3InterestSelect);


const firstQuestionMenuOptions = new StringSelectMenuBuilder().setCustomId('firstQuestion').setPlaceholder('What is the key diff between memory and storage whenused in a function parameter ?').addOptions([
    new StringSelectMenuOptionBuilder().setLabel('Storage variables are gas-free').setValue('A-1'),
    new StringSelectMenuOptionBuilder().setLabel('Memory variables persist across transactions').setValue('B-1'),
    new StringSelectMenuOptionBuilder().setLabel('Storage points to data on-chain, memory is temporary in RAM').setValue('C-1'),
    new StringSelectMenuOptionBuilder().setLabel('Memory variables are written to the blockchain').setValue('D-1'),
    new StringSelectMenuOptionBuilder().setLabel('Both are same unless inside the constructor').setValue('E-1'),
]).setMinValues(1).setMaxValues(5);

const secondQuestionMenuOptions = new StringSelectMenuBuilder().setCustomId('secondQuestion').setPlaceholder('What does the delegatecall opcode allow a smart contract to do ?').addOptions([
    new StringSelectMenuOptionBuilder().setLabel('Call a function from another contract changing its state').setValue('A-2'),
    new StringSelectMenuOptionBuilder().setLabel(`Run another contract's code in the context of the caller's storage`).setValue('B-2'),
    new StringSelectMenuOptionBuilder().setLabel('Execute internal functions recursively').setValue('C-2'),
    new StringSelectMenuOptionBuilder().setLabel('Clone contract bytecode').setValue('D-2')
]);

const thirdQuestionMenuOptions = new StringSelectMenuBuilder().setCustomId('thirdQuestion').setPlaceholder('What is a re-entrancy vulnerability primarily caused by ?').addOptions([
    new StringSelectMenuOptionBuilder().setLabel('Lack of require statements').setValue('A-3'),
    new StringSelectMenuOptionBuilder().setLabel(`Calling delegatecall without checks`).setValue('B-3'),
    new StringSelectMenuOptionBuilder().setLabel('Transferring Ether before state update').setValue('C-3'),
    new StringSelectMenuOptionBuilder().setLabel('Using outdated Solidity versions').setValue('D-3'),
    new StringSelectMenuOptionBuilder().setLabel('Using loops with msg.sender').setValue('E-3')
]);

const firstQuestionRow= new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(firstQuestionMenuOptions);

const secondQuestionRow= new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(secondQuestionMenuOptions);

const thirdQuestionRow= new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(thirdQuestionMenuOptions);

const fourthQuestionRow= new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder({'customId':'A-4', 'label':'PoS is more energy efficient', style:ButtonStyle.Success}),
    new ButtonBuilder({'customId':'B-4', 'label':'Validators are randomly selected', style:ButtonStyle.Danger}),
    new ButtonBuilder({'customId':'C-4', 'label':'Stake slashing can occur for validator downtime', style:ButtonStyle.Primary}),
    new ButtonBuilder({'customId':'D-4', 'label':'PoS systems are immune to Sybil attacks', style:ButtonStyle.Secondary}),
    new ButtonBuilder({style:ButtonStyle.Primary, label:"PoS allows faster block finality", customId:'E-4' }),
);

const fifthQuestionRow= new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder({'customId':'A-5', 'label':'zkSync', style:ButtonStyle.Success}),
    new ButtonBuilder({'customId':'B-5', 'label':'StarkNet', style:ButtonStyle.Danger}),
    new ButtonBuilder({'customId':'C-5', 'label':'Polygon PoS', style:ButtonStyle.Primary}),
    new ButtonBuilder({'customId':'D-5', 'label':'Scroll', style:ButtonStyle.Secondary}),
        new ButtonBuilder({'customId':'E-5', 'label':'Linea', style:ButtonStyle.Secondary}),
);

// Which of the following programming languages is used to develop smart contracts on Solana?
// B-6
const sixthQuestionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder({'customId':'A-6', 'label':'Solidity', style:ButtonStyle.Secondary}),
    new ButtonBuilder({'customId':'B-6', 'label':'Rust', style:ButtonStyle.Success}),
    new ButtonBuilder({'customId':'C-6', 'label':'Python', style:ButtonStyle.Primary}),
    new ButtonBuilder({'customId':'D-6', 'label':'Java', style:ButtonStyle.Danger}),
    new ButtonBuilder({'customId':'E-6', 'label':'Zinc', style:ButtonStyle.Primary}),
);

//Which of the following chains uses a Cairo-based VM for smart contract execution?
// A-7
const seventhQuestionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder({'customId':'A-7', 'label':'Starknet', style:ButtonStyle.Success}),
    new ButtonBuilder({'customId':'B-7', 'label':'Arbitrum', style:ButtonStyle.Primary}),
    new ButtonBuilder({'customId':'C-7', 'label':'Optimism', style:ButtonStyle.Secondary}),
    new ButtonBuilder({'customId':'D-7', 'label':'ZkSync Era', style:ButtonStyle.Danger}),
    new ButtonBuilder({'customId':'E-7', 'label':'Polygon PoS', style:ButtonStyle.Primary}),
);

//Which Layer 2 scaling solution uses optimistic rollups to scale Ethereum?
// C-8
const eigthQuestionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder({'customId':'A-8', 'label':'ZkSync Era', style:ButtonStyle.Danger}),
    new ButtonBuilder({'customId':'B-8', 'label':'Starknet', style:ButtonStyle.Secondary}),
    new ButtonBuilder({'customId':'C-8', 'label':'Optimism', style:ButtonStyle.Success}),
    new ButtonBuilder({'customId':'D-8', 'label':'Polygon CDK', style:ButtonStyle.Primary}),
    new ButtonBuilder({'customId':'E-8', 'label':'Scroll', style:ButtonStyle.Primary}),
);

const claimToken= new ButtonBuilder({'customId':'finalStep', 'label':'Claim Your Tokens', style:ButtonStyle.Success});

const claimTokenRow= new ActionRowBuilder<ButtonBuilder>().addComponents(
   claimToken
);

const message = await interaction.reply({
            content:'What is your programming seniority level (noncommercial + commercial)?',
            components: [psrRow],
            withResponse: true,
            flags:MessageFlags.Ephemeral
        });

        const collector = message.resource?.message?.createMessageComponentCollector({
                 filter: (i:any) => i.user.id === interaction.user.id,
            componentType:ComponentType.StringSelect,
            time: 3600000
        });


        const buttonCollector = message.resource?.message?.createMessageComponentCollector({
            filter: (i:any) => i.user.id === interaction.user.id,
            componentType:ComponentType.Button,
            time: 3600000
        });



        
        try {
        
            collector?.on('collect', async (i:any) => {

                if (i.customId === 'PSR') {
                    customObject['PSR'] = Number(i.values[0]);
                    await i.update({content:`Great ! You have selected your programming seniority level, now how about job-experience ?`, components: [
                        jexsRow
                    ]});
                } 

                if (i.customId === 'JEXS') {
                    customObject['JEXS'] = Number(i.values[0]);
                    await i.update({content:`Great ! You have selected your job-experience level, Now tell us about your knowledge in programming languages to develop smart contracts ?`, components: [
                        programmingKnowledgeRow
                    ]});
                  
                }

                if(i.customId === 'TKL'){
                customObject['TKL'] = Number(i.values[0]);
                await i.update({content:`Great, Now tell us how long are you interested in Web3 (in all it's aspects) ?`, components: [
                   web3InterestRow 
                ]})
                }

                if(i.customId === 'W3I'
                ){
                    console.log('W3I',
                        i.values[0]);
                    customObject['W3I'] = Number(i.values[0]);
                    await i.update({content:`What is the main difference between a delegatecall and a call ? Now let's check your knowledge in Crypto from technical side ! In Solidity, what’s the key difference between memory and storage when used in a function parameter?`, components: [
                        firstQuestionRow
                    ]});
                }
            

                if(i.customId === 'firstQuestion'
                ){
                    if(i.values[0]=== 'C-1') customObject['KVTR']++;
             
                    await i.update({content:`${i.values[0] === 'C-1' ? '✅ Correct !' : '❌ Wrong'}, What does the delegatecall opcode allow a smart contract to do ?`, components: [
                        secondQuestionRow
                    ]});
                   
                }

                if(i.customId === 'secondQuestion'
                ){
                    if(i.values[0]=== 'B-2') customObject['KVTR']++;

                    console.log('secondQuestion',
                        i.values[0]);
                    await i.update({content:`
                        ${i.values[0] === 'B-2' ? '✅ Correct !' : '❌ Wrong'}. Now, what is a re-entrancy vulnerability primarily caused by ?
                        `, components: [
                        thirdQuestionRow
                    ]});
                }

                if(i.customId === 'thirdQuestion'
                ){
                  
                     if(i.values[0]=== 'C-3') customObject['KVTR']++;

                    await i.update({content:`${i.values[0] === 'C-3' ? '✅ Correct !' : '❌ Wrong'} Which of these statements about Proof of Stake is FALSE?`, 
                        components: [
                        fourthQuestionRow
                    ]});
                }

            });

            buttonCollector?.on('collect', async (i:any) => {
              try {
                    if (i.customId.includes('-4')) {
                   
                    if(i.customId === 'D-4') customObject['KVTR']++;
                    
                    await i.update({content:`${i.customId === 'D-4' ? `✅ Correctly answered question, one more to go ! Final Question ! Which of these technologies is fundamentally different from the others in how it scales Ethereum ?` : `❌ Wrong answer, one more to go ! Which of these technologies is fundamentally different from the others in how it scales Ethereum ?`}`, components: [
                        fifthQuestionRow
                    ]});
                }

                if(i.customId.includes('-5')){
                 
                      if(i.customId === 'C-5') customObject['KVTR']++;

                    await i.update({content:`${i.customId === 'C-5' ? `✅ Correctly answered question,` : `❌ Wrong answer,`} Which of the following programming languages is used to develop smart contracts on Solana?`, components: [sixthQuestionRow]});
                
                }

                if(i.customId.includes('-6')){
                    if(i.customId === 'B-6') customObject['KVTR']++;

                    await i.update({content:`${i.customId === 'B-6' ? '✅ Correct !' : '❌ Wrong'}, Which of the following chains uses a Cairo-based VM for smart contract execution ?`, components: [seventhQuestionRow]});
                }

                if(i.customId.includes('-7')){
                    if(i.customId === 'A-7') customObject['KVTR']++;
                
                    await i.update({content:`${i.customId === 'A-7' ? '✅ Correct !' : '❌ Wrong'}, Which Layer 2 scaling solution uses optimistic rollups to scale Ethereum?`, components: [eigthQuestionRow]});
                }

                if(i.customId.includes('-8')){
                    if(i.customId === 'C-8') customObject['KVTR']++;
                
                    await i.update({content:`Thats it now, check your Dm for more info !`, components: [claimTokenRow]});
                
                }

                if (i.customId === 'finalStep') {
                    console.log('finalStep', customObject);
                  const {PSR, JEXS, W3I, TKL, KVTR}=customObject;

                  const getKnowledgeState=()=>{
                    switch(KVTR){
                        case 8:
                          return 7;
                        case 7:
                          return 6;
                      case 6:
                        return 5;
                      case 5:
                        return 4;
                      case 4:
                        return 3;
                      case 3:
                        return 2;
                      case 2:
                        return 1;
                      case 1:
                        return 0;
                      default:
                        return 0;
                    }
                  }

                  
                  await i.deferUpdate();
       

                  const request = await Promise.race([await fetch(`
                  ${process.env.BACKEND_ENDPOINT}/gov_token/intial_token_distribution/${interaction.user.id}`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-backend-eligibility': process.env.DISCORD_BOT_INTERNAL_SECRET as string,

                    },
                    body: JSON.stringify({ 
                        PSR, 
                        JEXS,
                        W3I, 
                        TKL, 
                        KVTR: getKnowledgeState()
                    }),
                  })])

                  const response = await request.json();
                  console.log(response);
                  
            

                  if(!response || response.error){ 
                    return await i.followUp({content:`Something went wrong, please try again. ${response.error}`, components: []});
                  }
                  await i.editReply({content:`Great ! Congratulations, you have gone through the initial token distribution process ! Now check your DMs, Bot has sent you a message 💘`, components: []})

            await i.user.send({content:`Hello ${interaction.user.globalName} ! I'm a Builder Bot, I'm here to announce you are officially a part of DAO ! Congrats and wee see us on the proposal creation, voting etc. and more 😎`, components: []});
                }
              }catch(err){
                console.log(err);
                await i.followUp({content:`Something went wrong, please try again.`, components: []});
              }
            });

     

        
    } catch (error) {
        console.error(error);
        await interaction.editReply({ content: 'There was an error while executing this command !',  components: []});
    }


},

}