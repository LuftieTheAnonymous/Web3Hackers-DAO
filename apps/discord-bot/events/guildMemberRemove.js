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
module.exports = {
    name: "guildMemberRemove",
    execute(member) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const channel = member.guild.channels.cache.get('1367036582321979423');
                console.log(member.avatarURL(), "member");
                if (!channel)
                    return console.log('Channel not found');
                yield fetch(`${process.env.BACKEND_ENDPOINT}/gov_token/influence/remove/${member.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-backend-eligibility': process.env.DISCORD_BOT_INTERNAL_SECRET
                    },
                    body: JSON.stringify({ memberId: member.id })
                });
                if (channel.isSendable()) {
                    yield channel.send({ content: `Goodbye ${member.user.globalName} !`, embeds: [{
                                color: 0xff0000,
                                title: `Goodbye ${member.user.globalName} ! :wave:`,
                                description: `We hope to see you someday again ! As you have left the Web3 Builders community, you've been deprived of the tokens and you have been removed from the DAO-DBs !`
                            }] });
                }
                yield member.send({ content: `Goodbye ${member.user.globalName} ! We hope to see you someday again ! :wave: As you have left the Web3 Builders community, you've been deprived of the tokens and you have been removed from the DAO-DBs !` });
            }
            catch (err) {
                console.log(err);
                yield member.send("There was an error while executing this command!");
            }
        });
    }
};
