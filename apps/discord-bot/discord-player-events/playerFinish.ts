import { GuildQueue, GuildQueueEvent, Track } from "discord-player";

module.exports = {
    name: GuildQueueEvent.PlayerFinish,
    once: false,
    async execute(queue:GuildQueue, track:Track) {
        const {channel}=queue.metadata as any;
        
        if(!channel) return;

       await channel.send({content:`Finished Playing: ${track?.title} | ${track?.author}`});

    }
}