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
    name: 'messageReactionAdd',
    execute(reaction, user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (reaction.partial)
                    yield reaction.fetch();
                if (user.bot)
                    return;
                if (reaction.message.id === '1374769028928634921' && reaction.emoji.id === '1366978048854855710') {
                    const guild = reaction.message.guild;
                    const members = guild === null || guild === void 0 ? void 0 : guild.members;
                    if (members) {
                        const member = yield (members === null || members === void 0 ? void 0 : members.fetch(user.id));
                        yield member.roles.add('1375725595396145262');
                    }
                    return;
                }
                else {
                    console.log(reaction.message.id);
                }
            }
            catch (err) {
                console.log(err);
            }
        });
    }
};
