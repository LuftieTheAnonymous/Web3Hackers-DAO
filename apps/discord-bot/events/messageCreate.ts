import { channelMention, Message } from "discord.js";


 const activityMap = new Map<string, string>([
    ['1351520847830974487','general_chat_messages'],
    ['1367042643003047986','general_chat_messages'],
    ['1367043422447337553',  'crypto_discussion_messages'],
    ['1367043501031817256',  'crypto_discussion_messages'],
    ['1371221982284353686', 'crypto_discussion_messages'],
    ['1367046089328562176', 'resource_share'],
    ['1367046170496602203',  'resource_share'],
    ['1367046263144579132',  'resource_share'],
    ['1367036947104530442', 'daily_sent_reports']
]);



module.exports={
    name: 'messageCreate',
    async execute(message:Message) {
        try{
            const member = message.member;
            const checkRoles= message.guild?.members.cache.get(message.author.id)?.roles;

            const channelMessages= message.channel.messages.cache  
            .filter(msg=> msg.author.id === message.author.id);
            
            console.log(activityMap.get(message.channelId));

            if(activityMap.get(message.channelId) && member && !message.member.user.bot
            ){
                const activity = activityMap.get(message.channelId);
            
                if(activity === 'daily_sent_reports' && !message.content.match(/^\[DATE: (\d{4})-(\d{2})-(\d{2})\]\nWHAT_I_DID:\n((?:- Task \d+: .+\n)+)WHAT_COULD_BE_BETTER:\n((?:- Point \d+: .+(?:\n|$))+)/)) {

                    await message.reply({content:`Please enter the report in the following format:\n[DATE: YYYY-MM-DD]\nWHAT_I_DID:\n- Task 1: ...\n- Task 2: ...\nWHAT_COULD_BE_BETTER:\n- Point 1: ...\n- Point 2: ...`});
                    return;
                };
        
              
             await fetch(`${process.env.BACKEND_ENDPOINT}/activity/update/${member.id}`,{
                    method:'POST',
                  headers: {
                  'Content-Type': 'application/json',
                'x-backend-eligibility': process.env.DISCORD_BOT_INTERNAL_SECRET as string
                },
                    body: JSON.stringify({
                    activity,
                    id:`${member.id}-${new Date().getFullYear()}-${new Date().getMonth()}`,
                    })
                });
         
            }


            
            if(checkRoles?.cache.filter(role=> role.name !== '@everyone').size === 0){
                await member?.createDM(true).then(async (dm) =>{
                    await dm.sendTyping();
                    await dm.send({'content':'Please select your roles firstly go to the "Channels and Roles" section and select your roles there.'});
                });
                
                if(channelMessages.size === 2){
                      await member?.edit({reason:'Testing Purposes', 'nick':`[Select-role] ${member.user.globalName}`
                        });
                }

                if(channelMessages.size >= 4){
                    await member?.createDM(true).then(async (dm) =>{
                    await dm.sendTyping();
                    await dm.send({'content':'You have been muted for not following the rules !'});
                });
                    await member?.timeout( 5 * 60 * 1000, 
                         `${member.user.globalName} has been muted for 5 minutes for not following the rules !`);
                }
                await message.reply({content:`Please select your roles firstly go to the ${channelMention('1367036582321979423')} section and select your roles there.`});
            }

          

            console.log(message);


        }catch(err){
            console.log(err);
        }
    }
}