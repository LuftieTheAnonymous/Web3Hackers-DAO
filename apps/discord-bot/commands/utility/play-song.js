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
    .setName('play-song')
    .setDescription('Play your favorite song on the channel and chill!')
    .addSubcommand(input => input
    .setName('search')
    .setDescription('Search by name.')
    .addStringOption(option => option.setName('song-name').setDescription('The song you want to play').setRequired(true)))
    .addSubcommand(input => input
    .setName('song')
    .setDescription('Play a song from URL.')
    .addStringOption(option => option.setName('url').setDescription('The song URL').setRequired(true)))
    .addSubcommand(input => input
    .setName('playlist')
    .setDescription('Play a playlist from URL.')
    .addStringOption(option => option.setName('playlist-url').setDescription('The playlist URL').setRequired(true)));
function buildTrackEmbed(track) {
    return new discord_js_1.EmbedBuilder()
        .setTitle(track.title)
        .setURL(track.url)
        .setThumbnail(track.thumbnail)
        .addFields({ name: 'Author', value: track.author, inline: true }, { name: 'Duration', value: track.duration, inline: true });
}
function buildPlaylistEmbed(playlist) {
    var _a;
    return new discord_js_1.EmbedBuilder()
        .setTitle(playlist.title)
        .setURL(playlist.url)
        .setThumbnail(playlist.thumbnail)
        .addFields({ name: 'Author', value: (_a = playlist.author) !== null && _a !== void 0 ? _a : 'Unknown', inline: true }, { name: 'Tracks', value: playlist.tracks.length.toString(), inline: true });
}
module.exports = {
    cooldown: 20,
    data,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.guild || !interaction.channel || !interaction.channel.isVoiceBased()) {
                return yield interaction.reply({
                    content: 'This command can only be used in a voice channel.',
                    ephemeral: true
                });
            }
            const subCommand = interaction.options.getSubcommand();
            const player = (0, discord_player_1.useMainPlayer)();
            const queue = player.queues.create(interaction.guild, {
                metadata: {
                    channel: interaction.channel
                }
            });
            try {
                yield interaction.deferReply();
                if (!queue.connection)
                    yield queue.connect(interaction.channel);
                if (subCommand === 'search') {
                    const query = interaction.options.getString('song-name', true);
                    const result = yield player.search(query, {
                        requestedBy: interaction.user,
                        searchEngine: 'AUTO_SEARCH'
                    });
                    if (!result.tracks.length)
                        return yield interaction.followUp({ content: '❌ No song found.' });
                    const track = result.tracks[0];
                    queue.addTrack(track);
                    if (!queue.isPlaying())
                        yield queue.node.play();
                    return yield interaction.followUp({
                        content: '▶️ Now playing:',
                        embeds: [buildTrackEmbed(track)]
                    });
                }
                if (subCommand === 'song') {
                    const url = interaction.options.getString('url', true);
                    const result = yield player.search(url, {
                        requestedBy: interaction.user,
                        searchEngine: 'auto'
                    });
                    if (!result.tracks.length)
                        return yield interaction.followUp({ content: '❌ No song found at the URL.' });
                    const track = result.tracks[0];
                    queue.addTrack(track);
                    if (!queue.isPlaying())
                        yield queue.node.play();
                    return yield interaction.followUp({
                        content: '▶️ Now playing:',
                        embeds: [buildTrackEmbed(track)]
                    });
                }
                if (subCommand === 'playlist') {
                    const url = interaction.options.getString('playlist-url', true);
                    const result = yield player.search(url, {
                        requestedBy: interaction.user,
                        searchEngine: 'auto'
                    });
                    if (!result.playlist || !result.tracks.length)
                        return yield interaction.followUp({ content: '❌ No playlist found.' });
                    queue.addTrack(result.tracks);
                    if (!queue.isPlaying())
                        yield queue.node.play();
                    return yield interaction.followUp({
                        content: '▶️ Now playing playlist:',
                        embeds: [buildPlaylistEmbed(result.playlist)]
                    });
                }
            }
            catch (error) {
                console.error(`❗ Error executing /play-song:`, error);
                return yield interaction.followUp({
                    content: '⚠️ There was an error while executing this command!',
                });
            }
        });
    }
};
