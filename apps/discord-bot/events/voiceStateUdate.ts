import { ChannelType, VoiceState } from "discord.js";

const memberActivityMap= new Map<string, {memberId:string,channelId:string, timestampStart:Date, timestampEnd:Date | null, isStage:boolean, maxAmountOfUsers:number}>();

module.exports={
    name:'voiceStateUpdate',
    async execute(oldState:VoiceState,newState:VoiceState){



        if(oldState.channelId === null && newState.channelId !== null && newState.member && newState.channel){
            memberActivityMap.set(newState.channelId, {memberId:newState.member.id,channelId:newState.channelId, timestampStart:new Date(), timestampEnd:null, isStage: newState.channel?.type === ChannelType.GuildStageVoice, maxAmountOfUsers:newState.channel.members.size  });
        }


        if(oldState.channelId && newState.channel && newState.channelId && oldState.channelId === newState.channelId && memberActivityMap.get(newState.channelId)  && memberActivityMap.has(newState.channelId) && newState.channel.members.size > memberActivityMap.get(newState.channelId)!.maxAmountOfUsers){
          memberActivityMap.get(newState.channelId)!.maxAmountOfUsers= newState.channel.members.size;
        }

        if(newState.channelId === null  && oldState.channelId !== null && memberActivityMap.get(oldState.channelId) && oldState.member && oldState.channel){
            memberActivityMap.get(oldState.channelId)!.timestampEnd= new Date();

            const timeStamp= ((memberActivityMap.get(oldState.channelId) as {memberId:string,channelId:string, timestampStart:Date, timestampEnd:Date | null, isStage:boolean, maxAmountOfUsers:number}).timestampEnd as Date).getTime()- memberActivityMap.get(oldState.channelId)!.timestampStart.getTime();
            const minutes= Math.floor(timeStamp / 60000);
    
            

           if(memberActivityMap.get(oldState.channelId)!.maxAmountOfUsers > 1){
               const memberActivityFetch= await fetch(`http://localhost:2137/activity/update/voice-activity/${oldState.member.id}`,{
                   method:'POST',
                   headers: {
                       'Content-Type': 'application/json'
                   },
                   body: JSON.stringify({
                    voice_chat_id:oldState.channelId,
                    minutes_spent:minutes,
                    is_stage: memberActivityMap.get(oldState.channelId)!.isStage,
                    
                   })
               })
           }
          
        }


        console.log('Old State Info');
        console.log(new Date());
        console.log('Request To Speak', oldState.requestToSpeakTimestamp);
        console.log('Mute', oldState.mute);
        console.log('suppress', oldState.suppress);
        console.log('streaming', oldState.streaming);
        console.log('self-mute',oldState.selfMute);
        console.log(oldState.member?.user.tag);
        console.log('channelId', oldState.channelId);
        console.log('Old State Info');

   


        console.log("\n\'");
        
        console.log("\n\'");
        
        console.log("--------------------------------------------------------------------------------------");
        
        console.log("New State Info");
   
       console.log(new Date());
console.log('Request To Speak', newState.requestToSpeakTimestamp);
        console.log('Mute', newState.mute);
        console.log('suppress', newState.suppress);
        console.log('streaming', newState.streaming);
        console.log('self-mute',newState.selfMute);
        console.log(newState.member?.user.tag);
                console.log('channelId', 
newState.channelId);
        console.log('New State Info');

    }
}