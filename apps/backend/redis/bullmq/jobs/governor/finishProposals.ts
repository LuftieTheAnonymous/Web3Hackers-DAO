import { ethers } from "ethers";
import { standardGovernorContract, provider } from "../../../../config/ethersConfig.js";
import { ProposalEventArgs } from "../../../../controllers/GovernanceController.js";
import retry from 'async-retry';
import pLimit from 'p-limit';

export const finishProposals= async () => {
    try{
        
     const lastBlock = await provider.getBlockNumber();
     const filters = standardGovernorContract.filters.ProposalActivated();

     const events = await standardGovernorContract.queryFilter(filters, lastBlock - 9, lastBlock);

     const limit = pLimit(10);


 const receipts =  events.map(async (event) => {
    return limit(async ()=>{
              return  await retry(async ()=>{
try{
    const proposal = await standardGovernorContract.getProposal((event as ProposalEventArgs).args[0]);
    const statement= (Number(proposal.startBlock)) <= lastBlock - 9 && Number(proposal.state) === 1;
        if(statement){
            const tx = await standardGovernorContract.succeedProposal((event as ProposalEventArgs).args[0],{
                maxPriorityFeePerGas: ethers.parseUnits("3", "gwei"),
  maxFeePerGas: ethers.parseUnits("10000", "gwei"),
            });
    
            const txReceipt = await tx.wait();
        
        return { success: true, 
                  proposal,
            isReadyToExecuteSucceed:statement, proposalId: proposal.id, receipt:txReceipt };
        }

        return { success: false,
            state:proposal.state,
            proposalEndBlock:Number(proposal.endBlock),
            runDate: new Date().getTime(),
            isRunDate: lastBlock >=
            Number(proposal.endBlock) ,
            isReadyToExecuteSucceed:statement, proposalId: proposal.id, receipt: null };
}catch(err){
    console.log(err);
    return { success: false,
     error:err,
        isReadyToExecuteSucceed:false, proposalId:(event as ProposalEventArgs).args[0] , receipt: null 
   
    };
}
    }, {
            retries: 5,
            maxTimeout: 1000 * 30, // 2 minutes
            onRetry(err, attempt) {
                console.log(`Retrying... Attempt ${attempt} due to error: ${err}`);
            }
        })

        })
    });

    const receiptsResults = await Promise.allSettled(receipts);

    if(!receiptsResults || receiptsResults.length === 0){
return {data:null, error:"No proposals to finish", message:"error", status:404};
    }
    
    return {data:receiptsResults, error:null, message:"success", status:200};

    }
     catch(err){
        console.log("Error from finish proposals", err);
        return {data:null, error:err, message:"success", status:200};
     }
    }
