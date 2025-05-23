import {  ChannelType, ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
import { getTokenURL } from '../../config';
dotenv.config();

const data = new SlashCommandBuilder()
.setName('get-token-price')
.setDescription('Get the owner of the server')
.addStringOption(option =>
      option.setName('price-of')
        .setDescription('The token/coin we want to get the price of')
        .setRequired(true)
    ).addStringOption(option => option.setName('price-in-tickers')
    .setDescription('Write the sequence of tickers you want to get the price of e.g. ETH,USDC')
    .setRequired(true))
    .addChannelOption(option => option.setName('channel').addChannelTypes(ChannelType.GuildText)
    .setDescription('The channel to send the message').setRequired(true));

module.exports = {
    cooldown:20,
    data: data,
    async execute(interaction:ChatInputCommandInteraction
) {
try{

    

    const priceOf = interaction.options.getString('price-of');
    const priceInTickers= interaction.options.getString('price-in-tickers');


    const cryptoPriceTickers = await getTokenURL(priceOf as string, priceInTickers as string);

    if(!cryptoPriceTickers || cryptoPriceTickers.Response === 'Error'){ 
        return await interaction.reply({content:`${cryptoPriceTickers.Response}: ${cryptoPriceTickers.Message}`, flags:MessageFlags.Ephemeral});
}

await interaction.reply(`The price on ${priceOf} with tickers ${priceInTickers} are:\n ${Object.keys(cryptoPriceTickers).map((ticker: string) => `${priceOf} 💱 ${ticker} : ${cryptoPriceTickers[ticker]}`).join('\n')}`);
}
catch(error) {
    console.error(`Error executing ${interaction}:`, error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
}
}