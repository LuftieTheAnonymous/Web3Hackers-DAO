import { GuildMember } from "discord.js";
import { client } from "..";

module.exports={
    name:"guildMemberRemove",
   async execute(member:GuildMember){
    try{
 const channel = member.guild.channels.cache.get('1367036582321979423');
 
     console.log(member.avatarURL(), "member");
 
     if(!channel) return console.log('Channel not found');

     await fetch(`${process.env.BACKEND_ENDPOINT}/gov_token/influence/remove/${member.id}`, {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json',
           'x-backend-eligibility': process.env.DISCORD_BOT_INTERNAL_SECRET as string
         },
         body: JSON.stringify({memberId:member.id})
     });

     

 if(channel.isSendable()){
    await channel.send({content:`Goodbye ${member.user.globalName} !`, embeds:[{
        color:0xff0000,
        title:`Goodbye ${member.user.globalName} ! :wave:`,
        description:`We hope to see you someday again ! As you have left the Web3 Builders community, you've been deprived of the tokens and you have been removed from the DAO-DBs !`
    }]})
 }


     await member.send({content:`Goodbye ${member.user.globalName} ! We hope to see you someday again ! :wave: As you have left the Web3 Builders community, you've been deprived of the tokens and you have been removed from the DAO-DBs !`});


    }catch(err){
      console.log(err);
        await member.send("There was an error while executing this command!");
    }
}
}