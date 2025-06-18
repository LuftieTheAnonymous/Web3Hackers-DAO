
import { useMainPlayer } from 'discord-player';
import {  Collection, EmbedBuilder, Events, inlineCode, MessageFlags, VoiceBasedChannel} from 'discord.js';

module.exports={
    name: Events.InteractionCreate,
    async execute(interaction:any) {
         if (interaction.commandName === 'play-song') {

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
       
        if(interaction.isModalSubmit() && interaction.customId === 'wallet-modal'){
       
            await interaction.deferReply();
       
            const walletAddress = interaction.fields.getTextInputValue('walletAddress');
            console.log(interaction.user);
            console.log(walletAddress);
            const member = interaction.guild.members.cache.get(interaction.user.id);
        
          
            const userRegister=await fetch('http://localhost:2137/members/add-member', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                'x-backend-eligibility': process.env.DISCORD_BOT_INTERNAL_SECRET as string
                },
                body: JSON.stringify({ 
                    walletAddress, 
                    discordId: Number(interaction.user.id),
                    nickname: interaction.user.globalName, 
                    photoURL: interaction.user.displayAvatarURL(),
                    isAdmin:member.roles.cache.some((role:any) => role.name.includes('Co-Founder') || role.name.includes('CTO'))
                }),
            });

            const response = await userRegister.json();

            console.log(response);


            if(!response || response.error){ 
                return await interaction.editReply
                ({content:response.error});
            }
            await interaction.editReply({content:'Check your DM for more info 😅'});
            await interaction.user.send({content:`Congratulations! You have setup your wallet correctly in the DAO-members register ! Now go back to the server run command ${inlineCode('/initial-token-distribution')} `, flags:MessageFlags.Ephemeral});
        
        return;
        }



        if(interaction.isChatInputCommand()){
            const command = interaction.client.commands.get(interaction.commandName);
          if (!command) {
              console.error(`No command matching ${interaction.commandName} was found.`);
              return;
          };
         
          const {cooldowns}=interaction.client;
          
          if(!cooldowns.has(interaction.commandName)) {
              cooldowns.set(interaction.commandName, new Collection());
          }
    
          const now = Date.now();
          const timestamps = cooldowns.get(interaction.commandName);
          const defaultCooldownDuration = 3;
    
          const cooldownAmount = interaction.command?.client.cooldowns.get(interaction.commandName) ?? defaultCooldownDuration * 1000;
    
    
          if(timestamps.has(interaction.user.id)) {
              const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
    
         
    
              if(now < expirationTime) {
                  const timeLeft = Math.round((expirationTime - now) / 1000);
                  return interaction.reply({content:`You have to wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${interaction.commandName}\` command.`, flags:MessageFlags.Ephemeral});
              }
          }
    
          
          if(!timestamps.has(interaction.user.id)) {
              timestamps.set(interaction.user.id, now);
              setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
          }
          
    
    
    
    
          try {
              await command.execute(interaction);
          } catch (error) {
            if(interaction.replied || interaction.deferred) {
                  await interaction.reply({ content: 'There was an error while executing this command!' });
              }
              else {
                  await interaction.reply({ content: 'There was an error while executing this command!' });
              }
              console.error(`Error executing ${interaction.commandName}:`, error);
          }
      

        }

    }
}