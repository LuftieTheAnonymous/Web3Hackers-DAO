import { daoContract } from "../config/ethersConfig.js";
import dotenv from "dotenv";
import { supabaseConfig } from "../config/supabase.js";
import {format, formatDistanceStrict} from "date-fns";
import { notifyDAOMembersOnEvent } from "./actions/governor/governor-actions.js";
import redisClient from "../redis/set-up.js";
import { getDatabaseElement } from "../db-actions.ts";
import { DaoMember } from "../types/graphql/TypeScriptTypes.ts";

dotenv.config();


export const executeGovenorContractEvents=()=>{

daoContract.on("ProposalCreated", async (proposalId) => {
        try{
            console.log("Proposal Created triggered", proposalId);

            
            const proposal = await daoContract.getProposal(proposalId);
            const redisStoredNickname= await redisClient.get(`${proposal[1]}:nickname`);

            if(!redisStoredNickname){
                const {data:memberData} = await getDatabaseElement<DaoMember>('dao_members', 'userWalletAddress', proposal[1]);
                
                if(!memberData){
                    throw new Error("Member not found");
                }

                await redisClient.set(`${proposal[1]}:nickname`, memberData.nickname);

                console.log("Proposal details", proposal, "Proposal", proposalId);
        
        
          await fetch(`https://discord.com/api/webhooks/${process.env.DISCORD_WEBHOOK_ID}/${process.env.DISCORD_WEBHOOK_TOKEN}?with_components=true`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                   content: `# New Proposal Announcement 📣 !\n A new proposal has been created by ${memberData.nickname} ! Now the voting period starts within ${formatDistanceStrict(new Date(Number(proposal[3]) * 1000), new Date())} (${format(new Date(Number(proposal[3]) * 1000),'dd/MM/yyyy')}) !`,
          "components": [
              {
                  "type": 1,
                  "components": [
                    {
                      "type": 2,
                      "label": "View Proposal",
                      "style": 5,
                      url:`http://localhost:3000/proposal/${proposalId}`,
                    }
                  ]
                },
        
                
         
          ]
        }),
                });
             
                await notifyDAOMembersOnEvent(`A new proposal has been created by ${memberData.nickname} ! Now the voting period starts within ${formatDistanceStrict(new Date(Number(proposal.startBlockTimestamp) * 1000), new Date())} (${format(new Date(Number(proposal.startBlockTimestamp) * 1000),'dd/MM/yyyy')}) !`, 'notifyOnNewProposals');
               
                return;
            }

             await fetch(`https://discord.com/api/webhooks/${process.env.DISCORD_WEBHOOK_ID}/${process.env.DISCORD_WEBHOOK_TOKEN}?with_components=true`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                   content: `# New Proposal Announcement 📣 !\n A new proposal has been created by ${redisStoredNickname} ! Now the voting period starts within ${formatDistanceStrict(new Date(Number(proposal[3]) * 1000), new Date())} (${format(new Date(Number(proposal[3]) * 1000),'dd/MM/yyyy')}) !`,
          "components": [
              {
                  "type": 1,
                  "components": [
                    {
                      "type": 2,
                      "label": "View Proposal",
                      "style": 5,
                      url:`http://localhost:3000/proposal/${proposalId}`,
                    }
                  ]
                },
        
                
         
          ]
        }),
                });
             
                await notifyDAOMembersOnEvent(`A new proposal has been created by ${redisStoredNickname} ! Now the voting period starts within ${formatDistanceStrict(new Date(Number(proposal.startBlockTimestamp) * 1000), new Date())} (${format(new Date(Number(proposal.startBlockTimestamp) * 1000),'dd/MM/yyyy')}) !`, 'notifyOnNewProposals');



        }catch(err){
            console.error(err);
        }

    });

daoContract.on("ProposalActivated", async (id) => {
        console.log("Proposal Created triggered", id);

        const proposal = await daoContract.getProposal(id);

  await fetch(`https://discord.com/api/webhooks/${process.env.DISCORD_WEBHOOK_ID}/${process.env.DISCORD_WEBHOOK_TOKEN}?with_components=true`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
           content: `# Proposal Activated 🔛 !\n Now the voting period starts now until ${formatDistanceStrict(new Date(Number(proposal.endBlockTimestamp) * 1000), new Date())} (${format(new Date(Number(proposal.endBlockTimestamp) * 1000),'dd/MM/yyyy')}) !`,
"components": [
      {
          "type": 1,
          "components": [
            {
              "type": 2,
              "label": "View Proposal",
              "style": 5,
              url:`http://localhost:3000/proposal/${id}`,
            }
]
        },
]
}),
        });
        await notifyDAOMembersOnEvent(`The Proposal has been activated ! Now the voting period starts until ${formatDistanceStrict(new Date(Number(proposal.endBlockTimestamp) * 1000), new Date())} (${format(new Date(Number(proposal.endBlockTimestamp) * 1000),'dd/MM/yyyy')}) !`, 'notifyOnVote');


    });

daoContract.on("ProposalSucceeded", async (id) => {
try{
    console.log("Proposal Succeeded triggered", id);

await notifyDAOMembersOnEvent(`The Proposal (id: ${id}) has been Succeeded ! Now wait until it is queued to be executed !`, 'notifyOnSuccess');
}catch(err){

    console.error(err);
}
    });

daoContract.on("ProposalCanceled", async (id) => {
      try{
          console.log("Proposal Canceled Event Triggered");

await notifyDAOMembersOnEvent(`The Proposal (id: ${id}) has been Canceled. The proposal is not going to be voted !`, 'notifyOnCancel');
      }catch(err){
        console.error(err);
      }
    });

daoContract.on("ProposalQueued", async (args) => {
        try{
            console.log("Proposal Queued triggered");
            console.log("Arguments: ", args);
        }catch(err){
       console.error(err);
        }
    });


daoContract.on("ProposalExecuted", async (id) => {
        try{
            console.log("Execution event triggered");
            await notifyDAOMembersOnEvent(`The Proposal (id: ${id}) has been executed. The proposal is not going to be voted !`, 'notifyOnExecution');
        }catch(err){
            console.error(err);
        }

    });
}
