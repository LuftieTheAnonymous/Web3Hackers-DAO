import { ethers } from "ethers";
import { daoContract } from "../../../../config/ethersConfig.js";
import pLimit from 'p-limit';
import { supabaseConfig } from "../../../../config/supabase.js";

export const activateProposals = async () => {
  try {
    const { data } = await supabaseConfig.from('dao_proposals').select('*');

    if (!data || data.length === 0) {
return { data: null, error: "No proposals found", message: "error", status: 404 };
    }

    const limit = pLimit(5); // Run max 5 activations at a time

    const tasks = (data as any[]).map((event) =>{
        return limit(async () => {
      try {
        const proposal = await daoContract.getProposal(event.proposal_id);

        const deadline = Number(proposal.startBlockTimestamp) * 1000;

        const isNotOpenYet = new Date().getTime() >= deadline && Number(proposal.state) === 0


        if (isNotOpenYet) {
          const tx = await daoContract.activateProposal(proposal.id, {
              maxPriorityFeePerGas: ethers.parseUnits("3", "gwei"),
  maxFeePerGas: ethers.parseUnits("100000", "gwei"),
          });
          const receipt = await tx.wait();
          return { success: true, proposalId: proposal.id, receipt };
        } 

        return { success: false, proposalId: proposal.id, message: "Proposal already activated or not ready", isNotOpenYet };

       
      } catch (err) {
        console.error(`Error activating proposal ${event.proposal_id}:`, err);
        return { success: false, proposalId: event.proposal_id, error: err };
      }
    })
    });

    const results = await Promise.allSettled(tasks);

    const summary = results.map((result) =>
      result.status === 'fulfilled' ? result.value : { success: false, error: result.reason }
    );

    console.log(summary, "Activated proposals");

return  { message: "Done", data: summary, status: 200 };
  } catch (error) {
    console.error(error);
     return { message: "Internal error", error, status: 500 };
  }
};
