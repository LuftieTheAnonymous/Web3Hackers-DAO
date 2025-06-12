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
const data = new discord_js_1.SlashCommandBuilder()
    .setName('who-is_owner')
    .setDescription('Get the owner of the server');
module.exports = {
    cooldown: 10,
    data: data,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Guild interaction", interaction, "Guild interaction");
                if (!interaction.guild) {
                    return yield interaction.reply("This command can only be used in a server.");
                }
                ;
                const owner = yield interaction.guild.fetchOwner();
                console.log(owner);
                if (!owner) {
                    return yield interaction.reply("The owner of this server could not be found.");
                }
                yield interaction.reply(`The owner of this server is: ${owner.user.globalName} (${owner.id})`);
            }
            catch (error) {
                console.error(`Error executing ${interaction}:`, error);
            }
        });
    }
};
