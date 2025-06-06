import { governorTokenContract } from "../../../../config/ethersConfig.js";
import { supabaseConfig } from "../../../../config/supabase.js";
import retry from "async-retry";
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

const promisesArray = (monthActivities.data as any).map(async (activity: any) => {

    return  Promise.resolve(async()=>{

  await retry((async () => {
              const tx = await governorTokenContract.rewardMonthlyTokenDistribution(BigInt(activity.daily_sent_reports),BigInt(activity.votings_participated),BigInt(activity.proposals_accepted),BigInt(activity.problems_solved),BigInt(activity.resources_share), BigInt(activity.proposals_created), BigInt((activity.general_chat_messages + activity.crypto_discussion_messages) / 30), 
            (activity as any).dao_members.userWalletAddress);
        
        const txReceipt = await tx.wait();
        console.log(txReceipt);
          }),{
            retries:5,
            maxTimeout: 1 * 1000 * 3600, // 1 hour
            onRetry(err,attempt){
                console.log(`Retrying... Attempt ${attempt} due to error: ${err}`);
            }
          });
    
        
    });

});

        const result = await Promise.all(promisesArray);

        console.log(result);

        if(!result || result.length === 0){
            return {data:null, error:"No monthly activities found", message:"error", status:404};
        }

    return {data:null, error:null, message:"success", status:200};
    } catch (error) {
            console.log(error);
    return {data:null, error, message:"error", status:500};
    }
}
