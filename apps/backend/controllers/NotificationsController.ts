import dotenv from 'dotenv';
import webpush, { PushSubscription } from 'web-push';
import { supabaseConfig } from '../config/supabase';
import { Request, Response } from 'express';

dotenv.config();


webpush.setVapidDetails(
    'mailto:kshjssjjs@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY! as string,
    process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY! as string
);

export async function notifyEveryDAOMember(req:Request, res:Response){
   
    const {message, notificationReceivePropertyName} = req.body;

    try{
        const {data, error} = await supabaseConfig.from('notification_settings').select('endpoint, auth_key, p256h_key, userAddress').eq(notificationReceivePropertyName as string, true);

        if(error){
            res.status(500).json({message:"error", data:null, error:error.message, status:500});
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

        res.status(200).json({message:"success", data: result, error:null, status:200});
    }catch(err){
        console.log(err);
        res.status(500).json({message:"error", data:null, error:err, status:500});
    }
}


