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
    cooldown: 15,
    data: new discord_js_1.SlashCommandBuilder().setName('server')
        .setDescription('Get server information'),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.guild)
                return;
            yield interaction.reply(`Server name: ${interaction.guild.name}\nMember count: ${interaction.guild.memberCount}`);
        });
    }
};
