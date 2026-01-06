import { Request, Response } from "express";
import { supabaseConfig } from "../config/supabase.js";
import { governorTokenContract } from "../config/ethersConfig.js";
import redisClient from "../redis/set-up.js";
import { getDatabaseElement, insertDatabaseElement } from "../db-actions.js";
import { DaoMember } from "../types/TypeScriptTypes.js";

export const getMembers = async (req:Request, res:Response) => {
try{

    const redisStoredMembers
     = JSON.parse(await redisClient.get("dao_members") as string);

     if(!redisStoredMembers){
console.log('getting members from supabase');
         const {data} = await supabaseConfig.from('dao_members').select('*').order('created_at', { ascending: true });
         
         if(!data){
             res.status(404).json({message:"error", data:null, error:"Members not found", status:404 });
         }else{
         await redisClient.setEx("dao_members", 7200, JSON.stringify(data));
             res.status(200).json({message:"success", data, error:null, status:200 });
         }
     }else{
         res.status(200).json({message:"success", data:redisStoredMembers, error:null, status:200 });
     }

}catch(err){
res.status(500).json({message:"error", data:null, error:err, status:500 });
}
};

export const addMember= async (req:Request, res:Response) => {

    const {
        discordId,
        walletAddress,
        nickname,
        isAdmin,
        photoURL
    } = req.body;

    try{
const memberDiscordId = await redisClient.hGet(`dao_members:${discordId}`, `discordId`);

if(memberDiscordId){
    res.status(400).json({message:'error', error:'The user is already added to the database.', data:null, status:400});
    return;
}

     const tx = await governorTokenContract.addToWhitelist(walletAddress);
                
                const txReceipt = await tx.wait();
                
                console.log(txReceipt, 'Transaction Receipt of adding member to whitelist');    
            if(txReceipt.message === 'error'){
                    res.status(500).json({message:'error', data:null, error:txReceipt.shortMessage, status:500});
                    return;
                }

        const {error} = await insertDatabaseElement('dao_members', {
            userWalletAddress:walletAddress,
            discord_member_id:discordId, 
            nickname, 
            isAdmin, 
            photoURL});  
    

        if(error){
            res.status(500).json({message:"error", data:null, error:`ERROR: ${error.includes("duplicate key value violates unique") ? `Member already exists with this wallet address` : error}`, status:500 });
            return;
        }

    
    await redisClient.hSet(`dao_members:${discordId}`, 'userWalletAddress', walletAddress);
    await redisClient.hSet(`dao_members:${discordId}`, 'isAdmin', JSON.stringify(isAdmin));
    await redisClient.hSet(`dao_members:${discordId}`, 'nickname', `${nickname}`);
    await redisClient.hSet(`dao_members:${discordId}`, 'discordId', discordId);
    await redisClient.hSet(`dao_members:${discordId}`, 'photoURL', JSON.stringify(photoURL));

res.status(200).json({message:"success", error:null, status:200 });
}catch(err){
res.status(500).json({message:"error", error:(err as any).shortMessage, status:500 });
}
}


export const getMember= async (req:Request, res:Response) => {

    const {discordId} = req.params;
    
    const redisStoredWalletAddr = await redisClient.hGet(`dao_members:${discordId}`, 'userWalletAddress');
    const redisStoredIsAdmin = await redisClient.hGet(`dao_members:${discordId}`, 'isAdmin');
    const redisStoredNickname = await redisClient.hGet(`dao_members:${discordId}`, 'nickname');
    const redisStoredDiscordId = await redisClient.hGet(`dao_members:${discordId}`, 'discordId');
    const redisStoredPhotoURL = await redisClient.hGet(`dao_members:${discordId}`, 'photoURL');

    console.log('redis values:');
  const allFields =  await redisClient.hGetAll(`dao_members:${discordId}`);
  console.log(allFields);
    console.log(redisStoredWalletAddr, redisStoredIsAdmin, redisStoredNickname, redisStoredPhotoURL);

    try{
        
        if(!redisStoredWalletAddr || !redisStoredIsAdmin || !redisStoredNickname || !redisStoredDiscordId){
            console.log('getting member from supabase');
          
            const {data, error} = await getDatabaseElement<DaoMember>('dao_members', 'discord_member_id', discordId);

            if(!data){
                res.status(404).json({message:"error", data:null, error:"Member not found", status:404 });
                return;
            }
            if(!error){
                console.log('setting member to redis');
                  res.status(404).json({message:"error", data:null, error:"Member not found", status:404 });
                  return;
            }

            await redisClient.hSet(`dao_members:${discordId}`, 'userWalletAddress', data.userWalletAddress);
            await redisClient.hSet(`dao_members:${discordId}`, 'isAdmin', `${data.isAdmin}`);
            await redisClient.hSet(`dao_members:${discordId}`, 'nickname', `${data.nickname}`);
            await redisClient.hSet(`dao_members:${discordId}`, 'discordId', `${data.discord_member_id}`);
            await redisClient.hSet(`dao_members:${discordId}`, 'photoURL', `${data.photoURL}`);
    
            if(!data){
                res.status(404).json({message:"error", data:null, error:"Sorry, you're not elligible to take part in the initial token dstribution. Please register your wallet first !", status:404 });
            }
    
    
            if(error){
                res.status(500).json({message:"error", data:null, error:error, status:500 });
            }
    
    
         res.status(200).json({message:"success", data, error:null, status:200 });
         return;
        }

        res.status(200).json({message:"success", data:{discord_member_id:Number(discordId), userWalletAddress:redisStoredWalletAddr, nickname:redisStoredNickname, isAdmin:redisStoredIsAdmin,
            photoURL:redisStoredPhotoURL
        }, error:null, status:200 });
    }catch(err){
    res.status(500).json({message:"error", data:null, error:err, status:500 });
    }
}