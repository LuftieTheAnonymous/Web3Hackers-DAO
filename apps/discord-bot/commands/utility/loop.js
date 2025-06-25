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
exports.data = void 0;
const discord_js_1 = require("discord.js");
const discord_player_1 = require("discord-player");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('loop') // Command name
    .setDescription('Put your favourite shit on the loop !') // Command description
    .addNumberOption((option) => option
    .setName('mode') // Option name
    .setDescription('The loop mode') // Option description
    .setRequired(true) // Option is required
    .addChoices({
    name: 'Off',
    value: discord_player_1.QueueRepeatMode.OFF,
}, {
    name: 'Track',
    value: discord_player_1.QueueRepeatMode.TRACK,
}, {
    name: 'Queue',
    value: discord_player_1.QueueRepeatMode.QUEUE,
}, {
    name: 'Autoplay',
    value: discord_player_1.QueueRepeatMode.AUTOPLAY,
}));
module.exports = {
    cooldown: 20,
    data: exports.data,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.guild)
                return;
            // Get the loop mode
            const loopMode = interaction.options.getNumber('mode');
            if (!loopMode) {
                return yield interaction.reply({ content: "Invalid loop mode.", flags: discord_js_1.MessageFlags.Ephemeral });
            }
            // Get the current queue
            const queue = (0, discord_player_1.useQueue)(interaction.guild);
            try {
                if (!queue) {
                    return interaction.reply('This server does not have an active player session.');
                }
                // Set the loop mode
                queue.setRepeatMode(loopMode);
                // Send a confirmation message
                const modeNames = {
                    [discord_player_1.QueueRepeatMode.OFF]: 'Off',
                    [discord_player_1.QueueRepeatMode.TRACK]: 'Track',
                    [discord_player_1.QueueRepeatMode.QUEUE]: 'Queue',
                    [discord_player_1.QueueRepeatMode.AUTOPLAY]: 'Autoplay'
                };
                return interaction.reply(`Loop mode set to ${modeNames[loopMode]}.`);
            }
            catch (err) {
                console.log(err);
                yield interaction.reply({ content: 'There was an error while executing this command!' });
            }
        });
    }
};
