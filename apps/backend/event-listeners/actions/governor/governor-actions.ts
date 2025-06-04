import { supabaseConfig } from "../../../config/supabase.js";
import webpush from 'web-push';
import redisClient from "../../../redis/set-up.js";

export async function notifyDAOMembersOnEvent(message: string, notificationReceivePropertyName: string) {
    
    const redisStoredNotifcationSubscriptions= JSON.parse(await redisClient.get(`notification_subscriptions:${notificationReceivePropertyName}`)as string);

    try{
        if(!redisStoredNotifcationSubscriptions){
            
            const {data, error} = await supabaseConfig.from('notification_settings').select('endpoint, auth_key, p256h_key, userAddress').eq(notificationReceivePropertyName, true);
    
            if(error){
                console.log({message:"error", data:null, error:error.message, status:500});
                return;
            }
    
            if(!data || (data && data.length === 0)) throw new Error('No subscriptions found');
    
            const promisesArray=data.map(async (subscription: any) => {
                return Promise.resolve(webpush.sendNotification({endpoint:subscription.endpoint, keys:{auth:subscription.auth_key, p256dh:subscription.p256h_key}}, JSON.stringify({
                    title: 'Web3 Builders DAO Dapp',
                    body: message,
                    icon:'/Web3Builders.png',
                    image:'/Web3Builders.png'
                })).catch(err => err));
            });
    
          const result =  await Promise.all(promisesArray);
    
        console.log('Notifications sent successfully', result);
        }else{
            const result =  await Promise.all(redisStoredNotifcationSubscriptions.map(async (subscription: any) => {
                return Promise.resolve(webpush.sendNotification({endpoint:subscription.endpoint, keys:{auth:subscription.auth_key, p256dh:subscription.p256h_key}}, JSON.stringify({
                    title: 'Web3 Builders DAO Dapp',
                    body: message,
                    icon:'/Web3Builders.png',
                    image:'/Web3Builders.png'
                })).catch(err => err));
            }));
    
            console.log('Notifications sent successfully', result);
        }

    }catch(err){
        console.log(err);
      
    }
}