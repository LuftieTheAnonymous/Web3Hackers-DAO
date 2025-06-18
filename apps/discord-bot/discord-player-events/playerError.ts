import { GuildQueue, GuildQueueEvent, Track } from "discord-player";
import { client } from "..";

module.exports = {
    name: GuildQueueEvent.PlayerError,
    once: false,
    async execute(queue:GuildQueue, error:Error) {
        try{
            console.log(error, "error in player");

               const {channel}=queue.metadata as any;
               if(!channel) return;
               await channel.send({content:`Error: ${error}`});
        
            
            console.log(queue, "queue in player");

            

        }catch(err){
            console.log(err);
        }

    }
}