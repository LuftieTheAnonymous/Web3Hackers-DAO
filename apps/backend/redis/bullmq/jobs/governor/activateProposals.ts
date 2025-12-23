import { ethers } from "ethers";
import { standardGovernorContract, provider } from "../../../../config/ethersConfig.js";
import pLimit from 'p-limit';
import { ProposalEventArgs } from "../../../../controllers/GovernanceController.js";

export const activateProposals = async () => {
  try {
        const lastBlock = await provider.getBlockNumber();
         const filters = standardGovernorContract.filters.ProposalCreated(); 
     
     const events = await standardGovernorContract.queryFilter(filters, lastBlock - 9, lastBlock);
        

    if (!events || events.length === 0) {
return { data: null, error: "No proposals found", message: "error", status: 404 };
    }

    const limit = pLimit(10); 

    const tasks = events.map((event) =>{
        return limit(async () => {
      try {
        const proposal = await standardGovernorContract.getProposal((event as ProposalEventArgs).args[0]);


        const isNotOpenYet = new Date().getTime() >= (Number(proposal.startBlockTimestamp) * 1000) && Number(proposal.state) === 0;


        if (isNotOpenYet) {
          const tx = await standardGovernorContract.activateProposal(proposal.id, {
              maxPriorityFeePerGas: ethers.parseUnits("3", "gwei"),
  maxFeePerGas: ethers.parseUnits("10000", "gwei"),
          });
          const receipt = await tx.wait();
          return { success: true, proposalId: proposal.id, receipt };
        } 

        return { success: false, proposalId: proposal.id, message: "Proposal already activated or not ready", isNotOpenYet };

       
      } catch (err) {
        console.error(`Error activating proposal ${(event as ProposalEventArgs).args[0]}:`, err);
        return { success: false, proposalId: (event as ProposalEventArgs).args[0], error: err };
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
