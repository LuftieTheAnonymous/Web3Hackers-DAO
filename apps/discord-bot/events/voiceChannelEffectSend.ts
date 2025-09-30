import { VoiceChannelEffect } from "discord.js";

module.exports={
    name:'voiceChannelEffectSend',
    once:false,
    execute(effect:VoiceChannelEffect) {
        console.log(effect);
    }
}