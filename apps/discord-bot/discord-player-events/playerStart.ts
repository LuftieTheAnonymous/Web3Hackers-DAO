import { GuildQueue, GuildQueueEvent, Track } from "discord-player";
import { Client, Events } from "discord.js";

module.exports = {
    name: GuildQueueEvent.PlayerStart,
    once: false,
    async execute(queue:GuildQueue, track:Track) {
        const {channel}=queue.metadata as any;
        
        if(!channel) return;

       await channel.send({content:`Now playing **${track?.title} | ${track?.author}**`});

    }
}