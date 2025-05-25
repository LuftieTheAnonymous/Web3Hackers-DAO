'use server';

import webpush, { PushSubscription } from 'web-push';
import { upsertWebPushSubscription } from './db/actions';




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
                notifyOnNewProposal:true,
                notifyOnExecution:true,
                notifyOnRewarding:true,
                notifyOnPunishing:true,
                notifyOnVote:true,
                notifyOnUnvoted:true,
            },{
                user_address:address,
                endpoint:sub.endpoint,
                auth_key:sub.keys.auth,
                p256dh_key:sub.keys.p256dh
            });
    
        return {success:true, error:null, subscription};
    }catch(err){
        console.log(err);
        return {success:false, error:'Failed to subscribe user', subscription};
    }
}

const unsubscribeUser=async()=>{
    subscription = null;

    return {success:true, error:null, subscription};
}

const sendNotification=async(message:string)=>{
    if(!subscription){
        throw new Error('No subscription found');
    }
    try{

    

   const result =    await webpush.sendNotification(subscription as PushSubscription, JSON.stringify({
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