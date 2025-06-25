"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const discord_js_2 = require("discord.js");
module.exports = {
    cooldown: 25,
    data: new discord_js_1.SlashCommandBuilder().setName('initial-token-distribution').setDescription('This command allows you as the member of the discord server to receive your initial tokens !'),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const checkAbilityResponse = yield fetch(`
    ${process.env.BACKEND_ENDPOINT}/gov_token/influence/${interaction.user.id}`);
            const checkAbilityResponseJson = yield checkAbilityResponse.json();
            if (!checkAbilityResponseJson || checkAbilityResponseJson.error) {
                return yield interaction.reply({ content: checkAbilityResponseJson.error, flags: discord_js_1.MessageFlags.Ephemeral });
            }
            if (Number(checkAbilityResponseJson.tokenAmount) > 0) {
                return yield interaction.reply({ content: `You already have ${Number(checkAbilityResponseJson.tokenAmount)} tokens, you can use them to vote on proposals, create proposals and more !`, flags: discord_js_1.MessageFlags.Ephemeral });
            }
            const customObject = {
                PSR: 0,
                JEXS: 0,
                W3I: 0,
                TKL: 0,
                KVTR: 0
            };
            const select = new discord_js_1.StringSelectMenuBuilder().setCustomId('PSR').setPlaceholder('Select your seniorty in programming (noncommercial + commercial)')
                .addOptions(new discord_js_1.StringSelectMenuOptionBuilder().setLabel('<1 year').setValue('0').setEmoji('👶🏼'), new discord_js_1.StringSelectMenuOptionBuilder().setLabel('1-2 years ').setValue('1').setEmoji('👦🏼'), new discord_js_1.StringSelectMenuOptionBuilder().setLabel('3-5 years').setValue('2').setEmoji('🧔🏼'), new discord_js_1.StringSelectMenuOptionBuilder().setLabel('>=5 years').setValue('3').setEmoji('🥷🏼'));
            const jexsSelect = new discord_js_1.StringSelectMenuBuilder().setCustomId('JEXS').setPlaceholder('Select your COMMERCIAL seniorty in programming')
                .addOptions(new discord_js_1.StringSelectMenuOptionBuilder().setLabel('<1 year').setValue('0').setEmoji('👻'), new discord_js_1.StringSelectMenuOptionBuilder().setLabel('1-2 years ').setValue('1').setEmoji('👦🏼'), new discord_js_1.StringSelectMenuOptionBuilder().setLabel('3-5 years').setValue('2').setEmoji('🧑🏼‍💻'), new discord_js_1.StringSelectMenuOptionBuilder().setLabel('>=5 years').setValue('3').setEmoji('🥷🏼'));
            const web3InterestSelect = new discord_js_1.StringSelectMenuBuilder().setCustomId('W3I').setPlaceholder('How long are you interested in Web3 (in all fields, not just development) ?')
                .addOptions(new discord_js_1.StringSelectMenuOptionBuilder().setLabel('<1 year').setValue('0').setEmoji('🧪'), new discord_js_1.StringSelectMenuOptionBuilder().setLabel('1-2 years ').setValue('1').setEmoji('📖'), new discord_js_1.StringSelectMenuOptionBuilder().setLabel('3-5 years').setValue('2').setEmoji('📚'), new discord_js_1.StringSelectMenuOptionBuilder().setLabel('>=5 years').setValue('3').setEmoji('🤓'));
            const programmingLanguagesKnown = new discord_js_1.StringSelectMenuBuilder().setCustomId('TKL').setPlaceholder('If you are already programming blockchain smart contracts, how do you feel about it ?')
                .addOptions(new discord_js_1.StringSelectMenuOptionBuilder().setLabel('Newbie (< 2 months)').setValue('0'), new discord_js_1.StringSelectMenuOptionBuilder().setLabel('Experienced (2-6 months)').setValue('1'), new discord_js_1.StringSelectMenuOptionBuilder().setLabel('Medium-advanced (6 months - 1 year)').setValue('2'), new discord_js_1.StringSelectMenuOptionBuilder().setLabel('Advanced (1-3 years)').setValue('3'), new discord_js_1.StringSelectMenuOptionBuilder().setLabel('Expert (4-10 years)').setValue('4'));
            const programmingKnowledgeRow = new discord_js_2.ActionRowBuilder().addComponents(programmingLanguagesKnown);
            const psrRow = new discord_js_2.ActionRowBuilder().addComponents(select);
            const jexsRow = new discord_js_2.ActionRowBuilder().addComponents(jexsSelect);
            const web3InterestRow = new discord_js_2.ActionRowBuilder().addComponents(web3InterestSelect);
            const firstQuestionMenuOptions = new discord_js_1.StringSelectMenuBuilder().setCustomId('firstQuestion').setPlaceholder('What is the key diff between memory and storage whenused in a function parameter ?').addOptions([
                new discord_js_1.StringSelectMenuOptionBuilder().setLabel('Storage variables are gas-free').setValue('A-1'),
                new discord_js_1.StringSelectMenuOptionBuilder().setLabel('Memory variables persist across transactions').setValue('B-1'),
                new discord_js_1.StringSelectMenuOptionBuilder().setLabel('Storage points to data on-chain, memory is temporary in RAM').setValue('C-1'),
                new discord_js_1.StringSelectMenuOptionBuilder().setLabel('Memory variables are written to the blockchain').setValue('D-1'),
                new discord_js_1.StringSelectMenuOptionBuilder().setLabel('Both are same unless inside the constructor').setValue('E-1'),
            ]).setMinValues(1).setMaxValues(5);
            const secondQuestionMenuOptions = new discord_js_1.StringSelectMenuBuilder().setCustomId('secondQuestion').setPlaceholder('What does the delegatecall opcode allow a smart contract to do ?').addOptions([
                new discord_js_1.StringSelectMenuOptionBuilder().setLabel('Call a function from another contract changing its state').setValue('A-2'),
                new discord_js_1.StringSelectMenuOptionBuilder().setLabel(`Run another contract's code in the context of the caller's storage`).setValue('B-2'),
                new discord_js_1.StringSelectMenuOptionBuilder().setLabel('Execute internal functions recursively').setValue('C-2'),
                new discord_js_1.StringSelectMenuOptionBuilder().setLabel('Clone contract bytecode').setValue('D-2')
            ]);
            const thirdQuestionMenuOptions = new discord_js_1.StringSelectMenuBuilder().setCustomId('thirdQuestion').setPlaceholder('What is a re-entrancy vulnerability primarily caused by ?').addOptions([
                new discord_js_1.StringSelectMenuOptionBuilder().setLabel('Lack of require statements').setValue('A-3'),
                new discord_js_1.StringSelectMenuOptionBuilder().setLabel(`Calling delegatecall without checks`).setValue('B-3'),
                new discord_js_1.StringSelectMenuOptionBuilder().setLabel('Transferring Ether before state update').setValue('C-3'),
                new discord_js_1.StringSelectMenuOptionBuilder().setLabel('Using outdated Solidity versions').setValue('D-3'),
                new discord_js_1.StringSelectMenuOptionBuilder().setLabel('Using loops with msg.sender').setValue('E-3')
            ]);
            const firstQuestionRow = new discord_js_2.ActionRowBuilder().addComponents(firstQuestionMenuOptions);
            const secondQuestionRow = new discord_js_2.ActionRowBuilder().addComponents(secondQuestionMenuOptions);
            const thirdQuestionRow = new discord_js_2.ActionRowBuilder().addComponents(thirdQuestionMenuOptions);
            const fourthQuestionRow = new discord_js_2.ActionRowBuilder().addComponents(new discord_js_2.ButtonBuilder({ 'customId': 'A-4', 'label': 'PoS is more energy efficient', style: discord_js_1.ButtonStyle.Success }), new discord_js_2.ButtonBuilder({ 'customId': 'B-4', 'label': 'Validators are randomly selected', style: discord_js_1.ButtonStyle.Danger }), new discord_js_2.ButtonBuilder({ 'customId': 'C-4', 'label': 'Stake slashing can occur for validator downtime', style: discord_js_1.ButtonStyle.Primary }), new discord_js_2.ButtonBuilder({ 'customId': 'D-4', 'label': 'PoS systems are immune to Sybil attacks', style: discord_js_1.ButtonStyle.Secondary }), new discord_js_2.ButtonBuilder({ style: discord_js_1.ButtonStyle.Primary, label: "PoS allows faster block finality", customId: 'E-4' }));
            const fifthQuestionRow = new discord_js_2.ActionRowBuilder().addComponents(new discord_js_2.ButtonBuilder({ 'customId': 'A-5', 'label': 'zkSync', style: discord_js_1.ButtonStyle.Success }), new discord_js_2.ButtonBuilder({ 'customId': 'B-5', 'label': 'StarkNet', style: discord_js_1.ButtonStyle.Danger }), new discord_js_2.ButtonBuilder({ 'customId': 'C-5', 'label': 'Polygon PoS', style: discord_js_1.ButtonStyle.Primary }), new discord_js_2.ButtonBuilder({ 'customId': 'D-5', 'label': 'Scroll', style: discord_js_1.ButtonStyle.Secondary }), new discord_js_2.ButtonBuilder({ 'customId': 'E-5', 'label': 'Linea', style: discord_js_1.ButtonStyle.Secondary }));
            // Which of the following programming languages is used to develop smart contracts on Solana?
            // B-6
            const sixthQuestionRow = new discord_js_2.ActionRowBuilder().addComponents(new discord_js_2.ButtonBuilder({ 'customId': 'A-6', 'label': 'Solidity', style: discord_js_1.ButtonStyle.Secondary }), new discord_js_2.ButtonBuilder({ 'customId': 'B-6', 'label': 'Rust', style: discord_js_1.ButtonStyle.Success }), new discord_js_2.ButtonBuilder({ 'customId': 'C-6', 'label': 'Python', style: discord_js_1.ButtonStyle.Primary }), new discord_js_2.ButtonBuilder({ 'customId': 'D-6', 'label': 'Java', style: discord_js_1.ButtonStyle.Danger }), new discord_js_2.ButtonBuilder({ 'customId': 'E-6', 'label': 'Zinc', style: discord_js_1.ButtonStyle.Primary }));
            //Which of the following chains uses a Cairo-based VM for smart contract execution?
            // A-7
            const seventhQuestionRow = new discord_js_2.ActionRowBuilder().addComponents(new discord_js_2.ButtonBuilder({ 'customId': 'A-7', 'label': 'Starknet', style: discord_js_1.ButtonStyle.Success }), new discord_js_2.ButtonBuilder({ 'customId': 'B-7', 'label': 'Arbitrum', style: discord_js_1.ButtonStyle.Primary }), new discord_js_2.ButtonBuilder({ 'customId': 'C-7', 'label': 'Optimism', style: discord_js_1.ButtonStyle.Secondary }), new discord_js_2.ButtonBuilder({ 'customId': 'D-7', 'label': 'ZkSync Era', style: discord_js_1.ButtonStyle.Danger }), new discord_js_2.ButtonBuilder({ 'customId': 'E-7', 'label': 'Polygon PoS', style: discord_js_1.ButtonStyle.Primary }));
            //Which Layer 2 scaling solution uses optimistic rollups to scale Ethereum?
            // C-8
            const eigthQuestionRow = new discord_js_2.ActionRowBuilder().addComponents(new discord_js_2.ButtonBuilder({ 'customId': 'A-8', 'label': 'ZkSync Era', style: discord_js_1.ButtonStyle.Danger }), new discord_js_2.ButtonBuilder({ 'customId': 'B-8', 'label': 'Starknet', style: discord_js_1.ButtonStyle.Secondary }), new discord_js_2.ButtonBuilder({ 'customId': 'C-8', 'label': 'Optimism', style: discord_js_1.ButtonStyle.Success }), new discord_js_2.ButtonBuilder({ 'customId': 'D-8', 'label': 'Polygon CDK', style: discord_js_1.ButtonStyle.Primary }), new discord_js_2.ButtonBuilder({ 'customId': 'E-8', 'label': 'Scroll', style: discord_js_1.ButtonStyle.Primary }));
            const claimToken = new discord_js_2.ButtonBuilder({ 'customId': 'finalStep', 'label': 'Claim Your Tokens', style: discord_js_1.ButtonStyle.Success });
            const claimTokenRow = new discord_js_2.ActionRowBuilder().addComponents(claimToken);
            const message = yield interaction.reply({
                content: 'What is your programming seniority level (noncommercial + commercial)?',
                components: [psrRow],
                withResponse: true,
                flags: discord_js_1.MessageFlags.Ephemeral
            });
            const collector = (_b = (_a = message.resource) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id,
                componentType: discord_js_1.ComponentType.StringSelect,
                time: 3600000
            });
            const buttonCollector = (_d = (_c = message.resource) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id,
                componentType: discord_js_1.ComponentType.Button,
                time: 3600000
            });
            try {
                collector === null || collector === void 0 ? void 0 : collector.on('collect', (i) => __awaiter(this, void 0, void 0, function* () {
                    if (i.customId === 'PSR') {
                        customObject['PSR'] = Number(i.values[0]);
                        yield i.update({ content: `Great ! You have selected your programming seniority level, now how about job-experience ?`, components: [
                                jexsRow
                            ] });
                    }
                    if (i.customId === 'JEXS') {
                        customObject['JEXS'] = Number(i.values[0]);
                        yield i.update({ content: `Great ! You have selected your job-experience level, Now tell us about your knowledge in programming languages to develop smart contracts ?`, components: [
                                programmingKnowledgeRow
                            ] });
                    }
                    if (i.customId === 'TKL') {
                        customObject['TKL'] = Number(i.values[0]);
                        yield i.update({ content: `Great, Now tell us how long are you interested in Web3 (in all it's aspects) ?`, components: [
                                web3InterestRow
                            ] });
                    }
                    if (i.customId === 'W3I') {
                        console.log('W3I', i.values[0]);
                        customObject['W3I'] = Number(i.values[0]);
                        yield i.update({ content: `What is the main difference between a delegatecall and a call ? Now let's check your knowledge in Crypto from technical side ! In Solidity, what’s the key difference between memory and storage when used in a function parameter?`, components: [
                                firstQuestionRow
                            ] });
                    }
                    if (i.customId === 'firstQuestion') {
                        if (i.values[0] === 'C-1')
                            customObject['KVTR']++;
                        yield i.update({ content: `${i.values[0] === 'C-1' ? '✅ Correct !' : '❌ Wrong'}, What does the delegatecall opcode allow a smart contract to do ?`, components: [
                                secondQuestionRow
                            ] });
                    }
                    if (i.customId === 'secondQuestion') {
                        if (i.values[0] === 'B-2')
                            customObject['KVTR']++;
                        console.log('secondQuestion', i.values[0]);
                        yield i.update({ content: `
                        ${i.values[0] === 'B-2' ? '✅ Correct !' : '❌ Wrong'}. Now, what is a re-entrancy vulnerability primarily caused by ?
                        `, components: [
                                thirdQuestionRow
                            ] });
                    }
                    if (i.customId === 'thirdQuestion') {
                        if (i.values[0] === 'C-3')
                            customObject['KVTR']++;
                        yield i.update({ content: `${i.values[0] === 'C-3' ? '✅ Correct !' : '❌ Wrong'} Which of these statements about Proof of Stake is FALSE?`,
                            components: [
                                fourthQuestionRow
                            ] });
                    }
                }));
                buttonCollector === null || buttonCollector === void 0 ? void 0 : buttonCollector.on('collect', (i) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        if (i.customId.includes('-4')) {
                            if (i.customId === 'D-4')
                                customObject['KVTR']++;
                            yield i.update({ content: `${i.customId === 'D-4' ? `✅ Correctly answered question, one more to go ! Final Question ! Which of these technologies is fundamentally different from the others in how it scales Ethereum ?` : `❌ Wrong answer, one more to go ! Which of these technologies is fundamentally different from the others in how it scales Ethereum ?`}`, components: [
                                    fifthQuestionRow
                                ] });
                        }
                        if (i.customId.includes('-5')) {
                            if (i.customId === 'C-5')
                                customObject['KVTR']++;
                            yield i.update({ content: `${i.customId === 'C-5' ? `✅ Correctly answered question,` : `❌ Wrong answer,`} Which of the following programming languages is used to develop smart contracts on Solana?`, components: [sixthQuestionRow] });
                        }
                        if (i.customId.includes('-6')) {
                            if (i.customId === 'B-6')
                                customObject['KVTR']++;
                            yield i.update({ content: `${i.customId === 'B-6' ? '✅ Correct !' : '❌ Wrong'}, Which of the following chains uses a Cairo-based VM for smart contract execution ?`, components: [seventhQuestionRow] });
                        }
                        if (i.customId.includes('-7')) {
                            if (i.customId === 'A-7')
                                customObject['KVTR']++;
                            yield i.update({ content: `${i.customId === 'A-7' ? '✅ Correct !' : '❌ Wrong'}, Which Layer 2 scaling solution uses optimistic rollups to scale Ethereum?`, components: [eigthQuestionRow] });
                        }
                        if (i.customId.includes('-8')) {
                            if (i.customId === 'C-8')
                                customObject['KVTR']++;
                            yield i.update({ content: `Thats it now, check your Dm for more info !`, components: [claimTokenRow] });
                        }
                        if (i.customId === 'finalStep') {
                            console.log('finalStep', customObject);
                            const { PSR, JEXS, W3I, TKL, KVTR } = customObject;
                            const getKnowledgeState = () => {
                                switch (KVTR) {
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
                            };
                            yield i.deferUpdate();
                            const request = yield Promise.race([yield fetch(`
                  ${process.env.BACKEND_ENDPOINT}/gov_token/intial_token_distribution/${interaction.user.id}`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'x-backend-eligibility': process.env.DISCORD_BOT_INTERNAL_SECRET,
                                    },
                                    body: JSON.stringify({
                                        PSR,
                                        JEXS,
                                        W3I,
                                        TKL,
                                        KVTR: getKnowledgeState()
                                    }),
                                })]);
                            const response = yield request.json();
                            console.log(response);
                            if (!response || response.error) {
                                return yield i.followUp({ content: `Something went wrong, please try again. ${response.error}`, components: [] });
                            }
                            yield i.editReply({ content: `Great ! Congratulations, you have gone through the initial token distribution process ! Now check your DMs, Bot has sent you a message 💘`, components: [] });
                            yield i.user.send({ content: `Hello ${interaction.user.globalName} ! I'm a Builder Bot, I'm here to announce you are officially a part of DAO ! Congrats and wee see us on the proposal creation, voting etc. and more 😎`, components: [] });
                        }
                    }
                    catch (err) {
                        console.log(err);
                        yield i.followUp({ content: `Something went wrong, please try again.`, components: [] });
                    }
                }));
            }
            catch (error) {
                console.error(error);
                yield interaction.editReply({ content: 'There was an error while executing this command !', components: [] });
            }
        });
    },
};
