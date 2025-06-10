import { daoContract, provider } from "../../../../config/ethersConfig.js";
import retry from 'async-retry';
import { ProposalEventArgs } from "../../../../controllers/GovernanceController.js";
import pLimit from 'p-limit';

export const queueProposals = async () => {
try{
 const lastBlock = await provider.getBlockNumber();
     const filters = daoContract.filters.ProposalSucceeded();

     const events = await daoContract.queryFilter(filters, lastBlock - 499, lastBlock);

     const limit = pLimit(5);
 const receipts =    events.map(async (event) => {
    return limit(async ()=>{
return await retry(async ()=>{
try{
           const proposal = await daoContract.getProposal((event as ProposalEventArgs).args[0]);
        console.log(proposal);
        if(Number(proposal.state) === 4){
            const tx = await daoContract.queueProposal((event as ProposalEventArgs).args[0]);
            console.log(tx);
    
            const txReceipt = await tx.wait();
            return { success: true, proposalId: proposal.id, receipt:txReceipt};
          
        }
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
         

    })
    });

    const receiptsResults = await Promise.all(receipts);
    console.log(receiptsResults, "Queue Proposals");

    if(!receiptsResults || receiptsResults.length === 0){
         return {data:null, error:"No proposals to queue", message:"error", status:404};
    }

    return {data:receipts, error:null, message:"success", status:200};
    }
     catch(err){
        console.log(err);
        return {data:null, error:err, message:"error", status:500};
     }
    }