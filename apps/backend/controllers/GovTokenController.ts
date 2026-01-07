import { Request, Response } from "express";
import { governorTokenContract, provider, tokenManagerContract, wallet } from "../config/ethersConfig.js";
import { supabaseConfig } from "../config/supabase.js";
import redisClient from "../redis/set-up.js";
import { deleteDatabaseElement, getDatabaseElement } from '../db-actions.js';
import { DaoMember } from "../types/TypeScriptTypes.js";
import { TOKEN_MANAGER_CONTRACT_ADDRESS } from "../contracts-data/tokenManager/config.js";

const ONE_HOUR_IN_BLOCKS=BigInt(300);

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

    const redisStoredUserWallet = await redisClient.hGet(`dao_members:${memberDiscordId}`,'userWalletAddress');
    const redisStoredUserAdminState= await redisClient.hGet(`dao_members:${memberDiscordId}`,'isAdmin');

    if(!redisStoredUserWallet){
        res.status(404).json({message:'error', data:null, error: `Could not retrieve wallet address or admin state`, status:404})
    return;
    }

const currentBlock = await provider.getBlockNumber();
const chainId = provider._network.chainId;

console.log(currentBlock, chainId);

const domain = {
  name: "Web3HackersDAO",
  version: "1",
  chainId,
  verifyingContract: TOKEN_MANAGER_CONTRACT_ADDRESS
};

const types = {
  Voucher: [
    { name: "receiver", type: "address" },
    { name: "expiryBlock", type: "uint256" },
    { name: "isAdmin", type: "bool" },
    { name: "psrLevel", type: "uint8" },
    { name: "jexsLevel", type: "uint8" },
    { name: "tklLevel", type: "uint8" },
    { name: "web3Level", type: "uint8" },
    { name: "kvtrLevel", type: "uint8" }
  ]
};

const voucher = {
  receiver: redisStoredUserWallet,
  expiryBlock: BigInt(currentBlock) + ONE_HOUR_IN_BLOCKS,
  isAdmin: redisStoredUserAdminState === 'true' ? true : false,
  psrLevel: BigInt(PSR),
  jexsLevel: BigInt(JEXS),
  tklLevel: BigInt(TKL),
  web3Level: BigInt(W3I),
  kvtrLevel: BigInt(KVTR)
};

const signedTypeTx = await wallet.signTypedData(domain,types, voucher);

console.log(signedTypeTx);

const tx = await tokenManagerContract.handInUserInitialTokens(voucher,
        signedTypeTx
    );
    
    const txReceipt = await tx.wait();
    
    console.log(txReceipt);

if(txReceipt.message === 'error'){
res.status(500).json({message:'error', error:txReceipt.shortMessage, status:500});
return;
}
    
    res.status(200).json({error:null, message:"success", status:200});
} catch (error) {
    console.log(error);
    res.status(500).json({ error:(error as any).shortMessage, message:"error", status:500});
}
}

const rewardMember = async (req: Request, res: Response) => {
    try {
        const {userAddress} = req.params;

        const {amount} = req.body;
        
        const tx = await governorTokenContract.rewardUser(userAddress, BigInt(Number(amount)*1e18));
        
        const txReceipt = await tx.wait();
        
        console.log(txReceipt);

        if(txReceipt.message === 'error'){
res.status(500).json({message:'error', error:txReceipt.shortMessage, status:500});
return;
}
        
        res.status(200).json({error:null, message:"success", status:200});
       
    } catch (error) {
    console.log(error);
    res.status(500).json({error, message:"error", status:500});
    }
}


const punishMember = async (req: Request, res: Response) => {
    try {
        const {userAddress} = req.params;

        const {amount} = req.body;


    const redisStoredNickname= await redisClient.hGet(`dao_members:${userAddress}`, 'nickname');
    const redisStoredWalletAddress= await redisClient.hGet(`dao_members:${userAddress}`, 'userWalletAddress');

if(!redisStoredNickname && !redisStoredWalletAddress){
    const userDBObject= await getDatabaseElement<DaoMember>('dao_members', 'userWalletAddress', userAddress);

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

if(txReceipt.message === 'error'){
res.status(500).json({message:'error', error:txReceipt.shortMessage, status:500});
return;
}

        res.status(200).json({error:null, message:"success", status:200});

        return;
}

const tx = await governorTokenContract.punishMember(redisStoredWalletAddress, amount);

const txReceipt = await tx.wait();

console.log(txReceipt);

if(txReceipt.message === 'error'){
res.status(500).json({message:'error', error:txReceipt.shortMessage, status:500});
return;
}

res.status(200).json({error:null, message:"success", status:200});

    } catch (error) {
            console.log(error);
    res.status(500).json({data:null, error, message:"error", status:500});
    }
}

const  getUserTokenBalance = async (req: Request, res: Response) => {
try {
    const {discordMemberId} = req.params;

    const redisStoredNickname= await redisClient.hGet(`dao_members:${discordMemberId}`, 'nickname');
    const redisStoredWalletAddress= await redisClient.hGet(`dao_members:${discordMemberId}`, 'userWalletAddress');
    const redisStoredAdminState = await redisClient.hGet(`dao_members:${discordMemberId}`, 'isAdmin');
    console.log(redisStoredNickname, redisStoredWalletAddress, redisStoredAdminState);


    if(!redisStoredNickname && !redisStoredWalletAddress){
    const userDBObject= await getDatabaseElement<DaoMember>('dao_members', 'discord_member_id', Number(discordMemberId));
    
    
    if(!userDBObject.data){
        res.status(404).json({message:"error", data:null, tokenAmount:null,
             error:"The user with provided nickname was not found", discord_member_id:discordMemberId, status:404 });
   return;
            }
    
    if(userDBObject.error){
        res.status(500).json({message:"error",tokenAmount:null, data:null, error:userDBObject.error,discord_member_id:discordMemberId, status:500 });
   return;
    }
    
      const redisObject={
            userWalletAddress: (userDBObject.data as any).userWalletAddress,
            discordId:`${discordMemberId}`,
            nickname: (userDBObject.data as any).nickname,
            isAdmin: `${(userDBObject.data as any).isAdmin}`,
            photoURL: (userDBObject.data as any).photoURL
        }

        await redisClient.hSet(`dao_members:${discordMemberId}`, redisObject);

    const userTokens = await governorTokenContract.getVotes((userDBObject.data as any)
        .userWalletAddress);

                
    res.status(200).json({ userWalletAddress:redisStoredWalletAddress, message:`${
        (userDBObject.data as any).nickname} possesses ${(Number(userTokens)/1e18).toFixed(2)} BUILD Tokens`, error:null, status:200});
    return;
}

const userTokens = await governorTokenContract.balanceOf(redisStoredWalletAddress);

res.status(200).json({ userWalletAddress:redisStoredWalletAddress, message:`${
    redisStoredNickname} possesses ${(Number(userTokens)/1e18).toFixed(2)} BUILD Tokens`, error:null, status:200});
    
} catch (error) {
    console.log(error);
    res.status(500).json({data:null, error, message:"error", status:500});
}
}


const farewellMember = async (req: Request, res: Response) => {
    try{
        const {memberDiscordId}= req.params;

        console.log(memberDiscordId);

        if(!memberDiscordId){
            res.status(400).json({message:"error", data:null, error:"Please provide all the required parameters", status:400});
            return;
        }

        const userWalletAddress= await redisClient.hGet(`dao_members:${memberDiscordId}`, 'userWalletAddress');

        if(!userWalletAddress){
           const {data, error} = await getDatabaseElement<DaoMember>('dao_members', 'discord_member_id', Number(memberDiscordId));

           console.log(data, error);

           if(!data){
            res.status(404).json({message:"error", data:null, error:"The user with provided nickname was not found", discord_member_id:memberDiscordId, status:404 });
            return;
           }

           if(error){
            res.status(500).json({message:"error", data:null, error:error, errorObj:error, discord_member_id:memberDiscordId, status:500 });
            return;
           }


           const tx= await governorTokenContract.kickOutFromDAO((data as any).userWalletAddress);

           const txReceipt = await tx.wait();

           console.log(txReceipt);
           
           await redisClient.DEL(`dao_members:${memberDiscordId}`);
           await redisClient.hDel(`dao_members:${memberDiscordId}`, 'nickname');
           await redisClient.hDel(`dao_members:${memberDiscordId}`, 'userWalletAddress');

           const {data:removedData,error:removedError}=await deleteDatabaseElement<DaoMember>('dao_members',  Number(memberDiscordId), 'discord_member_id');

           if(!removedData){
            res.status(404).json({message:"error", data:null, error:"The user with provided nickname was not found", discord_member_id:memberDiscordId, status:404 });
            return;
           }

           if(removedError){
            res.status(500).json({message:"error", data:null, error:removedError, errorObj:removedError, discord_member_id:memberDiscordId, status:500 });
            return;
           }

         
         
           res.status(200).json({data:txReceipt, message:"success", error:null, discord_member_id:memberDiscordId, status:200});
       
           return;
        }

        const tx= await tokenManagerContract.kickOutFromDao(userWalletAddress);

        const txReceipt = await tx.wait();

        console.log(txReceipt);

        await redisClient.DEL(`dao_members:${memberDiscordId}`);
        await redisClient.hDel(`dao_members:${memberDiscordId}`, 'nickname');
        await redisClient.hDel(`dao_members:${memberDiscordId}`, 'userWalletAddress');

        const {data:removedData,error}=await supabaseConfig.from('dao_members').delete().eq('discord_member_id', Number(memberDiscordId));


        console.log(removedData, error);

        if(error){
            res.status(500).json({message:"error", data:null, error:error.message, errorObj:error, discord_member_id:memberDiscordId, status:500 });
            return;
        }

        if(!removedData){
            res.status(404).json({message:"error", data:null, error:"The user with provided nickname was not found", discord_member_id:memberDiscordId, status:404 });
            return;
        }

        res.status(200).json({data:txReceipt, message:"success", error:null, discord_member_id:memberDiscordId, status:200});
    }
    catch(err){
        console.log(err);
        res.status(500).json({data:null, error:err, message:"error", status:500});
    }
}



export {
    intialTokenDistribution,
    punishMember,
    rewardMember,
    getUserTokenBalance,
    farewellMember
    

}