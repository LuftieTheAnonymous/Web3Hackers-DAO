import { daoContract } from "../config/ethers.config";
import dotenv from "dotenv";
import { supabaseConfig } from "../config/supabase";
import {format, formatDistanceStrict} from "date-fns";
import { notifyOnProposalCreated } from "./actions/governor/governor-actions";

dotenv.config();


export const executeGovenorContractEvents=()=>{

        daoContract.on("ProposalCreated", async (proposalId) => {
        console.log("Proposal Created triggered", proposalId);

        const proposal = await daoContract.getProposal(proposalId);

        const {data:memberData} = await supabaseConfig.from('dao_members').select('*').eq('userWalletAddress', proposal[1]).single();

        if(!memberData){
            throw new Error("Member not found");
        }
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
     
        await notifyOnProposalCreated(`A new proposal has been created by ${memberData.nickname} ! Now the voting period starts within ${formatDistanceStrict(new Date(Number(proposal[3]) * 1000), new Date())} (${format(new Date(Number(proposal[3]) * 1000),'dd/MM/yyyy')}) !`);


    // Trigger the web-push notification
    });

    daoContract.on("ProposalActivated", async (args) => {
        console.log("Proposal Activated triggered");
        console.log("Arguments: ", args);
    });

    daoContract.on("ProposalSucceeded", async (args) => {
        console.log("Proposal Succeeded triggered");
        console.log("Arguments: ", args);
    });

    daoContract.on("ProposalCanceled", async (args) => {
        console.log("Proposal Canceled event triggered");
        console.log("Arguments: ", args);
    });
    
    daoContract.on("ProposalQueued", async (args) => {
        console.log("Proposal Queued triggered");
        console.log("Arguments: ", args);
    });
    

    
    daoContract.on("ProposalExecuted", async (args) => {
        console.log("Transfer event triggered");
        console.log("Arguments: ", args);
    });
    
}
