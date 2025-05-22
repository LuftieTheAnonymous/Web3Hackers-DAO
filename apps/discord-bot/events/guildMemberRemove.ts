import { GuildMember } from "discord.js";
import { client } from "..";

module.exports={
    name:"guildMemberRemove",
   async execute(member:GuildMember){
     const channel =  client.channels.cache.get('1375025437218046054');
 
     console.log(member, "member");
 
     if(!channel) return console.log('Channel not found');
    
     await member.send({content:`Goodbye ${member.user.globalName} ! We hope to see you someday again !`});
}
}