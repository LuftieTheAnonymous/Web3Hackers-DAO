import { Request, Response } from "express";
import { supabaseConfig } from "../config/supabase.js";
import { governorTokenContract, wallet } from "../config/ethersConfig.js";
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
const redisStoredMember = await redisClient.hGet(`dao_members`, `${discordId}`);



if(redisStoredMember){
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
            discord_member_id:Number(discordId), 
            nickname, 
            isAdmin, 
            photoURL
        });  

        if(error){
            res.status(500).json({message:"error", data:null, error:`ERROR: ${error.includes("duplicate key value violates unique") ? `Member already exists with this wallet address` : error}`, status:500 });
            return;
        }

        const redisObject={
            userWalletAddress:walletAddress,
            discordId: Number(discordId),
            nickname,
            isAdmin: isAdmin,
            photoURL
        }

 await redisClient.hSet(`dao_members`,`${discordId}`, JSON.stringify(redisObject));

res.status(200).json({message:"success", error:null, status:200 });
}
catch(err){
console.log(err);
res.status(500).json({message:"error", error:(err as any).shortMessage, status:500 });
}
}


export const getMember= async (req:Request, res:Response) => {

    const {discordId} = req.params;
    
    const redisStoredMember = await redisClient.hGet(`dao_members`, discordId);

    console.log('redis stored member:', redisStoredMember);

    try{
        
        if(!redisStoredMember){
            console.log('getting member from supabase');
          
            const {data, error} = await getDatabaseElement<DaoMember>('dao_members', 'discord_member_id', discordId);

            if(!data){
                res.status(404).json({message:"error", data:null, error:"Member not found", status:404 });
                return;
            }
            if(error){
                res.status(500).json({message:"error", data:null, error:error, status:500 });
                return;
            }


        const redisObject={
            userWalletAddress:data.userWalletAddress,
            discordId:`${discordId}`,
            nickname:data.nickname,
            isAdmin: `${data.isAdmin}`,
            photoURL:data.photoURL
        };

            await redisClient.hSet(`dao_members`,discordId, JSON.stringify(redisObject));
        
    
         res.status(200).json({message:"success", data, error:null, status:200 });
         return;
        }

        const parsedMember = JSON.parse(redisStoredMember);
        res.status(200).json({message:"success", data:{discord_member_id:Number(discordId), userWalletAddress:parsedMember.userWalletAddress, nickname:parsedMember.nickname, isAdmin:parsedMember.isAdmin,
            photoURL:parsedMember.photoURL
        }, error:null, status:200 });
    }catch(err){
    res.status(500).json({message:"error", data:null, error:err, status:500 });
    }
}