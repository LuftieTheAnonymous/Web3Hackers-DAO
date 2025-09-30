import { GuildQueue, GuildQueueEvent, Track } from "discord-player";

module.exports = {
    name: GuildQueueEvent.Error,
    once: false,
    async execute(guildQueue:GuildQueue,error:Error){
    try{
        console.log('error in guildQueue', guildQueue);

        console.log(error, "error in player");

        
               const {channel}=guildQueue.metadata as any;
               if(!channel) return;
               await channel.send({content:`Error: ${error}`});
    }
    catch(err){
        console.log(err);
    }
    }
}