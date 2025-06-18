import { useMainPlayer } from 'discord-player';
import {
  EmbedBuilder,
  SlashCommandBuilder,
  VoiceBasedChannel,
  ChatInputCommandInteraction
} from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const data = new SlashCommandBuilder()
  .setName('play-song')
  .setDescription('Play your favorite song on the channel and chill!')
  .addSubcommand(input =>
    input
      .setName('search')
      .setDescription('Search by name.')
      .addStringOption(option =>
        option.setName('song-name').setDescription('The song you want to play').setRequired(true)
      )
  )
  .addSubcommand(input =>
    input
      .setName('song')
      .setDescription('Play a song from URL.')
      .addStringOption(option =>
        option.setName('url').setDescription('The song URL').setRequired(true)
      )
  )
  .addSubcommand(input =>
    input
      .setName('playlist')
      .setDescription('Play a playlist from URL.')
      .addStringOption(option =>
        option.setName('playlist-url').setDescription('The playlist URL').setRequired(true)
      )
  );

function buildTrackEmbed(track: any): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(track.title)
    .setURL(track.url)
    .setThumbnail(track.thumbnail)
    .addFields(
      { name: 'Author', value: track.author, inline: true },
      { name: 'Duration', value: track.duration, inline: true }
    );
}

function buildPlaylistEmbed(playlist: any): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(playlist.title)
    .setURL(playlist.url)
    .setThumbnail(playlist.thumbnail)
    .addFields(
      { name: 'Author', value: playlist.author ?? 'Unknown', inline: true },
      { name: 'Tracks', value: playlist.tracks.length.toString(), inline: true }
    );
}

module.exports = {
  cooldown: 20,
  data,
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild || !interaction.channel || !interaction.channel.isVoiceBased()) {
      return await interaction.reply({
        content: 'This command can only be used in a voice channel.',
        ephemeral: true
      });
    }

    const subCommand = interaction.options.getSubcommand();
    const player = useMainPlayer();

    const queue = player.queues.create(interaction.guild, {
      metadata: {
        channel: interaction.channel
      }
    });

    try {
      await interaction.deferReply();

      if (!queue.connection)
        await queue.connect(interaction.channel as VoiceBasedChannel);

      if (subCommand === 'search') {
        const query = interaction.options.getString('song-name', true);
        const result = await player.search(query, {
          requestedBy: interaction.user,
          searchEngine: 'AUTO_SEARCH'
        });

        if (!result.tracks.length)
          return await interaction.followUp({ content: '❌ No song found.' });

        const track = result.tracks[0];
        queue.addTrack(track);

        if (!queue.isPlaying()) await queue.node.play();

        return await interaction.followUp({
          content: '▶️ Now playing:',
          embeds: [buildTrackEmbed(track)]
        });
      }

      if (subCommand === 'song') {
        const url = interaction.options.getString('url', true);
        const result = await player.search(url, {
          requestedBy: interaction.user,
          searchEngine: 'auto'
        });

        if (!result.tracks.length)
          return await interaction.followUp({ content: '❌ No song found at the URL.' });

        const track = result.tracks[0];
        queue.addTrack(track);

        if (!queue.isPlaying()) await queue.node.play();

        return await interaction.followUp({
          content: '▶️ Now playing:',
          embeds: [buildTrackEmbed(track)]
        });
      }

      if (subCommand === 'playlist') {
        const url = interaction.options.getString('playlist-url', true);
        const result = await player.search(url, {
          requestedBy: interaction.user,
          searchEngine: 'auto'
        });

        if (!result.playlist || !result.tracks.length)
          return await interaction.followUp({ content: '❌ No playlist found.' });

        queue.addTrack(result.tracks);

        if (!queue.isPlaying()) await queue.node.play();

        return await interaction.followUp({
          content: '▶️ Now playing playlist:',
          embeds: [buildPlaylistEmbed(result.playlist)]
        });
      }
    } catch (error) {
      console.error(`❗ Error executing /play-song:`, error);
      return await interaction.followUp({
        content: '⚠️ There was an error while executing this command!',
      });
    }
  }
};
