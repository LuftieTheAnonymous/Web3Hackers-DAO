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
   
    const {message} = req.body;

    try{
        const {data, error} = await supabaseConfig.from('push_subscriptions').select('endpoint, auth_key, p256dh_key, user_address, notifications_settings(*)').eq('notifyOnNewProposal', true);

        if(!data || (data && data.length === 0)) throw new Error('No subscriptions found');

        const promisesArray=data.map(async (subscription: any) => {
            return webpush.sendNotification({endpoint:subscription.endpoint, keys:{auth:subscription.auth_key, p256dh:subscription.p256dh_key}}, JSON.stringify({
                title: 'Web3 Builders DAO Dapp',
                body: message,
            })).catch(err => console.log(err));
        });

        await Promise.all(promisesArray);

        res.status(200).json({message:"success", data:null, error:null, status:200});
    }catch(err){
        console.log(err);
    }
}