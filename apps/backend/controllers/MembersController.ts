import { Request, Response } from "express";
import { supabaseConfig } from "../config/supabase";

export const getMembers = async (req:Request, res:Response) => {
try{
const {data} = await supabaseConfig.from('dao_members').select('*').order('created_at', { ascending: true });

if(!data){
    res.status(404).json({message:"error", data:null, error:"Members not found", status:404 });
}else{
    res.status(200).json({message:"success", data, error:null, status:200 });
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

res.status(200).json({message:"success", data:{discord_member_id:discordId, userWalletAddress:walletAddress, nickname, isAdmin}, error:null, status:200 });
}catch(err){
res.status(500).json({message:"error", data:null, error:err, status:500 });
}
}


export const getMember= async (req:Request, res:Response) => {

    const {discordId} = req.params;
    try{
        const {data, error} = await supabaseConfig.from('dao_members').select('*').eq('discord_member_id', Number(discordId)).single();

        if(!data){
            res.status(404).json({message:"error", data:null, error:"Sorry, you're not elligible to take part in the initial token dstribution. Please register your wallet first !", status:404 });
        }


        if(error){
            res.status(500).json({message:"error", data:null, error:error.message, status:500 });
        }


     res.status(200).json({message:"success", data, error:null, status:200 });
        
    }catch(err){
    res.status(500).json({message:"error", data:null, error:err, status:500 });
    }
}