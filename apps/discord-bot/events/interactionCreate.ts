
import {  Collection, Events, inlineCode, MessageFlags} from 'discord.js';

module.exports={
    name: Events.InteractionCreate,
    async execute(interaction:any) {
       
        if(interaction.isModalSubmit() && interaction.customId === 'wallet-modal'){
            const walletAddress = interaction.fields.getTextInputValue('walletAddress');
            console.log(interaction.user);
            console.log(walletAddress);
            const member = interaction.guild.members.cache.get(interaction.user.id);
        
          
            const userRegister=await fetch('http://localhost:2137/members/add-member', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
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

            if(!response || response.error){ 
                return await interaction.reply({content:response.error, flags:MessageFlags.Ephemeral});
            }
            await interaction.reply({content:'Check your DM for more info 😅', flags:MessageFlags.Ephemeral});
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