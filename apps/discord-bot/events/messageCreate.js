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
const activityMap = new Map([
    ['1351520847830974487', 'general_chat_messages'],
    ['1367042643003047986', 'general_chat_messages'],
    ['1367043422447337553', 'crypto_discussion_messages'],
    ['1367043501031817256', 'crypto_discussion_messages'],
    ['1371221982284353686', 'crypto_discussion_messages'],
    ['1367046089328562176', 'resource_share'],
    ['1367046170496602203', 'resource_share'],
    ['1367046263144579132', 'resource_share'],
    ['1367036947104530442', 'daily_sent_reports']
]);
module.exports = {
    name: 'messageCreate',
    execute(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const member = message.member;
                const checkRoles = (_b = (_a = message.guild) === null || _a === void 0 ? void 0 : _a.members.cache.get(message.author.id)) === null || _b === void 0 ? void 0 : _b.roles;
                const channelMessages = message.channel.messages.cache
                    .filter(msg => msg.author.id === message.author.id);
                console.log(activityMap.get(message.channelId));
                if (activityMap.get(message.channelId) && member && !message.member.user.bot) {
                    const activity = activityMap.get(message.channelId);
                    if (activity === 'daily_sent_reports' && !message.content.match(/^\[DATE: (\d{4})-(\d{2})-(\d{2})\]\nWHAT_I_DID:\n((?:- Task \d+: .+\n)+)WHAT_COULD_BE_BETTER:\n((?:- Point \d+: .+(?:\n|$))+)/)) {
                        yield message.reply({ content: `Please enter the report in the following format:\n[DATE: YYYY-MM-DD]\nWHAT_I_DID:\n- Task 1: ...\n- Task 2: ...\nWHAT_COULD_BE_BETTER:\n- Point 1: ...\n- Point 2: ...` });
                        return;
                    }
                    ;
                    yield fetch(`http://localhost:2137/activity/update/${member.id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-backend-eligibility': process.env.DISCORD_BOT_INTERNAL_SECRET
                        },
                        body: JSON.stringify({
                            activity,
                            id: `${message.author.id}-${new Date().getFullYear()}-${new Date().getMonth()}`,
                        })
                    });
                }
                if ((checkRoles === null || checkRoles === void 0 ? void 0 : checkRoles.cache.filter(role => role.name !== '@everyone').size) === 0) {
                    yield (member === null || member === void 0 ? void 0 : member.createDM(true).then((dm) => __awaiter(this, void 0, void 0, function* () {
                        yield dm.sendTyping();
                        yield dm.send({ 'content': 'Please select your roles firstly go to the "Channels and Roles" section and select your roles there.' });
                    })));
                    if (channelMessages.size === 2) {
                        yield (member === null || member === void 0 ? void 0 : member.edit({ reason: 'Testing Purposes', 'nick': `[Select-role] ${member.user.globalName}`
                        }));
                    }
                    if (channelMessages.size >= 4) {
                        yield (member === null || member === void 0 ? void 0 : member.createDM(true).then((dm) => __awaiter(this, void 0, void 0, function* () {
                            yield dm.sendTyping();
                            yield dm.send({ 'content': 'You have been muted for not following the rules !' });
                        })));
                        yield (member === null || member === void 0 ? void 0 : member.timeout(5 * 60 * 1000, `${member.user.globalName} has been muted for 5 minutes for not following the rules !`));
                    }
                    yield message.reply({ content: `Please select your roles firstly go to the ${(0, discord_js_1.channelMention)('1367036582321979423')} section and select your roles there.` });
                }
                console.log(message);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
};
