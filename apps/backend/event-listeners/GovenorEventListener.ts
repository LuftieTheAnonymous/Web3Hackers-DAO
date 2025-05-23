import { daoContract } from "../config/ethers.config";
import dotenv from "dotenv";
import { getMember } from '../controllers/MembersController';
import { supabaseConfig } from "../config/supabase";

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

    await fetch(`https://discord.com/api/webhooks/${process.env.DISCORD_WEBHOOK_ID}/${process.env.DISCORD_WEBHOOK_TOKEN}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: `A new proposal has been created by ${memberData.nickname}, proposalId: ${proposalId} ! Now there is a bit of time to activate the proposal ${((new Date((Number(proposal[3]) * 1000)).getTime() - new Date().getTime()) / 1000 * 60 * 60 * 24).toFixed(2)} day(s) left to start!`,
            }),
        });


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
