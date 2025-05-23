import { Request, Response } from "express";
import { governorTokenContract } from "../config/ethers.config";
import { supabaseConfig } from "../config/supabase";


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

    const tx = await governorTokenContract.handInUserInitialTokens(PSR, JEXS, W3I, TKL, KVTR, (data as any).userWalletAddress,  (data as any).isAdmin);
    
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

    const userDBObject= await supabaseConfig.from('dao_members').select('*').eq('discord_member_id', Number(dicordMemberId)).single();

    console.log(userDBObject.data);

    if(!userDBObject.data){
        res.status(404).json({message:"error", data:null, error:"The user with provided nickname was not found", discord_member_id:dicordMemberId, status:404 });
    }

    if(userDBObject.error){
         res.status(500).json({message:"error",tokenAmount:null, data:null, error:userDBObject.error,discord_member_id:dicordMemberId, status:500 });
    }

    const userTokens = await governorTokenContract.getVotes(userDBObject.data.userWalletAddress);

    res.status(200).json({userDBObject, tokenAmount:(Number(userTokens)/1e18), message:`${userDBObject.data.nickname} possesses ${(Number(userTokens)/1e18).toFixed(2)} BUILD Tokens`, error:null, status:200});
    
} catch (error) {
    console.log(error);
    res.status(500).json({data:null, error, message:"error", status:500});
}
}



// Multiple users actions
const monthlyTokenDistribution = async (req: Request, res: Response) => {
    try {

        const monthActivities= await supabaseConfig.from('')


// [].map(async (userAddress) => {

//     const tx = await governorTokenContract.rewardMonthlyTokenDistribution(BigInt(1),BigInt(1),BigInt(1),BigInt(1),BigInt(1),BigInt(1),BigInt(1), userAddress);
        
//         const txReceipt = await tx.wait();
        
//         console.log(txReceipt);
        
//         res.json({data:txReceipt,error:null, message:"success", status:200});
// });
    res.status(200).json({data:null, error:null, message:"success", status:200});
    } catch (error) {
            console.log(error);
    res.status(500).json({data:null, error, message:"error", status:500});
    }
}

const updateMonthlyStats= async (req:Request, res:Response)=>{
    const {discordMemberId} = req.params;
    const  {}=req.body;
    try{

    }
    catch(err){

    }
}

export {
    intialTokenDistribution,
    punishMember,
    rewardMember,
    getUserTokenBalance,
    monthlyTokenDistribution,
    updateMonthlyStats
}