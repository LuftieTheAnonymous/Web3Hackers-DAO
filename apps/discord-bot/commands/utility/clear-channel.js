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
    data: new discord_js_1.SlashCommandBuilder().setName('clear-channel')
        .setDescription('This command clears a channel').addChannelOption(option => option.setName('channel').setDescription('The channel you want to clear').setRequired(true)).setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageMessages),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!interaction.guild)
                    return yield interaction.reply("This command can only be used in a server.");
                yield interaction.deferReply();
                (_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.messages.cache.clear();
                yield interaction.editReply("Channel cleared!");
            }
            catch (err) {
                console.log(err);
                yield interaction.reply("There was an error while executing this command!");
            }
        });
    }
};
