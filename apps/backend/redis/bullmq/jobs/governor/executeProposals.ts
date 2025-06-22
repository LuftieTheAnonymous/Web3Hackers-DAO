import  pLimit  from 'p-limit';
import { daoContract, provider } from "../../../../config/ethersConfig.js";
import retry from 'async-retry';
import { ProposalEventArgs } from "../../../../controllers/GovernanceController.js";
import { ethers } from 'ethers';

 export   const executeProposals = async () => {
        try{
    const lastBlock = await provider.getBlockNumber();
    const filters = daoContract.filters.ProposalQueued();

    const events = await daoContract.queryFilter(filters, lastBlock - 499, lastBlock);
     console.log(events.map((event) => (event as ProposalEventArgs).args[0]),'events to execute');
     const limit = pLimit(5);


const receipts =events.map(async (event) => {
    console.log((event as ProposalEventArgs).args[0], 'execute proposal');
     return await limit(async () => {
       return  await retry(async ()=>{
try{
  const proposal = await daoContract.getProposal((event as ProposalEventArgs).args[0]); 
                if(Number(proposal.state) === 5){
                    const tx = await daoContract.executeProposal((event as ProposalEventArgs).args[0], {
                        maxPriorityFeePerGas: ethers.parseUnits("3", "gwei"),
     maxFeePerGas: ethers.parseUnits("10000", "gwei"),
                    });
            
                    const txReceipt = await tx.wait();

                            return { success: true, proposalId: proposal.id, receipt:txReceipt, proposal };
                }

                return { success: false, proposalId:(event as ProposalEventArgs).args[0] , receipt: null, proposal };
      
}catch(err){
    console.log(err);
    return { success: false, proposalId:(event as ProposalEventArgs).args[0] , receipt: null };
}
            }, {
            retries: 5,
            maxTimeout: 1 * 1000 * 3600, // 1 hour
            onRetry(err, attempt) {
                console.log(`Retrying... Attempt ${attempt} due to error: ${err}`);
            }
            })
     });
        });


        const receiptsResults = await Promise.allSettled(receipts);
        console.log(receiptsResults, "executed proposals");

        if(!receiptsResults || receiptsResults.length === 0){
             return {data:null, error:"No proposals to execute", message:"error", status:404};
        }

            return {message:"success", status:200, data:receipts, error:null};
        }
    catch(error){
        return {message:"error", status:500, data:null, error};
    }
}
