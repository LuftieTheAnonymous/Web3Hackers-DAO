import { Canvas, GlobalFonts, loadImage } from "@napi-rs/canvas";
import { AttachmentBuilder, ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import path from "path";
import { request } from "undici";

GlobalFonts.registerFromPath(path.join(__dirname,'../fonts/Poppins/Poppins-Regular.ttf'), 'Poppins-Regular');

GlobalFonts.registerFromPath(path.join(__dirname,'../fonts/Poppins/Poppins-Bold.ttf'), 'Poppins-Bold');

GlobalFonts.registerFromPath(path.join(__dirname,'../fonts/Poppins/Poppins-Thin.ttf'), 'Poppins-Thin');

const convertValueToMln=(value:number):string=>{
if(value < 1_000_000){
   return `${Math.floor(value/1_000).toFixed(2)} K`;
}else{
    return `${Math.floor(value/1_000_000).toFixed(2)} M`;
}
};


    const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, '') // removes accents
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


module.exports={
    cooldown:25,
    data: new SlashCommandBuilder().setName('dao-member-info').setDescription('Returns full data about the member of the DAO'),
    async execute(interaction:ChatInputCommandInteraction){
        try{

 const canvas = new Canvas(1024, 600);
    const ctx = canvas.getContext('2d');
    const background = await loadImage(path.join(__dirname,'../../images/Web3-Token.jpg'));

    await interaction.deferReply();
    
    const fetchMember = await fetch(`${process.env.BACKEND_ENDPOINT}/gov_token/influence/${interaction.user.id}`);

    const memberObject = await fetchMember.json();
    
    if(!memberObject || memberObject.error){ 
        return await interaction.followUp({content:memberObject.error, flags:MessageFlags.Ephemeral});
    }

    const member = await interaction.guild?.members.fetch(interaction.user.id);

    if(!member){ 
        return await interaction.followUp({content:`No user found with the nickname given.`, flags:MessageFlags.Ephemeral });
    }
    

const techstack = member.roles.cache
  .filter(role =>
    !blackList.some(bl => normalize(bl.toLowerCase()) === normalize(role.name.toLowerCase()))
  )
  .map(role => normalize(role.name));

console.log('techstack', techstack);

const roles = member.roles.cache
  .filter(role =>
    whiteListRoles.some(wl => normalize(wl.toLowerCase()) === normalize(role.name.toLowerCase()))
  )
  .map(role => normalize(role.name));

console.log('roles', roles);


    ctx.drawImage(background, 0, 0);

    
        ctx.font= '32px Poppins-Bold';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`${interaction.user.globalName}`, 425, 150, canvas.width);

        ctx.font= '24px Poppins-Thin';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`ID: ${interaction.user.id}`, 425, 200, canvas.width);


        ctx.font= '24px Poppins-Regular';
        ctx.fillStyle = '#05F29B';
        ctx.textAlign = 'center';
        ctx.fillText(`We hope you'll grow with us here more ! `, canvas.width / 2, canvas.height - 10, canvas.width);

        ctx.font= '24px Poppins-Bold';
        ctx.fillStyle = '#05F29B';
        ctx.textAlign = 'center';
        ctx.fillText(`${convertValueToMln(memberObject.tokenAmount)}`, 175, canvas.height - 125, 250);

           ctx.font= '12px Poppins-Regular';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(`${techstack.slice(0, 3).join(', ')}`, 505, canvas.height - 125, 250);
            ctx.fillText(`${techstack.slice(3, 6).join(', ')}`, 505, canvas.height - 150, 250);


                   ctx.font= '16px Poppins-Bold';
            ctx.fillStyle = '#05F29B';
            ctx.textAlign = 'center';
            ctx.fillText(`Wallet Address: ${memberObject.userDBObject.data.userWalletAddress}`, 400, 250, canvas.width);


roles.map((role, index)=>{
    ctx.font= '12px Poppins-Regular';
            ctx.fillStyle = '#ffff';
            ctx.textAlign = 'center';
            ctx.fillText(`${role}`, 850, canvas.height - (85 + (index * 20)), canvas.width);
})



 ctx.beginPath();
ctx.arc(175, 150, 75, 0, Math.PI * 2, true); // Y = 150, not 75
ctx.stroke();
   ctx.strokeStyle= '#05F29B';
ctx.closePath();
ctx.clip();


        const {body} = await request(interaction.user.displayAvatarURL({'forceStatic':true, 'extension':'jpg'}));
        
        const avatar = await loadImage(Buffer.from(await body.arrayBuffer()));
// Draw the avatar inside the clipped circle
ctx.drawImage(avatar, 90, 75, 180, 180);

    const attachment = new AttachmentBuilder(await canvas.encode('jpeg'), {'name':'welcome-image.jpeg', 'description':'Welcome to the server !'});


await interaction.followUp({files:[attachment], content:"Have a nice day, this is your data canvas !"});


        }catch(err){
            await interaction.followUp({content:'There was an error while executing this command!'});
            console.log(err);
        }
    }
}