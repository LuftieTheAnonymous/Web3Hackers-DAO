import { GuildMember } from "discord.js";
import { client } from "..";

module.exports={
    name:"guildMemberRemove",
   async execute(member:GuildMember){
    try{
 const channel =  client.channels.cache.get('1367036582321979423');
 
     console.log(member.avatarURL(), "member");
 
     if(!channel) return console.log('Channel not found');
    
     await member.send({content:`Goodbye ${member.user.globalName} ! We hope to see you someday again !`});


    }catch(err){
      
    }
}
}