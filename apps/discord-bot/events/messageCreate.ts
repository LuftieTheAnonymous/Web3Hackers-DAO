import { Message } from "discord.js";
import { client } from "..";

module.exports={
    name: 'messageCreate',
    once: true,
    async execute(message:Message) {
        try{
            const checkRoles= message.guild?.members.cache.get(message.author.id)?.roles;

            console.log(checkRoles, 'Checking the roles');

            if(checkRoles?.cache.size === 0){
                await message.reply({content:`Please select your roles firstly go to the "Channels and Roles" section and select your roles there.`});
            }


        }catch(err){
            console.log(err);
        }
    }
}