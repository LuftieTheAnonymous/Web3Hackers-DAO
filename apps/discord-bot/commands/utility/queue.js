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
    .setName('queue-song') // Command name
    .setDescription('Queue the song !');
module.exports = {
    cooldown: 20,
    data: data,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.guild)
                return;
            // Get the current queue
            const queue = (0, discord_player_1.useQueue)(interaction.guild);
            if (!queue) {
                return interaction.reply('This server does not have an active player session.');
            }
            // Get the current track
            const currentTrack = queue.currentTrack;
            // Get the upcoming tracks
            const upcomingTracks = queue.tracks.slice(0, 5);
            // Create a message with the current track and upcoming tracks
            const message = [
                `**Now Playing:** ${currentTrack.title} - ${currentTrack.author}`,
                '',
                '**Upcoming Tracks:**',
                ...upcomingTracks.map((track, index) => `${index + 1}. ${track.title} - ${track.author}`),
            ].join('\n');
            // Send the message
            return interaction.reply(message);
        });
    }
};
