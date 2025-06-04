import { Request } from 'express';
import rateLimit, { MemoryStore } from 'express-rate-limit';
import { supabaseConfig } from '../config/supabase.js';
import { governorTokenContract } from '../config/ethersConfig.js';
import dotenv from 'dotenv';
dotenv.config();

const cronJobsActionsLimiter = rateLimit({
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
        res.status(200).send({message: 'Rate limit applied successfully.', header: `web3builders-dao-dapp-${headerAuthorizationValue}`, status: 200});
        return `web3builders-dao-dapp-${headerAuthorizationValue}`;
        
       }catch(err){
        console.error("Rate limiter keyGenerator error:", err);
        res.status(500).send({error: 'Internal Server Error', message: 'An error occurred while processing your request.'});
        return `${req.ip}`;
       }
    },
});

const proposalCreationLimiter= rateLimit({
    windowMs: 7 * 24 * 60 * 60 * 1000, 
    limit: async(req, res)=>{
       const {data:memberData}= await supabaseConfig.from('dao_members').select('userWalletAddress, isAdmin').eq('discord_member_id', Number(req.params.discordId)).single();

       if(!memberData || !memberData.userWalletAddress){
          return 0;
       }

       const userTokens = await governorTokenContract.getVotes(memberData.userWalletAddress);

       if(memberData.isAdmin){
              return 100; // Admins can create 100 proposals per week
       }

       if(Math.floor(Number(userTokens) / Number(19e24)) >= 0.01){
           return 7 // Non-members can create up to 5 proposals
       }

       if(Math.floor(Number(userTokens) / Number(19e24)) < 0.01
    && Math.floor(Number(userTokens) / Number(19e24)) >= 0.005
    ){
           return 2;// Members with less than 0.1 tokens can create up to 5 proposals
       }

  return 0;
    }, //
    message: async (req:Request, res:Response) => {
        const {data:memberData}= await supabaseConfig.from('dao_members').select('userWalletAddress, isAdmin').eq('discord_member_id', Number(req.params.discordId)).single();
        if(!memberData || !memberData.userWalletAddress){
            return {'error': 'You are not a DAO member, please join the DAO to create proposals.'};
        }
        const userTokens = await governorTokenContract.getVotes(memberData.userWalletAddress);
        if(Math.floor(Number(userTokens) / Number(19e24)) >= 0.01){
            return {'error': 'You can create up to 7 proposals per week.'};
        }

        if(Math.floor(Number(userTokens) / Number(19e24)) < 0.01
    && Math.floor(Number(userTokens) / Number(19e24)) >= 0.005){
            return {'error': 'You can create up to 2 proposals per week.'};
        }

        if(memberData.isAdmin){
            return {'error': 'Admins can create up to 100 proposals per week.'};
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
keyGenerator: (req: Request, res)=> {
    const authorizationHeader = req.params.discordId;
    if (!authorizationHeader) {
      console.warn("No discordId provided in rate limiter:", req.ip);
      return `${req.ip}`;
    }
    return authorizationHeader;
  },
  
}
);


export { cronJobsActionsLimiter, proposalCreationLimiter };