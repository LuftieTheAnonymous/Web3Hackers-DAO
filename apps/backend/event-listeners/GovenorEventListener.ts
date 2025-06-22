import { daoContract } from "../config/ethersConfig.js";
import dotenv from "dotenv";
import {format, formatDistanceStrict} from "date-fns";
import { notifyDAOMembersOnEvent } from "./actions/governor/governor-actions.js";


dotenv.config();


export const executeGovenorContractEvents=()=>{

daoContract.on("ProposalCreated", async (proposalId) => {
        try{
            console.log("Proposal Created triggered", proposalId);

            
            const proposal = await daoContract.getProposal(proposalId);
        
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
                      url:`http://localhost:3000/proposal/${proposalId}`,
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

            const proposal = await daoContract.getProposal(id);

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
                      url:`http://localhost:3000/proposal/${proposal.id}`,
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
    });

daoContract.on("ProposalCanceled", async (args) => {
      try{
          console.log("Proposal Canceled Event Triggered");
          
          const id = args[0];

          const proposal = await daoContract.getProposal(id);

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
                      url:`http://localhost:3000/proposal/${proposal.id}`,
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
    });

daoContract.on("ProposalQueued", async (args) => {
        try{
            console.log("Proposal Queued triggered");
            console.log("Arguments: ", args);
            const id = args[0];

            const proposal = await daoContract.getProposal(id);


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
                      url:`http://localhost:3000/proposal/${proposal.id}`,
                    }
                  ]
                },
        
                
         
          ]
        }),
                });


        }catch(err){
       console.error(err);
        }
    });


daoContract.on("ProposalExecuted", async (id) => {
        try{
            const proposal = await daoContract.getProposal(id);


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
                      url:`http://localhost:3000/proposal/${proposal.id}`,
                    }
                  ]
                },
        
                
         
          ]
        }),
                });



            console.log("Execution event triggered");
            await notifyDAOMembersOnEvent(`The Proposal (id: ${id}) has been executed. The proposal is not going to be voted !`, 'notifyOnExecution');
        }catch(err){
            console.error(err);
        }

    });
}
