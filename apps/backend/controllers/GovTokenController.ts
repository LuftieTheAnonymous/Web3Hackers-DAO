import { Request, Response } from "express";
import { governorTokenContract } from "../config/ethersConfig";
import { supabaseConfig } from "../config/supabase";
import retry from "async-retry";


// Single User Action
const intialTokenDistribution = async (req: Request, res: Response) => {
try {
    const {memberDiscordId} = req.params;
    const {PSR, JEXS, W3I, TKL, KVTR } = req.body;
    
    if(memberDiscordId === undefined || PSR === undefined || JEXS === undefined || W3I === undefined || TKL === undefined || KVTR === undefined){
        console.log(PSR, JEXS, W3I, TKL, KVTR, memberDiscordId);
        res.status(400).json({message:"error", data:null, error:"Please provide all the required parameters", status:400});
    }

    const {data, error} = await supabaseConfig.from('dao_members').select('*').eq('discord_member_id', Number(memberDiscordId)).single();

    if(!data){
        res.status(404).json({message:"error", data:null, error:"The user with provided nickname was not found", discord_member_id:memberDiscordId, status:404 });
    }
    
    if(error){
         res.status(500).json({message:"error", data:null, error:error.message,discord_member_id:memberDiscordId, status:500 });
    }

    console.log(data);

    const tx = await governorTokenContract.handInUserInitialTokens(PSR, JEXS, W3I, TKL, KVTR, (data as any).userWalletAddress);
    
    const txReceipt = await tx.wait();
    
    console.log(txReceipt);
    
    res.status(200).json({data:txReceipt, error:null, message:"success", status:200});

    
} catch (error) {
    console.log(error);
    res.status(500).json({data:null, error:(error as any).shortMessage, message:"error", status:500});
}
}


const rewardMember = async (req: Request, res: Response) => {
    try {
        const {userAddress} = req.params;

        const {amount} = req.body;
        
        const tx = await governorTokenContract.rewardUser(userAddress, BigInt(Number(amount)));
        
        const txReceipt = await tx.wait();
        
        console.log(txReceipt);
        
        res.status(200).json({data:txReceipt,error:null, message:"success", status:200});
       
    } catch (error) {
            console.log(error);
    res.status(500).json({data:null, error, message:"error", status:500});
    }
}


const punishMember = async (req: Request, res: Response) => {
    try {
        const {userAddress} = req.params;

        const {amount} = req.body;
        
        const tx = await governorTokenContract.punishMember(userAddress, amount);
        
        const txReceipt = await tx.wait();
        
        console.log(txReceipt);
        
        res.status(200).json({data:txReceipt,error:null, message:"success", status:200});
       
    } catch (error) {
            console.log(error);
    res.status(500).json({data:null, error, message:"error", status:500});
    }
}

const  getUserTokenBalance = async (req: Request, res: Response) => {
try {
    const {dicordMemberId} = req.params;

    console.log(dicordMemberId);

    const userDBObject= await supabaseConfig.from('dao_members').select('userWalletAddress, nickname').eq('discord_member_id', Number(dicordMemberId)).single();

    if(!userDBObject.data){
        res.status(404).json({message:"error", data:null, error:"The user with provided nickname was not found", discord_member_id:dicordMemberId, status:404 });
    }

    if(userDBObject.error){
         res.status(500).json({message:"error",tokenAmount:null, data:null, error:userDBObject.error,discord_member_id:dicordMemberId, status:500 });
    }

    const userTokens = await governorTokenContract.getVotes((userDBObject.data as any)
        .userWalletAddress);

        console.log(Number(userTokens));

    res.status(200).json({userDBObject, tokenAmount:(Number(userTokens)/1e18), message:`${
        (userDBObject.data as any).nickname} possesses ${(Number(userTokens)/1e18).toFixed(2)} BUILD Tokens`, error:null, status:200});
    
} catch (error) {
    console.log(error);
    res.status(500).json({data:null, error, message:"error", status:500});
}
}


const monthlyTokenDistribution = async (req: Request, res: Response) => {
    try {

        const monthActivities= await supabaseConfig.from('dao_month_activity').select('*, dao_members!inner(*)').lte('reward_month', new Date().toISOString());

        if(monthActivities.error){
            console.log(monthActivities.error);
            res.status(500).json({data:null, error:monthActivities.error, message:"error", status:500});
        }
        if(!monthActivities.data || monthActivities.data.length === 0){
            res.status(404).json({data:null, error:"No monthly activities found", message:"error", status:404});
        }

const promisesArray = (monthActivities.data as any).map(async (activity: any) => {

    return  Promise.resolve(async()=>{

  await retry((async () => {
              const tx = await governorTokenContract.rewardMonthlyTokenDistribution(BigInt(1),BigInt(1),BigInt(1),BigInt(1),BigInt(1),BigInt(1),BigInt(1), 
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
            res.status(404).json({data:null, error:"No monthly activities found", message:"error", status:404});
        }

    res.status(200).json({data:null, error:null, message:"success", status:200});
    } catch (error) {
            console.log(error);
    res.status(500).json({data:null, error, message:"error", status:500});
    }
}




export {
    intialTokenDistribution,
    punishMember,
    rewardMember,
    getUserTokenBalance,
    monthlyTokenDistribution,

}