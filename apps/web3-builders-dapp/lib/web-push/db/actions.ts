'use server';

import supabase from "@/lib/db/dbConfig";

import webpush, { PushSubscription } from 'web-push';

webpush.setVapidDetails(
    'mailto:kshjssjjs@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY! as string,
    process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY! as string
);

export async function upsertWebPushSubscription(address: `0x${string}`, notificationsPreferences:any, subscriptionObject:any){ {
try{

const promises= await Promise.allSettled([
    await supabase.from('notification_settings').select('*').eq('userAddress', address).single(),
    await supabase.from('push_subscriptions').select('*').eq('user_address', address).single()
]);

console.log(promises.map((p: any) => p.value.error));

(promises[0] as any).value.error && await supabase.from('notification_settings').upsert({...notificationsPreferences, userAddress:address});
(promises[1] as any).value.error && await supabase.from('push_subscriptions').upsert({...subscriptionObject, user_address:address});

}
catch(err){
    console.log(err);
}
}
}

export async function removeNotificationSettings(address: `0x${string}`){
    try{
        await supabase.from('notification_settings').delete().eq('userAddress', address);
        await supabase.from('push_subscriptions').delete().eq('user_address', address);
    }catch(err){
        console.log(err);
    }
}

export async function notifyEveryDAOMember(message:string){
    try{
        const {data, error} = await supabase.from('push_subscriptions').select('endpoint, auth_key, p256dh_key, user_address, notifications_settings(*)').eq('notifyOnNewProposal', true);

        if(!data || (data && data.length === 0)) throw new Error('No subscriptions found');

        const promisesArray=data.map(async (subscription: any) => {
            return webpush.sendNotification({endpoint:subscription.endpoint, keys:{auth:subscription.auth_key, p256dh:subscription.p256dh_key}}, JSON.stringify({
                title: 'Web3 Builders DAO Dapp',
                body: message,
                icon:'/Web3Builders.png',
                image:'/Web3Builders.png'
            })).catch(err => console.log(err));
        });

        await Promise.all(promisesArray);
    }catch(err){
        console.log(err);
    }
}