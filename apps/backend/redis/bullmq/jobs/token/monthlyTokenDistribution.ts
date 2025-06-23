import { governorTokenContract } from "../../../../config/ethersConfig.js";
import { supabaseConfig } from "../../../../config/supabase.js";
import retry from "async-retry";
import pLimit from 'p-limit';
export const monthlyTokenDistribution = async () => {
    try {
const year = new Date().getFullYear();
const month = new Date().getMonth(); // Note: getMonth() is 0-indexed
const idPrefix = `${year}-${month}`; // example: "2025-5"

        const monthActivities= await supabaseConfig.from('dao_month_activity').select('*, dao_members:dao_members(*)').filter('id', 'ilike', `%-${idPrefix}%`).is('is_rewarded', false);

        if(monthActivities.error){
            console.log(monthActivities.error, 'Month Activities Error');
            return {data:null, error:monthActivities.error, message:"error", status:500};
        }
        if(!monthActivities.data || monthActivities.data.length === 0){
            console.log('No monthly activities found', monthActivities.data);
            return {data:null, error:"No monthly activities found", message:"error", status:404};
        }

const limit = pLimit(10);


console.log(monthActivities.data, 'Month Activities');

const promisesArray = (monthActivities.data).map(async (activity: any) => {
    return await limit(async()=>{
 return await retry((async () => {
 try {
    const tx = await governorTokenContract.rewardMonthlyTokenDistribution(activity.daily_sent_reports, activity.votings_participated, activity.proposals_accepted, activity.problems_solved, activity.proposals_created, activity.crypto_discussion_messages, activity.resource_share, activity.dao_members.userWalletAddress);
    console.log(tx);
    const txReceipt = await tx.wait();
    console.log(txReceipt);

    if(txReceipt){
        await supabaseConfig.from('dao_month_activity').update({is_rewarded: true}).eq('id', activity.id);
    }

    return { success: true, activityId: activity.id, receipt: txReceipt };
} catch (err) {
    console.log(err);
    return { success: false, activityId: activity.id, receipt: null };
}
          }),{
            retries:5,
            maxTimeout:  1000 * 60 * 5, // 1 hour
            onRetry(err,attempt){
                console.log(`Retrying... Attempt ${attempt} due to error: ${err}`);
            }
          });
    
        
    });

});


console.log(promisesArray, "Monthly Distributed Tokens");

        const result = await Promise.allSettled(promisesArray);

        console.log(result);

        if(!result || result.length === 0){
            return {data:null, error:"No monthly activities found", message:"error", status:404};
        }

    return {data:result, error:null, message:"success", status:200};
    } catch (error) {
            console.log(error);
    return {data:null, error, message:"error", status:500};
    }
}
