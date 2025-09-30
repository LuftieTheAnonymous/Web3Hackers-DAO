"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.player = exports.client = void 0;
const discord_js_1 = require("discord.js");
const discordBotTypes_1 = require("./types/discordBotTypes");
const discord_player_1 = require("discord-player");
const extractor_1 = require("@discord-player/extractor");
// Require the necessary discord.js classes
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const { token } = require('./discordConfig.json');
dotenv_1.default.config();
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
const folderPath = path_1.default.join(__dirname, 'commands');
const commandFolders = fs_1.default.readdirSync(folderPath);
for (const folder of commandFolders) {
    const commandPath = path_1.default.join(folderPath, folder);
    const commandFiles = fs_1.default.readdirSync(path_1.default.join(commandPath)).filter((file) => file.endsWith('.ts'));
    for (const file of commandFiles) {
        const filePath = path_1.default.join(commandPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            exports.client.commands.set(command.data.name, command);
        }
        else {
            console.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
const eventsPath = path_1.default.join(__dirname, 'events');
const eventFiles = fs_1.default.readdirSync(eventsPath).filter((file) => file.endsWith('.ts'));
for (const file of eventFiles) {
    const filePath = path_1.default.join(eventsPath, file);
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
exports.player = new discord_player_1.Player(exports.client);
const playerEventsPath = path_1.default.join(__dirname, 'discord-player-events');
const playerEventFiles = fs_1.default.readdirSync(playerEventsPath).filter((file) => file.endsWith('.ts'));
for (const file of playerEventFiles) {
    const filePath = path_1.default.join(playerEventsPath, file);
    const event = require(filePath);
    if (event.once) {
        exports.player.events.once(event.name, (...args) => {
            event.execute(...args);
        });
    }
    else {
        exports.player.events.on(event.name, (...args) => {
            event.execute(...args);
        });
    }
}
exports.client.login(token);
exports.player.extractors.loadMulti(extractor_1.DefaultExtractors);
