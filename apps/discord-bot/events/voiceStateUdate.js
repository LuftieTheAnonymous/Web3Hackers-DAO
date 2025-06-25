"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    name: 'voiceStateUpdate',
    once: false,
    execute(oldState, newState) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const memberActivityMap = new Map();
            // User joins voice
            if (oldState.channelId === null && newState.channelId !== null && newState.member && newState.channel) {
                memberActivityMap.set(`${newState.channelId}-${newState.member.id}`, {
                    memberId: newState.member.id,
                    channelId: newState.channelId,
                    timestampStart: new Date(),
                    timestampEnd: null,
                    isStage: newState.channel.type === discord_js_1.ChannelType.GuildStageVoice,
                    maxAmountOfUsers: newState.channel.members.size,
                    isMicOnTimestamp: newState.selfMute ? null : new Date(),
                    isMicOffTimestamp: null,
                    isMicOnMinutes: 0
                });
            }
            // User mutes/unmutes
            if (newState.channelId && oldState.selfMute !== newState.selfMute && newState.member && newState.channel) {
                const session = memberActivityMap.get(newState.channelId);
                if (!session)
                    return;
                // Unmuted — start tracking mic time
                if (!newState.selfMute && session.isMicOnTimestamp === null) {
                    session.isMicOnTimestamp = new Date();
                }
                // Muted — end tracking mic time
                if (newState.selfMute && session.isMicOnTimestamp) {
                    const now = new Date();
                    const deltaMs = now.getTime() - session.isMicOnTimestamp.getTime();
                    session.isMicOnMinutes += Math.floor(deltaMs / 60000); // only full minutes
                    session.isMicOffTimestamp = now;
                    session.isMicOnTimestamp = null; // reset
                }
            }
            // Track max members
            if (oldState.channelId &&
                newState.channel &&
                newState.channelId &&
                oldState.channelId === newState.channelId &&
                memberActivityMap.has(newState.channelId) &&
                newState.channel.members.size > memberActivityMap.get(newState.channelId).maxAmountOfUsers) {
                memberActivityMap.get(newState.channelId).maxAmountOfUsers = newState.channel.members.size;
            }
            // User disconnects
            if (newState.channelId === null && oldState.channelId !== null && oldState.member && oldState.channel) {
                const session = memberActivityMap.get(oldState.channelId);
                if (!session)
                    return;
                session.timestampEnd = new Date();
                // Calculate mic time if they were unmuted at disconnect
                if (!oldState.selfMute && session.isMicOnTimestamp) {
                    const deltaMs = session.timestampEnd.getTime() - session.isMicOnTimestamp.getTime();
                    session.isMicOnMinutes += Math.floor(deltaMs / 60000);
                    session.isMicOnTimestamp = null;
                }
                // Calculate total duration
                const durationMs = session.timestampEnd.getTime() - session.timestampStart.getTime();
                const minutes = Math.floor(durationMs / 60000);
                if (session.maxAmountOfUsers > 1) {
                    const chatActivityFetch = yield fetch(`${process.env.BACKEND_ENDPOINT}/activity/insert/voice-activity/${oldState.member.id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-backend-eligibility': process.env.DISCORD_BOT_INTERNAL_SECRET
                        },
                        body: JSON.stringify({
                            voice_chat_id: oldState.channelId,
                            minutes_spent: minutes,
                            minutes_mic_on: session.isMicOnMinutes,
                            is_stage: session.isStage,
                            member_id: oldState.member.id,
                            chat_timestamp: session.timestampStart
                        })
                    });
                    const chatActivity = yield chatActivityFetch.json();
                    console.log(chatActivity);
                }
                memberActivityMap.delete(oldState.channelId);
            }
            // Logging
            console.log('--- Old State ---');
            console.log(new Date());
            console.log('Mute', oldState.mute);
            console.log('Self Mute', oldState.selfMute);
            console.log('User', (_a = oldState.member) === null || _a === void 0 ? void 0 : _a.user.tag);
            console.log('Channel ID', oldState.channelId);
            console.log('--- New State ---');
            console.log(new Date());
            console.log('Mute', newState.mute);
            console.log('Self Mute', newState.selfMute);
            console.log('User', (_b = newState.member) === null || _b === void 0 ? void 0 : _b.user.tag);
            console.log('Channel ID', newState.channelId);
        });
    }
};
