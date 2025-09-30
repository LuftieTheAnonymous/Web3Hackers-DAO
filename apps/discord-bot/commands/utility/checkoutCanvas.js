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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const canvas_1 = require("@napi-rs/canvas");
const discord_js_1 = require("discord.js");
const path_1 = __importDefault(require("path"));
const undici_1 = require("undici");
canvas_1.GlobalFonts.registerFromPath(path_1.default.join(__dirname, '../fonts/Poppins/Poppins-Regular.ttf'), 'Poppins-Regular');
canvas_1.GlobalFonts.registerFromPath(path_1.default.join(__dirname, '../fonts/Poppins/Poppins-Bold.ttf'), 'Poppins-Bold');
canvas_1.GlobalFonts.registerFromPath(path_1.default.join(__dirname, '../fonts/Poppins/Poppins-Thin.ttf'), 'Poppins-Thin');
const convertValueToMln = (value) => {
    if (value < 1000000) {
        return `${Math.floor(value / 1000).toFixed(2)} K`;
    }
    else {
        return `${Math.floor(value / 1000000).toFixed(2)} M`;
    }
};
const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, '') // removes accents
    .replace(/[^\w\s-]/g, '') // removes emojis and symbols
    .trim().toLowerCase();
const blackList = [
    '@everyone', 'Fullstack', 'Mid', 'Junior', 'NewComer',
    'Frontend', 'Backend', 'Co-Founder', 'CTO',
    'Web3Builder Bot', 'Web3_Builder', 'Web3_Mentor',
    'Boost-Hero', 'Web3_DaVinci'
];
const whiteListRoles = [
    'Fullstack', 'Mid', 'Junior', 'NewComer',
    'Frontend', 'Backend', 'Co-Founder', 'CTO',
    'Web3Builder Bot', 'Web3_Builder', 'Web3_Mentor',
    'Boost-Hero', 'Web3_DaVinci'
];
module.exports = {
    cooldown: 25,
    data: new discord_js_1.SlashCommandBuilder().setName('dao-member-info').setDescription('Returns full data about the member of the DAO'),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const canvas = new canvas_1.Canvas(1024, 600);
                const ctx = canvas.getContext('2d');
                const background = yield (0, canvas_1.loadImage)(path_1.default.join(__dirname, '../../images/Web3-Token.jpg'));
                yield interaction.deferReply();
                const fetchMember = yield fetch(`${process.env.BACKEND_ENDPOINT}/gov_token/influence/${interaction.user.id}`);
                const memberObject = yield fetchMember.json();
                if (!memberObject || memberObject.error) {
                    return yield interaction.followUp({ content: memberObject.error, flags: discord_js_1.MessageFlags.Ephemeral });
                }
                const member = yield ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(interaction.user.id));
                if (!member) {
                    return yield interaction.followUp({ content: `No user found with the nickname given.`, flags: discord_js_1.MessageFlags.Ephemeral });
                }
                const techstack = member.roles.cache
                    .filter(role => !blackList.some(bl => normalize(bl.toLowerCase()) === normalize(role.name.toLowerCase())))
                    .map(role => normalize(role.name));
                console.log('techstack', techstack);
                const roles = member.roles.cache
                    .filter(role => whiteListRoles.some(wl => normalize(wl.toLowerCase()) === normalize(role.name.toLowerCase())))
                    .map(role => normalize(role.name));
                console.log('roles', roles);
                ctx.drawImage(background, 0, 0);
                ctx.font = '32px Poppins-Bold';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.fillText(`${interaction.user.globalName}`, 425, 150, canvas.width);
                ctx.font = '24px Poppins-Thin';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(`ID: ${interaction.user.id}`, 425, 200, canvas.width);
                ctx.font = '24px Poppins-Regular';
                ctx.fillStyle = '#05F29B';
                ctx.textAlign = 'center';
                ctx.fillText(`We hope you'll grow with us here more ! `, canvas.width / 2, canvas.height - 10, canvas.width);
                ctx.font = '24px Poppins-Bold';
                ctx.fillStyle = '#05F29B';
                ctx.textAlign = 'center';
                ctx.fillText(`${convertValueToMln(memberObject.tokenAmount)}`, 175, canvas.height - 125, 250);
                ctx.font = '12px Poppins-Regular';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.fillText(`${techstack.slice(0, 3).join(', ')}`, 505, canvas.height - 125, 250);
                ctx.fillText(`${techstack.slice(3, 6).join(', ')}`, 505, canvas.height - 150, 250);
                ctx.font = '16px Poppins-Bold';
                ctx.fillStyle = '#05F29B';
                ctx.textAlign = 'center';
                ctx.fillText(`Wallet Address: ${memberObject.userDBObject.data.userWalletAddress}`, 400, 250, canvas.width);
                roles.map((role, index) => {
                    ctx.font = '12px Poppins-Regular';
                    ctx.fillStyle = '#ffff';
                    ctx.textAlign = 'center';
                    ctx.fillText(`${role}`, 850, canvas.height - (85 + (index * 20)), canvas.width);
                });
                ctx.beginPath();
                ctx.arc(175, 150, 75, 0, Math.PI * 2, true); // Y = 150, not 75
                ctx.stroke();
                ctx.strokeStyle = '#05F29B';
                ctx.closePath();
                ctx.clip();
                const { body } = yield (0, undici_1.request)(interaction.user.displayAvatarURL({ 'forceStatic': true, 'extension': 'jpg' }));
                const avatar = yield (0, canvas_1.loadImage)(Buffer.from(yield body.arrayBuffer()));
                // Draw the avatar inside the clipped circle
                ctx.drawImage(avatar, 90, 75, 180, 180);
                const attachment = new discord_js_1.AttachmentBuilder(yield canvas.encode('jpeg'), { 'name': 'welcome-image.jpeg', 'description': 'Welcome to the server !' });
                yield interaction.followUp({ files: [attachment], content: "Have a nice day, this is your data canvas !" });
            }
            catch (err) {
                yield interaction.followUp({ content: 'There was an error while executing this command!' });
                console.log(err);
            }
        });
    }
};
