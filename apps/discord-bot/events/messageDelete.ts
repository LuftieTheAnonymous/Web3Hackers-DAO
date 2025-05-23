import { Message } from "discord.js";
 const activityMap = new Map<string, string>([
    ['1351520847830974487','general_chat_messages'],
    ['1367042643003047986','general_chat_messages'],
    ['1367043422447337553',  'crypto_discussion_messages'],
    ['1367043501031817256',  'crypto_discussion_messages'],
    ['1371221982284353686', 'crypto_discussion_messages'],
    ['1367046089328562176', 'resource_share'],
    ['1367046170496602203',  'resource_share'],
    ['1367046263144579132',  'resource_share'],
    ['1367036947104530442', 'daily_sent_reports']
]);

module.exports={
    name:'messageDelete',
    async execute(message:Message){

        console.log(message);


try{
const member = message.member;
const activity = activityMap.get(message.channelId);



}catch(err){
    console.log(err);
}
    }
}