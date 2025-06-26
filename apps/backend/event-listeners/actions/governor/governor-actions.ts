import webpush from 'web-push';
import { supabaseConfig } from "../../../config/supabase.js";
import redisClient from "../../../redis/set-up.js";
import dotenv from 'dotenv';

dotenv.config();

webpush.setVapidDetails(
    'mailto:kshjssjjs@gmail.com',
    process.env.VAPID_PUBLIC_KEY! as string,
    process.env.VAPID_PRIVATE_KEY! as string
);

export async function notifyDAOMembersOnEvent(message: string, notificationReceivePropertyName: string) {
    
    const redisStoredNotifcationSubscriptions= JSON.parse(await redisClient.get(`notification_subscriptions:${notificationReceivePropertyName}`)as string);

    try{
        if(!redisStoredNotifcationSubscriptions){
            
            const {data, error} = await supabaseConfig.from('notification_settings').select('*').is(notificationReceivePropertyName, true);
    
            console.log(data);


            if(error){
                console.log({message:"error", data:null, error:error.message, status:500});
                return;
            }
    
            if(!data || (data && data.length === 0)) throw new Error('No subscriptions found');
    
            await redisClient.set(`notification_subscriptions:${notificationReceivePropertyName}`, JSON.stringify(data));

            const promisesArray=data.map(async (subscription: any) => {
                return Promise.resolve(webpush.sendNotification({endpoint:subscription.endpoint, keys:{auth:subscription.auth_key, p256dh:subscription.p256h_key},'expirationTime':1300000000000}, JSON.stringify({
                    title: 'Web3 Builders DAO Dapp',
                    body: message,
                    icon:'/Web3Builders.png',
                    image:'/Web3Builders.png'
                })).catch(err => err));
            });
    
          const result =  await Promise.allSettled(promisesArray);
    
        console.log('Notifications sent successfully', result);
        return
        }
            const result =  await Promise.allSettled(redisStoredNotifcationSubscriptions.map(async (subscription: any) => {
                return Promise.resolve(webpush.sendNotification({endpoint:subscription.endpoint, keys:{auth:subscription.auth_key, p256dh:subscription.p256h_key}}, JSON.stringify({
                    title: 'Web3 Builders DAO Dapp',
                    body: message,
                    icon:'/Web3Builders.png',
                    image:'/Web3Builders.png'
                })).catch(err => err));
            }));
    
            console.log('Notifications sent successfully', result);
        

    }catch(err){
        console.log(err, 'Error in sending notifications');
      
    }
}