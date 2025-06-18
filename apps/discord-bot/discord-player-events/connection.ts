import { GuildQueue, GuildQueueEvent, Track } from "discord-player";

module.exports = {
    name: GuildQueueEvent.Connection,
    once: false,
    async execute(queue:GuildQueue){
    console.log('Connected to voice channel', queue.metadata);
}
}