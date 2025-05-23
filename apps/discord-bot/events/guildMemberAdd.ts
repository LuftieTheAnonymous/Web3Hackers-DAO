import {  AttachmentBuilder, GuildMember} from "discord.js";
import { client } from "..";
import { Canvas, GlobalFonts, loadImage, } from "@napi-rs/canvas";
import { request } from "undici";
import path from 'path'

GlobalFonts.registerFromPath(path.join(__dirname,'../fonts/Poppins/Poppins-Regular.ttf'), 'Poppins-Regular');

GlobalFonts.registerFromPath(path.join(__dirname,'../fonts/Poppins/Poppins-Bold.ttf'), 'Poppins-Bold');

module.exports={
    name:'guildMemberAdd',
    async execute(member:GuildMember){
try{


    const channel =  client.channels.cache.get('1367036582321979423');

    console.log(member);

    console.log(channel, "Channel");

    if(!member) return console.log('Member not found');

    if(!channel) return console.log('Channel not found');

    const canvas = new Canvas(1024, 600);
    const ctx = canvas.getContext('2d');
    const background = await loadImage(path.join(__dirname,'../images/Web3-Builders.jpg'));
   
    ctx.drawImage(background, 0, 0);

    
        ctx.font= '36px Poppins-Bold';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`Welcome to Web3 Builders, ${member.user.globalName ?? member.user.username} !`, canvas.width / 2, canvas.height / 1.5, canvas.width);


        ctx.font= '24px Poppins-Regular';
        ctx.fillStyle = '#05F29B';
        ctx.textAlign = 'center';
        ctx.fillText(`We hope you'll be having a great time here `, canvas.width / 2, canvas.height - 25, canvas.width);


           ctx.strokeStyle= '#05F29B';
        ctx.strokeRect(2, 2, canvas.width, canvas.height);

        

        
 ctx.beginPath();
ctx.arc(canvas.width / 2, 150, 120, 0, Math.PI * 2, true); // Y = 150, not 75
ctx.closePath();
ctx.clip();


        const {body} = await request(member.displayAvatarURL({'forceStatic':true, 'extension':'jpg'}));
        
        const avatar = await loadImage(Buffer.from(await body.arrayBuffer()));
// Draw the avatar inside the clipped circle
ctx.drawImage(avatar, (canvas.width / 2) - 120, 30, 240, 240);

    const attachment = new AttachmentBuilder(await canvas.encode('jpeg'), {'name':'welcome-image.jpeg', 'description':'Welcome to the server !'});



(channel as any).send({
    content:`Welcome to the server ${member.user.globalName}!`,
    files:[attachment]
});

}catch(err){
    console.log(err);
}
    
    }
}