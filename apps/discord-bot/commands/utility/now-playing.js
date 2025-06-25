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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_player_1 = require("discord-player");
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const data = new discord_js_1.SlashCommandBuilder()
    .setName('now-playing') // Command name
    .setDescription('Show the currently playing song !');
module.exports = {
    cooldown: 20,
    data: data,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.guild)
                return;
            const queue = (0, discord_player_1.useQueue)(interaction.guild);
            try {
                if (!queue)
                    return yield interaction.reply({ content: "No music is being played right now." });
                // Get the currently playing song
                const currentSong = queue.currentTrack;
                console.log(currentSong);
                // Check if there is a song playing
                if (!currentSong) {
                    return interaction.reply('No song is currently playing.');
                }
                // Send the currently playing song information
                return interaction.reply(`Now playing: ${currentSong.name}`);
            }
            catch (error) {
                console.error(`Error executing ${interaction}:`, error);
                yield interaction.reply({ content: 'There was an error while executing this command!' });
            }
        });
    }
};
