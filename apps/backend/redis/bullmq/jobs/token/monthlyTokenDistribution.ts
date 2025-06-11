import { governorTokenContract } from "../../../../config/ethersConfig.js";
import { supabaseConfig } from "../../../../config/supabase.js";
import retry from "async-retry";
import pLimit from 'p-limit';
export const monthlyTokenDistribution = async () => {
    try {

        const monthActivities= await supabaseConfig.from('dao_month_activity').select('*, dao_members!inner(*)').contains('id', `${new Date().getFullYear()}-${new Date().getMonth()}`);

        if(monthActivities.error){
            console.log(monthActivities.error);
            return {data:null, error:monthActivities.error, message:"error", status:500};
        }
        if(!monthActivities.data || monthActivities.data.length === 0){
            return {data:null, error:"No monthly activities found", message:"error", status:404};
        }

const limit = pLimit(10);

const promisesArray = (monthActivities.data as any).map(async (activity: any) => {
    return await limit(async()=>{

 return await retry((async () => {
 try {
    const tx = await governorTokenContract.distributeTokens(activity.id);
    console.log(tx);
    const txReceipt = await tx.wait();
    console.log(txReceipt);
    return { success: true, activityId: activity.id, receipt: txReceipt };
} catch (err) {
    console.log(err);
    return { success: false, activityId: activity.id, receipt: null };
}
          }),{
            retries:5,
            maxTimeout: 1 * 1000 * 3600, // 1 hour
            onRetry(err,attempt){
                console.log(`Retrying... Attempt ${attempt} due to error: ${err}`);
            }
          });
    
        
    });

});

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
