import { MessageReaction, User } from "discord.js"

module.exports={
    name:'messageReactionRemove',
    once:false,
    async execute(reaction:MessageReaction,user:User){
       try{
            if(reaction.partial) await reaction.fetch();
            if(user.bot) return;

            if(reaction.message.id === '1374769028928634921' && reaction.emoji.id === '1366978048854855710') {
                const guild = reaction.message.guild;
                const members=guild?.members;
                
                if(members) {
                    const member=await members?.fetch(user.id);

                await member.roles.remove('1375725595396145262');
            }
        }
        }catch(err){
            console.log(err);
        }
    }
}