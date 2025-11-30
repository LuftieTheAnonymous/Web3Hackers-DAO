import {  GatewayIntentBits, Collection, Partials } from 'discord.js';
import { CustomClient, CustomClientType } from './types/discordBotTypes.ts';
// Require the necessary discord.js classes
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
const { token } = require('./discordConfig.json');

dotenv.config();


export const client:CustomClientType = new CustomClient({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildExpressions,
    GatewayIntentBits.GuildModeration,
],
partials:[
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
    Partials.User,
    Partials.ThreadMember,
    Partials.GuildScheduledEvent
],


});
client.commands = new Collection();
client.cooldowns= new Collection();


client.on('error', (error:Error)=>{
    console.log(error.message);
});


const folderPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(folderPath);

for (const folder of commandFolders) {
    const commandPath = path.join(folderPath, folder);
const commandFiles = fs.readdirSync(path.join(commandPath)).filter((file:any) => file.endsWith('.ts') && !file.endsWith('.d.ts'));
for (const file of commandFiles) {
    const filePath = path.join(commandPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file:any) => file.endsWith('.ts') && !file.endsWith('.d.ts'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args:any) => {
            event.execute(...args);
        });
    }
    else {
        client.on(event.name, (...args:any) => {
            event.execute(...args);
        });
    }
}

client.login(token);