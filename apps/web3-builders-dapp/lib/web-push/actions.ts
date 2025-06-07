'use server';

import webpush, { PushSubscription } from 'web-push';
import { upsertWebPushSubscription } from './db/actions';
import { supabase } from '../db/supabaseConfigClient';






webpush.setVapidDetails(
    'mailto:kshjssjjs@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY! as string,
    process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY! as string
);
let subscription: PushSubscription|null = null;

const subscribeUser=async(sub:PushSubscription, address: `0x${string}`,)=>{
    try{
        subscription = sub;
               await upsertWebPushSubscription(address, {
                userAddress:address,
                notifyOnNewProposals:true,
                notifyOnExecution:true,
                notifyOnRewarding:true,
                notifyOnPunishing:true,
                notifyOnVote:true,
                notifyOnUnvoted:true,
                endpoint:sub.endpoint,
                auth_key:sub.keys.auth,
                p256h_key:sub.keys.p256dh
            });
    
        return {success:true, error:null, subscription};
    }catch(err){
        console.log(err);
        return {success:false, error:'Failed to subscribe user', subscription};
    }
}

const unsubscribeUser=async(address: `0x${string}`)=>{
try{
    if(!subscription){
        throw new Error('No subscription found');
        
    }

    const {error: notificationError} = await 
    supabase.from('notification_settings').delete().eq('userAddress', address);
    
    if(!notificationError){
        subscription = null;
    }

    console.log(notificationError);
 
     return {success:true, error:null, subscription};
}catch(err){
    console.log(err);
    return {success:false, error:'Failed to unsubscribe user', subscription: null};
}
}

const sendNotification=async(message:string, notificationReceivePropertyName:string)=>{
    if(!subscription){
        throw new Error('No subscription found');
    }
    try{

        const {data: subscriptionData, error} = await 
        supabase.from('notification_settings').select('endpoint, auth_key, p256h_key, user_address').eq(notificationReceivePropertyName, true);
    
        if(error || !subscriptionData){
            throw new Error(`Failed to fetch subscriptions: ${error?.message || 'No subscriptions found'}`);
        }

   const result =  await webpush.sendNotification(subscription as PushSubscription, JSON.stringify({
            title: 'Web3 Builders DAO Dapp',
            body: message,
            icon:'/Web3Builders.png',
            image:'/Web3Builders.png'
        }));
        
        const {statusCode, headers, body} = result;

        console.log(body);
        
        return {success:true};
    }catch(err){
        console.log(err);
        return {success:false, error:'Failed to send notification'};
    }
}

export {
    subscribeUser,
    unsubscribeUser,
    sendNotification
}