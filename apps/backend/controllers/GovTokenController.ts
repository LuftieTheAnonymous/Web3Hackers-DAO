import { Request, Response } from "express";
import { governorTokenContract } from "../config/ethersConfig.js";
import { supabaseConfig } from "../config/supabase.js";
import retry from "async-retry";
import redisClient from "../redis/set-up.js";


// Single User Action
const intialTokenDistribution = async (req: Request, res: Response) => {
try {
    const {memberDiscordId} = req.params;
    const {PSR, JEXS, W3I, TKL, KVTR } = req.body;
    
    if(memberDiscordId === undefined || PSR === undefined || JEXS === undefined || W3I === undefined || TKL === undefined || KVTR === undefined){
        console.log(PSR, JEXS, W3I, TKL, KVTR, memberDiscordId);
        res.status(400).json({message:"error", data:null, error:"Please provide all the required parameters", status:400});
        return;
    }

    const {data, error} = await supabaseConfig.from('dao_members').select('*').eq('discord_member_id', Number(memberDiscordId)).single();

    if(!data){
        res.status(404).json({message:"error", data:null, error:"The user with provided nickname was not found", discord_member_id:memberDiscordId, status:404 });
    return;
    }
    
    console.log(data);

    console.log(error);

    if(error){
         res.status(500).json({message:"error", data:null, error:error.message, errorObj:error, discord_member_id:memberDiscordId, status:500 });
       return;
        }


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
        
        const tx = await governorTokenContract.rewardUser(userAddress, BigInt(Number(amount)*1e18));
        
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


        const redisStoredNickname= await redisClient.hGet(`dao_members:${userAddress}`, 'nickname');
    const redisStoredWalletAddress= await redisClient.hGet(`dao_members:${userAddress}`, 'userWalletAddress');

if(!redisStoredNickname && !redisStoredWalletAddress){
    const userDBObject= await supabaseConfig.from('dao_members').select('userWalletAddress, nickname').eq('userWalletAddress', userAddress).single();

    if(!userDBObject.data){
        res.status(404).json({message:"error", data:null, tokenAmount:null,
        error:"The user with provided nickname was not found", userAddress, status:404 });
    }

    if(userDBObject.error){
        res.status(500).json({message:"error",tokenAmount:null, data:null, error:userDBObject.error,userAddress, status:500 });
    }

        const tx = await governorTokenContract.punishMember(userAddress, BigInt(Number(amount)*1e18));

        const txReceipt = await tx.wait();

        console.log(txReceipt);

        res.status(200).json({data:txReceipt,error:null, message:"success", status:200});

        return;
}

const tx = await governorTokenContract.punishMember(redisStoredWalletAddress, amount);

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

    const redisStoredNickname= await redisClient.hGet(`dao_members:${dicordMemberId}`, 'nickname');
    const redisStoredWalletAddress= await redisClient.hGet(`dao_members:${dicordMemberId}`, 'userWalletAddress');

if(!redisStoredNickname && !redisStoredWalletAddress){
    const userDBObject= await supabaseConfig.from('dao_members').select('userWalletAddress, nickname').eq('discord_member_id', Number(dicordMemberId)).single();
    
    
    if(!userDBObject.data){
        res.status(404).json({message:"error", data:null, tokenAmount:null,
             error:"The user with provided nickname was not found", discord_member_id:dicordMemberId, status:404 });
    }
    
    if(userDBObject.error){
        res.status(500).json({message:"error",tokenAmount:null, data:null, error:userDBObject.error,discord_member_id:dicordMemberId, status:500 });
    }
    
        await redisClient.hSet(`dao_members:${dicordMemberId}`, 'nickname', (userDBObject.data as any).nickname);
        await redisClient.hSet(`dao_members:${dicordMemberId}`, 'userWalletAddress', (userDBObject.data as any).userWalletAddress);

    const userTokens = await governorTokenContract.getVotes((userDBObject.data as any)
        .userWalletAddress);


    res.status(200).json({userDBObject, tokenAmount:(Number(userTokens)/1e18), message:`${
        (userDBObject.data as any).nickname} possesses ${(Number(userTokens)/1e18).toFixed(2)} BUILD Tokens`, error:null, status:200});
    return;
}

const userTokens = await governorTokenContract.getVotes(redisStoredWalletAddress);

console.log(Number(userTokens));

res.status(200).json({userDBObject:{nickname:redisStoredNickname, userWalletAddress:redisStoredWalletAddress}, tokenAmount:(Number(userTokens)/1e18), message:`${
    redisStoredNickname} possesses ${(Number(userTokens)/1e18).toFixed(2)} BUILD Tokens`, error:null, status:200});
    
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
    

}