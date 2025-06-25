import {  ActionRowBuilder, AnyThreadChannel, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, SelectMenuInteraction, UserSelectMenuBuilder, UserSelectMenuComponent } from "discord.js";

module.exports={
    name:'threadCreate',
    once:false,
async execute(thread: AnyThreadChannel) {

    console.log('Thread ID :', thread.id);
    console.log('Thread Parent ID :', thread.parentId);
    console.log('Thread Owner Id', thread.ownerId);
    console.log('Thread Parent Parent ID :', thread.parent?.parentId);

    if(thread.parentId === '1374756729014718534'){
          const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('solved')
            .setLabel('Solved')
            .setStyle(ButtonStyle.Success).setEmoji('✅'),
    );

    const userOptions = thread.messages.cache
  .map(msg => msg.author)
  .filter((user, i, self) => self.findIndex(u => u.id === user.id) === i && !user.bot)
  .map(user => ({
    label: user.username,
    value: user.id
  }));

const selectRow = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
    new UserSelectMenuBuilder().setCustomId('solved-user').setPlaceholder('Select a user').setMaxValues(1).addDefaultUsers(userOptions.map(option => option.value))
);

    console.log('Thread Parent Parent :', thread.parent?.parentId);

    
 const message=  await thread.send({content:"📌 ** While You Wait...**\n\n" +
"1. **This isn't live support.**\n" +
"People here are volunteers, builders, or just hanging out. Nobody’s paid to sit around and wait for your question — so **be patient**.\n\n" +
"2. **Don’t spam or ping unnecessarily.**\n" +
"It doesn’t make things faster. In fact, it just annoys people and can get you ignored.\n\n" +
"3. **Provide context.**\n" +
"“It doesn’t work” tells us nothing. Share **what you’re trying to do**, **what happened**, **any logs or errors**, and what you’ve already tried.\n\n" +
"4. **Keep your thread clean.**\n" +
"If someone helps you out, mark the answer or let them know what worked. Threads with no closure are a mess for others.\n\n" +
"5. **Respect people’s time.**\n" +
"Everyone here has their own stuff going on. You’re more likely to get help if you act like a decent human.\n\n" +
"Thanks for being cool. Help will come." + "\n\n" + "If you have solved your problem or your problem has been solved, please click the button solved",
components:[selectRow]});


const selectCollector =  message.createMessageComponentCollector({componentType:ComponentType.UserSelect, time:60000, 'filter':i=>i.user.id === thread.ownerId});


selectCollector.on('collect', async (i:SelectMenuInteraction)=>{
   try{
    if(i.customId === 'solved-user'){

        console.log(i.values);

        i.values.forEach(async (value) => {
            
 await fetch(`${process.env.BACKEND_ENDPOINT}/activity/update/${value}`,{
            method:'POST',
         headers: {
                  'Content-Type': 'application/json',
                'x-backend-eligibility': process.env.DISCORD_BOT_INTERNAL_SECRET as string
                },
            body: JSON.stringify({
            activity:'problems_solved',
            id:`${value}-${new Date().getFullYear()}-${new Date().getMonth()}`,
            })
        });
        })

if(i.user.id !== thread.ownerId){
    await i.followUp({content:"You are not the owner of this thread. You cannot decide if the problem has been solved or not. Piss off."});
    return;
}


        await i.reply({content:"Your problem has been solved", ephemeral:true});
        await thread.setLocked(true, "The thread has been closed because the problem has been solved.");
        await thread.setName(`✅ [SOLVED] ${thread.name}`);

    }
   }catch(err){
    await i.followUp({content:"Something went wrong"});
    console.log(err);
   }
});

return;
    }
  


}
    

}




