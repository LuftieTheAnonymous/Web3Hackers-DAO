import { Request, Response } from "express";
import { supabaseConfig } from "../config/supabase.js";
import { governorTokenContract } from "../config/ethersConfig.js";
import redisClient from "../redis/set-up.js";

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
    }=req.body;

    console.log(req.body);
    try{
        const {data, error} = await supabaseConfig.from('dao_members').insert([{discord_member_id:discordId,isAdmin:isAdmin, photoURL:photoURL, userWalletAddress:walletAddress, nickname:nickname}]);

        if(error){
            res.status(500).json({message:"error", data:null, error:error.message, status:500 });
        }

            const tx = await governorTokenContract.addToWhitelist(walletAddress);
                
                const txReceipt = await tx.wait();
                
                console.log(txReceipt);

                await redisClient.hSet(`dao_members:${discordId}`, 'userWalletAddress', walletAddress);
                await redisClient.hSet(`dao_members:${discordId}`, 'isAdmin', `${isAdmin}`);
                await redisClient.hSet(`dao_members:${discordId}`, 'nickname', `${nickname}`);
                await redisClient.hSet(`dao_members:${discordId}`, 'discordId', `${discordId}`);
                await redisClient.hSet(`dao_members:${discordId}`, 'photoURL', `${photoURL}`);



res.status(200).json({message:"success", data:{discord_member_id:discordId, userWalletAddress:walletAddress, nickname, isAdmin}, error:null, status:200 });
}catch(err){
res.status(500).json({message:"error", data:null, error:err, status:500 });
}
}


export const getMember= async (req:Request, res:Response) => {

    const {discordId} = req.params;
    
    const redisStoredWalletAddr = await redisClient.hGet(`dao_members:${discordId}`, 'userWalletAddress');
    const redisStoredIsAdmin = await redisClient.hGet(`dao_members:${discordId}`, 'isAdmin');
    const redisStoredNickname = await redisClient.hGet(`dao_members:${discordId}`, 'nickname');
    const redisStoredDiscordId = await redisClient.hGet(`dao_members:${discordId}`, 'discordId');
    const redisStoredPhotoURL = await redisClient.hGet(`dao_members:${discordId}`, 'photoURL');
    
    
    try{
        
        if(!redisStoredWalletAddr && !redisStoredIsAdmin && !redisStoredNickname && !redisStoredDiscordId){
            console.log('getting member from supabase');
          
            const {data, error} = await supabaseConfig.from('dao_members').select('*').eq('discord_member_id', Number(discordId)).single();

            await redisClient.hSet(`dao_members:${discordId}`, 'userWalletAddress', data.userWalletAddress);
            await redisClient.hSet(`dao_members:${discordId}`, 'isAdmin', `${data.isAdmin}`);
            await redisClient.hSet(`dao_members:${discordId}`, 'nickname', `${data.nickname}`);
            await redisClient.hSet(`dao_members:${discordId}`, 'discordId', `${data.discord_member_id}`);
            await redisClient.hSet(`dao_members:${discordId}`, 'photoURL', `${data.photoURL}`);
    
            if(!data){
                res.status(404).json({message:"error", data:null, error:"Sorry, you're not elligible to take part in the initial token dstribution. Please register your wallet first !", status:404 });
            }
    
    
            if(error){
                res.status(500).json({message:"error", data:null, error:error.message, status:500 });
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