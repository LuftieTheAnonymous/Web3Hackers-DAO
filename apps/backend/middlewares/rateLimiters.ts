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
    message: {'error': 'Too many requests mate, please try again later. You have utilized your punish limit (5) in the last 15 minutes.'},
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
    windowMs:  1000 * 60 * 60 * 24 * 7, 
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
        await redisClient.hSet(`proposalCreationLimiter:${discordId}`, 'calledTimes', 1);

           const userTokens = await governorTokenContract.getVotes(redisStoredWalletAddr);

           const currentCirculation = await governorTokenContract.totalSupply();

        const percentagePower= Number(Number(userTokens) / currentCirculation);

        console.log(userTokens, 'Redis no data');
        console.log(percentagePower, 'percentagePower');

        if(memberData.isAdmin && percentagePower >= 0.005){
               return 100; // Admins can create 100 proposals per week
        }
        if(percentagePower >= 0.01){
            return 10 // Non-members can create up to 5 proposals
        }

        if(percentagePower < 0.01 && percentagePower >= 0.005){
            return 5;// Members with less than 0.1 tokens can create up to 5 proposals
        }

        return 0;
      }
   

        const userTokens = await governorTokenContract.getVotes(redisStoredWalletAddr);

         const currentCirculation = await governorTokenContract.totalSupply();

        const percentagePower= Number(Number(userTokens) / Number(currentCirculation));

    console.log(userTokens, 'Redis no data');
        console.log(percentagePower, 'percentagePower');

  
        if(percentagePower < 0.01 && percentagePower >= 0.005
     ){
    
            return 5;// Members with less than 0.1 tokens can create up to 5 proposals
        }

        
          if(percentagePower >= 0.01){
            
            return 10 // Non-members can create up to 5 proposals
        }

                if(redisStoredIsAdmin === 'true'  && percentagePower >= 0.005){
          return 100; // Admins can create 100 proposals per week
        }


      return 0;

    }, //
    message: (req:any, res:any) => {

      console.log(req.rateLimit);

    if(req.rateLimit.limit === 100 && req.rateLimit.remaining === 0){
      return {'error': 'Too many requests mate, please try again later. Admins have proposal creation limit (100) in the last 7 days.'};
    }
    if(req.rateLimit.limit === 10 && req.rateLimit.remaining === 0){
      return {'error': 'Too many requests mate, please try again later. Members with a more than 1% of tokens have proposal creation limit (10) in the last 7 days.'};
    }

    if(req.rateLimit.limit === 5 && req.rateLimit.remaining === 0){
      return {'error': 'Too many requests mate, please try again later. Members with less than 1% of tokens have proposal creation limit (5) in the last 7 days.'};
    }

      return {'error': 'Too many requests mate, please try again later. You have utilized your proposal creation limit (1) in the last 7 days.'};
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
  
      return `web3builders-dao-dapp-${parsedDiscordId}`;
    
  } catch (err: any) {
    console.error("Rate limiter identifier crashed:", err.message);
    return `error-${req.ip}`;
  }
},
validate:{'limit':true }
}
);


export { rateLimiter, proposalCreationLimiter, rewardUserLimiter, punishUserLimiter };