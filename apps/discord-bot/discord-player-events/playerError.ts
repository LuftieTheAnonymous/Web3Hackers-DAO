import { GuildQueue, GuildQueueEvent, Track } from "discord-player";

module.exports = {
    name: GuildQueueEvent.PlayerError,
    once: false,
    async execute(queue:GuildQueue, error:Error) {
        try{
            console.log(error, "error in player");
            
            console.log(queue, "queue in player");

            

        }catch(err){
            console.log(err);
        }

    }
}