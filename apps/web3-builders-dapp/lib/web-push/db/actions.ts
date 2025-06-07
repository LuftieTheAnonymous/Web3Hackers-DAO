'use server';



import { supabase } from '@/lib/db/supabaseConfigClient';
import webpush from 'web-push';

webpush.setVapidDetails(
    'mailto:kshjssjjs@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY! as string,
    process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY! as string
);

export async function upsertWebPushSubscription(address: `0x${string}`, notificationsPreferences:any){ 
try{

const {data: promises, error} = await supabase.from('notification_settings').select('*').eq('userAddress', address).single();

if(error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch notification settings: ${error.message}`);
}

if(!promises){
    
       const {error: insertError} = await supabase.from('notification_settings').upsert({...notificationsPreferences, userAddress:address}).single();
        if(insertError) {
            throw new Error(`Failed to upsert notification settings: ${insertError.message}`);
        }

}
}

catch(err){
    console.log(err);
    throw new Error(`Failed to upsert web push subscription: ${err}`);
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

export async function notifyEveryDAOMember(message:string,notificationReceivePropertyName:string) {
    try{
         const {data, error} = await supabase.from('notification_settings').select('endpoint, auth_key, p256h_key, userAddress').eq(notificationReceivePropertyName, true);

        if(error){
    throw new Error(`Failed to fetch subscriptions: ${error.message}`);
        }

        if(!data) throw new Error('No subscriptions found');

if(data.length === 0) {
    console.log('No subscriptions found for notification');
    return;
}
        const promisesArray=data.map(async (subscription: any) => {
            return Promise.resolve(webpush.sendNotification({endpoint:subscription.endpoint, keys:{auth:subscription.auth_key, p256dh:subscription.p256h_key}}, JSON.stringify({
                title: 'Web3 Builders DAO Dapp',
                body: message,
                icon:'/Web3Builders.png',
                image:'/Web3Builders.png'
            })).catch(err => err));
        });


      const result =  await Promise.all(promisesArray);


    }catch(err){
        console.log(err);
    }
}