import { Contract } from "ethers";
import { notifyDAOMembersOnEvent } from "./governor-actions.js";
import redisClient from "../../../redis/set-up.js";
import {format} from "date-fns";
import {formatDistanceStrict} from "date-fns/formatDistanceStrict"

const onCreateProposal= async (proposalId:string, targetContract:Contract)=>{
            try{
                console.log("Proposal Created triggered", proposalId);
    
                
                const proposal = await targetContract.getProposal(proposalId);
            
                 await fetch(`https://discord.com/api/webhooks/${process.env.DISCORD_WEBHOOK_ID}/${process.env.DISCORD_WEBHOOK_TOKEN}?with_components=true`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                       content: `# New Proposal Announcement 📣 !\n A new proposal has been created ! Now the voting period starts within ${formatDistanceStrict(new Date(Number(proposal[3]) * 1000), new Date())} (${format(new Date(Number(proposal[3]) * 1000),'dd/MM/yyyy')}) !`,
              "components": [
                  {
                      "type": 1,
                      "components": [
                        {
                          "type": 2,
                          "label": "View Proposal",
                          "style": 5,
                          url:`${process.env.FRONTEND_ENDPOINT_1 as string}/proposal/${proposalId}`,
                        }
                      ]
                    },
            
                    
             
              ]
            }),
                    });
                 
                    await notifyDAOMembersOnEvent(`A new proposal has been created ! Now the voting period starts within ${formatDistanceStrict(new Date(Number(proposal.startBlockTimestamp) * 1000), new Date())} (${format(new Date(Number(proposal.startBlockTimestamp) * 1000),'dd/MM/yyyy')}) !`, 'notifyOnNewProposals');
    
    
    
            }catch(err){
                console.error(err);
            }
    
        }

const onActivatedProposal = async (proposalId:string, targetContract:Contract) => {
        console.log("Proposal Created triggered", proposalId);

        const proposal = await targetContract.getProposal(proposalId);

        


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
              url:`${process.env.FRONTEND_ENDPOINT_1 as string}/proposal/${proposalId}`,
            }
]
        },
]
}),
        });
        await notifyDAOMembersOnEvent(`The Proposal has been activated ! Now the voting period starts until ${formatDistanceStrict(new Date(Number(proposal.endBlockTimestamp) * 1000), new Date())} (${format(new Date(Number(proposal.endBlockTimestamp) * 1000),'dd/MM/yyyy')}) !`, 'notifyOnVote');


    }

const onProposalSucceeded= async (id:string, targetContract:Contract) => {
try{
    console.log("Proposal Succeeded triggered", id);

            const proposal = await targetContract.getProposal(id);

    await fetch(`https://discord.com/api/webhooks/${process.env.DISCORD_WEBHOOK_ID}/${process.env.DISCORD_WEBHOOK_TOKEN}?with_components=true`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                   content: `# The Proposal Succeeded 🎉 !\n The Proposal (${proposal.id}) has succeeded ! Now the queue period started and ${formatDistanceStrict(new Date(Number(proposal.endBlockTimestamp) * 1000), new Date())} (${format(new Date((Number(proposal.endBlockTimestamp) + Number(proposal.timelock)) * 1000),'dd/MM/yyyy')}) !`,
          "components": [
              {
                  "type": 1,
                  "components": [
                    {
                      "type": 2,
                      "label": "View Proposal",
                      "style": 5,
                      url:`${process.env.FRONTEND_ENDPOINT_1 as string}/proposal/${proposal.id}`,
                    }
                  ]
                },
        
                
         
          ]
        }),
                });

      

await notifyDAOMembersOnEvent(`The Proposal (id: ${id}) has been Succeeded ! Now wait until it is queued to be executed !`, 'notifyOnSuccess');
}catch(err){

    console.error(err);
}
    }

const onProposalCanceled= async (args:any, targetContract:Contract) => {
      try{
          console.log("Proposal Canceled Event Triggered");
          
          const id = args[0];

          const proposal = await targetContract.getProposal(id);

           await fetch(`https://discord.com/api/webhooks/${process.env.DISCORD_WEBHOOK_ID}/${process.env.DISCORD_WEBHOOK_TOKEN}?with_components=true`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                   content: `# The Proposal Canceled 🚫 !\n The Proposal (${proposal.id}) has been canceled ! It won't be no longer procedured.`,
          "components": [
              {
                  "type": 1,
                  "components": [
                    {
                      "type": 2,
                      "label": "View Proposal",
                      "style": 5,
                      url:`${process.env.FRONTEND_ENDPOINT_1 as string}/proposal/${proposal.id}`,
                    }
                  ]
                },
        
                
         
          ]
        }),
                });

await notifyDAOMembersOnEvent(`The Proposal (id: ${id}) has been Canceled. The proposal is not going to be voted !`, 'notifyOnCancel');
      }catch(err){
        console.error(err);
      }
    }

const onProposalQueued= async (args:any, targetContract:Contract) => {
        try{
            console.log("Proposal Queued triggered");
            console.log("Arguments: ", args);
            const id = args[0];

            const proposal = await targetContract.getProposal(id);


                await fetch(`https://discord.com/api/webhooks/${process.env.DISCORD_WEBHOOK_ID}/${process.env.DISCORD_WEBHOOK_TOKEN}?with_components=true`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                   content: `# Proposal Update 📌 !\n The Proposal (${proposal.id}) has been queued ! And it soon will be executed.`,
          "components": [
              {
                  "type": 1,
                  "components": [
                    {
                      "type": 2,
                      "label": "View Proposal",
                      "style": 5,
                      url:`${process.env.FRONTEND_ENDPOINT_1 as string}/proposal/${proposal.id}`,
                    }
                  ]
                },
        
                
         
          ]
        }),
                });


        }catch(err){
       console.error(err);
        }
    }


    const onProposalExecuted=async (id:string, targetContract:Contract) => {
        try{
            const proposal = await targetContract.getProposal(id);

                await fetch(`https://discord.com/api/webhooks/${process.env.DISCORD_WEBHOOK_ID}/${process.env.DISCORD_WEBHOOK_TOKEN}?with_components=true`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                   content: `# Proposal Update 📌 !\n The Proposal (${proposal.id}) has been successfully executed ! Now the result-decision is supposed to be executed.`,
          "components": [
              {
                  "type": 1,
                  "components": [
                    {
                      "type": 2,
                      "label": "View Proposal",
                      "style": 5,
                      url:`${process.env.FRONTEND_ENDPOINT_1 as string}/proposal/${proposal.id}`,
                    }
                  ]
                },
        
                
         
          ]
        }),
                });
                
                
    const redisStoredProposal = await redisClient.get(`dao_proposals:${id}`)
    
    if(redisStoredProposal){
    const parsedProposal = JSON.parse(redisStoredProposal);
await redisClient.hIncrBy(`activity:${parsedProposal.id}`,'proposals_accepted', 1);
await redisClient.del(`dao_proposals:${id}`);  
}


            console.log("Execution event triggered");
            await notifyDAOMembersOnEvent(`The Proposal (id: ${id}) has been executed. The proposal is not going to be voted !`, 'notifyOnExecution');
          }catch(err){
            console.error(err);
        }

    }


export {onCreateProposal, onActivatedProposal, onProposalSucceeded, onProposalCanceled, onProposalQueued, onProposalExecuted}