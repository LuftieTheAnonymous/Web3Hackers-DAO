import { Request } from 'express';
import rateLimit from 'express-rate-limit';
import { supabaseConfig } from '../config/supabase.js';
import { governorTokenContract } from '../config/ethersConfig.js';
import dotenv from 'dotenv';
import redisClient from '../redis/set-up.js';
dotenv.config();

const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 20, // Limit each IP to 100 requests per windowMs
    message: {'error': 'Too many requests mate, please try again later.'},
    statusCode: 429,
    standardHeaders: 'draft-8', // Enable the `RateLimit-*` headers
    identifier: 'web3builders-dao-dapp',
    keyGenerator: async (req: Request, res) => {
       try{
 const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            console.warn("No authorization header provided in rate limiter:", req.ip);
            return `${req.ip}`;
        }
        const headerAuthorizationValue = authorizationHeader.split(" ")[1]; 
        return `web3builders-dao-dapp-${headerAuthorizationValue}`;
        
       }catch(err){
        console.error("Rate limiter keyGenerator error:", err);
        return `${req.ip}`;
       }
    },
});


const rewardUserLimiter= rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: 5, 
    message: {'error': 'Too many requests mate, please try again later. You have utilized your reward limit (5) in the last 15 minutes.'},
    statusCode: 429,
    standardHeaders: 'draft-8', // Enable the `RateLimit-*` headers
    identifier: 'adminFunctionAccess',
    keyGenerator: async (req: Request, res) => {
       try{
 const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            console.warn("No authorization header provided in rate limiter:", req.ip);
            return `${req.ip}`;
        }
        const headerAuthorizationValue = authorizationHeader.split(" ")[1]; 
        return `adminFunctionAccess-${headerAuthorizationValue}`;
        
       }catch(err){
        console.error("Rate limiter keyGenerator error:", err);
        return `${req.ip}`;
       }
    },
});

const punishUserLimiter= rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: 5, 
    message: {'error': 'Too many requests mate, please try again later.'},
    statusCode: 429,
    standardHeaders: 'draft-8', // Enable the `RateLimit-*` headers
    identifier: 'adminFunctionAccess',
    handler: async (req, res, next) => {
      console.log(req.ip);
      console.log(req.headers.authorization);
    },
    keyGenerator: async (req: Request, res) => {
       try{
 const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            console.warn("No authorization header provided in rate limiter:", req.ip);
            return `${req.ip}`;
        }
        const headerAuthorizationValue = authorizationHeader.split(" ")[1]; 
        return `adminFunctionAccess-${headerAuthorizationValue}`;
        
       }catch(err){
        console.error("Rate limiter keyGenerator error:", err);
console.error('An error occurred while processing your request.');
        return `${req.ip}`;
       }
    },
});


const proposalCreationLimiter= rateLimit({
    windowMs: 7 * 24 * 60 * 60 * 1000, 
    limit: async(req, res)=>{

      const authorizationHeader = req.headers.authorization;
      if (!authorizationHeader) {
        console.warn("No discordId provided in rate limiter:", req.ip);
        return 0;
      }

      const discordId = authorizationHeader.split(" ")[1];

      const redisStoredWalletAddr = await redisClient.hGet(`proposalCreationLimiter:${discordId}`, 'userWalletAddress');
      const redisStoredIsAdmin = await redisClient.hGet(`proposalCreationLimiter:${discordId}`, 'isAdmin');

      if(!redisStoredWalletAddr && !redisStoredIsAdmin){
        const {data:memberData}= await supabaseConfig.from('dao_members').select('userWalletAddress, isAdmin').eq('discord_member_id', Number(discordId)).single();

        if(!memberData || !memberData.userWalletAddress){
          return 0;
        }
        await redisClient.hSet(`proposalCreationLimiter:${discordId}`, 'userWalletAddress', memberData.userWalletAddress);
        await redisClient.hSet(`proposalCreationLimiter:${discordId}`, 'isAdmin', `${memberData.isAdmin}`);

        const userTokens = await governorTokenContract.getVotes(memberData.userWalletAddress);

        if(memberData.isAdmin){
               return 100; // Admins can create 100 proposals per week
        }
        if(Math.floor(Number(userTokens) / Number(19e24)) >= 0.01){
            return 10 // Non-members can create up to 5 proposals
        }

        if(Math.floor(Number(userTokens) / Number(19e24)) < 0.01 && Math.floor(Number(userTokens) / Number(19e24)) >= 0.005){
            return 5;// Members with less than 0.1 tokens can create up to 5 proposals
        }

      }
      if(redisStoredWalletAddr && redisStoredIsAdmin){

        const userTokens = await governorTokenContract.getVotes(redisStoredWalletAddr);


        if(redisStoredIsAdmin === 'true'){
          return 100; // Admins can create 100 proposals per week
        }


          if(Math.floor(Number(userTokens) / Number(19e24)) >= 0.01){
            
            return 10 // Non-members can create up to 5 proposals
        }
  
        if(Math.floor(Number(userTokens) / Number(19e24)) < 0.01
     && Math.floor(Number(userTokens) / Number(19e24)) >= 0.005
     ){
    
            return 5;// Members with less than 0.1 tokens can create up to 5 proposals
        }

      }

      return 0;

    }, //
    message: async (req:Request, res:Response) => {
      const redisStoredWalletAddr = await redisClient.hGet(`proposalCreationLimiter:${req.params.memberDiscordId}`, 'userWalletAddress');
      const redisStoredIsAdmin = await redisClient.hGet(`proposalCreationLimiter:${req.params.memberDiscordId}`, 'isAdmin');
      const redisStoredCalledTimes = await redisClient.get(`proposalCreationLimiter:${req.params.memberDiscordId}:calledTimes`);
      if(!redisStoredWalletAddr && !redisStoredIsAdmin && !redisStoredCalledTimes){
        const {data:memberData}= await supabaseConfig.from('dao_members').select('userWalletAddress, isAdmin').eq('discord_member_id', Number(req.params.memberDiscordId)).single();
        if(!memberData || !memberData.userWalletAddress){
          
            return {'error': 'You are not a DAO member, please join the DAO to create proposals.'};
        }

        await redisClient.hSet(`proposalCreationLimiter:${req.params.memberDiscordId}`, 'userWalletAddress', memberData.userWalletAddress); 
        await redisClient.hSet(`proposalCreationLimiter:${req.params.memberDiscordId}`, 'isAdmin', `${memberData.isAdmin}`);
        await redisClient.setEx(`proposalCreationLimiter:${req.params.memberDiscordId}:calledTimes`, 7 * 24 * 60 * 60, '1');

        const userTokens = await governorTokenContract.getVotes(memberData.userWalletAddress);
        if(Math.floor(Number(userTokens) / Number(19e24)) >= 0.01 ){
           
            return {'error': 'You can create up to 10 proposals per week.', data:null, status:429};
        }

        if(Math.floor(Number(userTokens) / Number(19e24)) < 0.01
    && Math.floor(Number(userTokens) / Number(19e24)) >= 0.005){

            return {'error': 'You can create up to 5 proposals per week. Sorry Baby !', data:null, status:429};
        }

        if(memberData.isAdmin){
      
            return {'error': 'Admins can create up to 100 proposals per week. No more mate', data:null, status:429};
        }
        return;
      }

      if(redisStoredWalletAddr && redisStoredIsAdmin){
        const userTokens = await governorTokenContract.getVotes(redisStoredWalletAddr);
        if(redisStoredIsAdmin === 'true'){
      
          return {'error': 'Admins can create up to 100 proposals per week.', data:null, status:429};
        }

            if(Math.floor(Number(userTokens) / Number(19e24)) >= 0.01){
            return {'error': 'You can create up to 10 proposals per week.', data:null, status:429};
        }

        if(Math.floor(Number(userTokens) / Number(19e24)) < 0.01
    && Math.floor(Number(userTokens) / Number(19e24)) >= 0.005){

    
            return {'error': 'You can create up to 5 proposals per week.', data:null, status:429};
        }
      }
    },

    statusCode: 429,
    standardHeaders:'draft-8',
  identifier: async (req: Request, res: any) => {
  try {
    const authorizationHeader= req.headers.authorization;

    if (!authorizationHeader) {
      console.warn("No discordId provided in rate limiter:", req.ip);
      return `no-discord-${req.ip}`;
    }
    const discordId = authorizationHeader.split(" ")[1]; // Assuming the format is "Bearer

    // Optional: add basic validation
    const parsedDiscordId = Number(discordId);
    if (isNaN(parsedDiscordId)) {
      console.warn("Invalid discordId in rate limiter:", discordId);
      return `invalid-discord-${req.ip}`;
    }

    const { data: memberData, error } = await supabaseConfig
      .from("dao_members")
      .select("userWalletAddress, isAdmin")
      .eq("discord_member_id", parsedDiscordId)
      .single();

    if (error) {
      console.error("Supabase rate limiter error:", error.message);
      return `supabase-error-${req.ip}`;
    }

    if (memberData.userWalletAddress) {
      return `web3builders-dao-dapp-${memberData.userWalletAddress}`;
    }

    // Fallback if member not found
    return `unknown-member-${req.ip}`;
  } catch (err: any) {
    console.error("Rate limiter identifier crashed:", err.message);
    return `error-${req.ip}`;
  }
},
}
);


export { rateLimiter, proposalCreationLimiter, rewardUserLimiter, punishUserLimiter };