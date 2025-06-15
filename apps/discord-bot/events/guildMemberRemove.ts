import { GuildMember } from "discord.js";
import { client } from "..";

module.exports={
    name:"guildMemberRemove",
   async execute(member:GuildMember){
    try{
 const channel =  client.channels.cache.get('1367036582321979423');
 
     console.log(member.avatarURL(), "member");
 
     if(!channel) return console.log('Channel not found');

     await fetch(`http://localhost:2137/gov_token/influence/remove/${member.id}`, {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json',
           'x-backend-eligibility': process.env.DISCORD_BOT_INTERNAL_SECRET as string
         },
         body: JSON.stringify({memberId:member.id})
     });


     await member.send({content:`Goodbye ${member.user.globalName} ! We hope to see you someday again ! :wave: As you have left the Web3 Builders community, you've been deprived of the tokens and you have been removed from the DAO-DBs !`});


    }catch(err){
      
    }
}
}