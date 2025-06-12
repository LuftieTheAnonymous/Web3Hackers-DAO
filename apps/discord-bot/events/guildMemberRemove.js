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
const __1 = require("..");
module.exports = {
    name: "guildMemberRemove",
    execute(member) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const channel = __1.client.channels.cache.get('1367036582321979423');
                console.log(member.avatarURL(), "member");
                if (!channel)
                    return console.log('Channel not found');
                yield member.send({ content: `Goodbye ${member.user.globalName} ! We hope to see you someday again !` });
            }
            catch (err) {
            }
        });
    }
};
