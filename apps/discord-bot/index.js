"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const discord_js_1 = require("discord.js");
const discordBotTypes_1 = require("./types/discordBotTypes");
// Require the necessary discord.js classes
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { token } = require('./discordConfig.json');
dotenv.config();
exports.client = new discordBotTypes_1.CustomClient({ intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildVoiceStates,
        discord_js_1.GatewayIntentBits.GuildPresences,
        discord_js_1.GatewayIntentBits.GuildMessageReactions,
        discord_js_1.GatewayIntentBits.GuildMessageTyping,
        discord_js_1.GatewayIntentBits.GuildExpressions,
        discord_js_1.GatewayIntentBits.GuildModeration,
    ],
    partials: [
        discord_js_1.Partials.Channel,
        discord_js_1.Partials.GuildMember,
        discord_js_1.Partials.Message,
        discord_js_1.Partials.Reaction,
        discord_js_1.Partials.User,
        discord_js_1.Partials.ThreadMember,
        discord_js_1.Partials.GuildScheduledEvent
    ],
});
exports.client.commands = new discord_js_1.Collection();
exports.client.cooldowns = new discord_js_1.Collection();
exports.client.on('error', (error) => {
    console.log(error.message);
});
const folderPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(folderPath);
for (const folder of commandFolders) {
    const commandPath = path.join(folderPath, folder);
    const commandFiles = fs.readdirSync(path.join(commandPath)).filter((file) => file.endsWith('.ts'));
    for (const file of commandFiles) {
        const filePath = path.join(commandPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            exports.client.commands.set(command.data.name, command);
        }
        else {
            console.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.ts'));
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        exports.client.once(event.name, (...args) => {
            event.execute(...args);
        });
    }
    else {
        exports.client.on(event.name, (...args) => {
            event.execute(...args);
        });
    }
}
exports.client.login(token);
