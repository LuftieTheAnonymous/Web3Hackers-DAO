import { ethers } from "ethers";
import { daoContract, provider } from "../../../../config/ethersConfig.js";
import pLimit from 'p-limit';
import { ProposalEventArgs } from "../../../../controllers/GovernanceController.ts";

export const activateProposals = async () => {
  try {

                 const lastBlock = await provider.getBlockNumber();
         const filters = daoContract.filters.ProposalCreated(); 
     
     const events = await daoContract.queryFilter(filters, lastBlock - 499, lastBlock);
         console.log(events.map((event) => (event as ProposalEventArgs).args[0]),'events to activate');

    if (!events || events.length === 0) {
return { data: null, error: "No proposals found", message: "error", status: 404 };
    }

    const limit = pLimit(5); // Run max 5 activations at a time

    const tasks = events.map((event) =>{
        return limit(async () => {
      try {
        const proposal = await daoContract.getProposal((event as ProposalEventArgs).args[0]);


        const isNotOpenYet = new Date().getTime() >= (Number(proposal.startBlockTimestamp) * 1000) && Number(proposal.state) === 0;


        if (isNotOpenYet) {
          const tx = await daoContract.activateProposal(proposal.id, {
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

    console.log(tasks, "Activated proposals");


    const results = await Promise.allSettled(tasks);

    console.log(results, "Activated proposals");

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
