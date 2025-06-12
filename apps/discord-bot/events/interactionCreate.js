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
    name: discord_js_1.Events.InteractionCreate,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (interaction.isModalSubmit() && interaction.customId === 'wallet-modal') {
                yield interaction.deferReply();
                const walletAddress = interaction.fields.getTextInputValue('walletAddress');
                console.log(interaction.user);
                console.log(walletAddress);
                const member = interaction.guild.members.cache.get(interaction.user.id);
                const userRegister = yield fetch('http://localhost:2137/members/add-member', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-backend-eligibility': process.env.DISCORD_BOT_INTERNAL_SECRET
                    },
                    body: JSON.stringify({
                        walletAddress,
                        discordId: Number(interaction.user.id),
                        nickname: interaction.user.globalName,
                        photoURL: interaction.user.displayAvatarURL(),
                        isAdmin: member.roles.cache.some((role) => role.name.includes('Co-Founder') || role.name.includes('CTO'))
                    }),
                });
                const response = yield userRegister.json();
                console.log(response);
                if (!response || response.error) {
                    return yield interaction.editReply({ content: response.error });
                }
                yield interaction.editReply({ content: 'Check your DM for more info 😅' });
                yield interaction.user.send({ content: `Congratulations! You have setup your wallet correctly in the DAO-members register ! Now go back to the server run command ${(0, discord_js_1.inlineCode)('/initial-token-distribution')} `, flags: discord_js_1.MessageFlags.Ephemeral });
                return;
            }
            if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);
                if (!command) {
                    console.error(`No command matching ${interaction.commandName} was found.`);
                    return;
                }
                ;
                const { cooldowns } = interaction.client;
                if (!cooldowns.has(interaction.commandName)) {
                    cooldowns.set(interaction.commandName, new discord_js_1.Collection());
                }
                const now = Date.now();
                const timestamps = cooldowns.get(interaction.commandName);
                const defaultCooldownDuration = 3;
                const cooldownAmount = (_b = (_a = interaction.command) === null || _a === void 0 ? void 0 : _a.client.cooldowns.get(interaction.commandName)) !== null && _b !== void 0 ? _b : defaultCooldownDuration * 1000;
                if (timestamps.has(interaction.user.id)) {
                    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
                    if (now < expirationTime) {
                        const timeLeft = Math.round((expirationTime - now) / 1000);
                        return interaction.reply({ content: `You have to wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${interaction.commandName}\` command.`, flags: discord_js_1.MessageFlags.Ephemeral });
                    }
                }
                if (!timestamps.has(interaction.user.id)) {
                    timestamps.set(interaction.user.id, now);
                    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
                }
                try {
                    yield command.execute(interaction);
                }
                catch (error) {
                    if (interaction.replied || interaction.deferred) {
                        yield interaction.reply({ content: 'There was an error while executing this command!' });
                    }
                    else {
                        yield interaction.reply({ content: 'There was an error while executing this command!' });
                    }
                    console.error(`Error executing ${interaction.commandName}:`, error);
                }
            }
        });
    }
};
