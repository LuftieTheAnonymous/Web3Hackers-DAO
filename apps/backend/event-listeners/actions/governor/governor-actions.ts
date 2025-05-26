import { supabaseConfig } from "../../../config/supabase";
import webpush from 'web-push';

export async function notifyOnProposalCreated(message: string) {
    
    try{
        const {data, error} = await supabaseConfig.from('notification_settings').select('endpoint, auth_key, p256h_key, userAddress').eq('notifyOnNewProposals', true);

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

    console.log({message:"success", data: result, error:null, status:200});
    }catch(err){
        console.log(err);
      return {message:"error", data:null, error:err, status:500}
    }
}