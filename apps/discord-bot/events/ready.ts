import { Client, Events } from "discord.js";

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client:
        Client<true>
    ) {
        console.log(`Ready! 
           Bot is online and logged in as
            ${client.user.tag}`);

    }
}