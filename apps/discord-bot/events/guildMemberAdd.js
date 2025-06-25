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
const discord_js_1 = require("discord.js");
const __1 = require("..");
const canvas_1 = require("@napi-rs/canvas");
const undici_1 = require("undici");
const path_1 = __importDefault(require("path"));
canvas_1.GlobalFonts.registerFromPath(path_1.default.join(__dirname, '../fonts/Poppins/Poppins-Regular.ttf'), 'Poppins-Regular');
canvas_1.GlobalFonts.registerFromPath(path_1.default.join(__dirname, '../fonts/Poppins/Poppins-Bold.ttf'), 'Poppins-Bold');
module.exports = {
    name: 'guildMemberAdd',
    execute(member) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const channel = __1.client.channels.cache.get('1367036582321979423');
                console.log(member);
                console.log(channel, "Channel");
                if (!member)
                    return console.log('Member not found');
                if (!channel)
                    return console.log('Channel not found');
                const canvas = new canvas_1.Canvas(1024, 600);
                const ctx = canvas.getContext('2d');
                const background = yield (0, canvas_1.loadImage)(path_1.default.join(__dirname, '../images/Web3-Builders.jpg'));
                ctx.drawImage(background, 0, 0);
                ctx.font = '36px Poppins-Bold';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.fillText(`Welcome to Web3 Builders, ${(_a = member.user.globalName) !== null && _a !== void 0 ? _a : member.user.username} !`, canvas.width / 2, canvas.height / 1.5, canvas.width);
                ctx.font = '24px Poppins-Regular';
                ctx.fillStyle = '#05F29B';
                ctx.textAlign = 'center';
                ctx.fillText(`We hope you'll be having a great time here `, canvas.width / 2, canvas.height - 25, canvas.width);
                ctx.strokeStyle = '#05F29B';
                ctx.strokeRect(2, 2, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.arc(canvas.width / 2, 150, 120, 0, Math.PI * 2, true); // Y = 150, not 75
                ctx.closePath();
                ctx.clip();
                const { body } = yield (0, undici_1.request)(member.displayAvatarURL({ 'forceStatic': true, 'extension': 'jpg' }));
                const avatar = yield (0, canvas_1.loadImage)(Buffer.from(yield body.arrayBuffer()));
                // Draw the avatar inside the clipped circle
                ctx.drawImage(avatar, (canvas.width / 2) - 120, 30, 240, 240);
                const attachment = new discord_js_1.AttachmentBuilder(yield canvas.encode('jpeg'), { 'name': 'welcome-image.jpeg', 'description': 'Welcome to the server !' });
                channel.send({
                    content: `Welcome to the server ${member.user.globalName}!`,
                    files: [attachment]
                });
            }
            catch (err) {
                console.log(err);
            }
        });
    }
};
