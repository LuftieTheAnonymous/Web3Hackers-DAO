import { GuildQueue, GuildQueueEvent, Track } from "discord-player";

module.exports = {
    name: GuildQueueEvent.Error,
    once: false,
    async execute(guildQueue:GuildQueue,error:Error){
    try{
        console.log('error in guildQueue', guildQueue);

        console.log(error, "error in player");
    }
    catch(err){
        console.log(err);
    }
    }
}