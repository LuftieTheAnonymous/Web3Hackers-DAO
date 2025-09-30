import { ethers } from "ethers";
import { daoContract, provider } from "../../../../config/ethersConfig.js";
import { ProposalEventArgs } from "../../../../controllers/GovernanceController.js";
import retry from 'async-retry';
import pLimit from 'p-limit';

export const finishProposals= async () => {
    try{
        
     const lastBlock = await provider.getBlockNumber();
     const filters = daoContract.filters.ProposalActivated();

     const events = await daoContract.queryFilter(filters, lastBlock - 499, lastBlock);

     console.log(events.map((event) => (event as ProposalEventArgs).args[0])
        ,'events to finish');

     const limit = pLimit(5);

const list= events.map(async (event) =>{
        const proposal = await daoContract.getProposal((event as ProposalEventArgs).args[0]);
     return {
        proposal,
        isReadyToFinish: (Number(proposal.endBlockTimestamp) * 1000) <= new Date().getTime(),
        isReadyToExecuteSucceed: (Number(proposal.endBlockTimestamp) * 1000) <= new Date().getTime() && Number(proposal.state) === 1,
        
 }
     });

     const results=Promise.allSettled(list);

 const receipts =  events.map(async (event) => {
    return limit(async ()=>{
              return  await retry(async ()=>{
try{
    const proposal = await daoContract.getProposal((event as ProposalEventArgs).args[0]);
    const statement= (Number(proposal[4]) * 1000) <= new Date().getTime() && Number(proposal[6]) === 1;
        if(statement){
            const tx = await daoContract.succeedProposal((event as ProposalEventArgs).args[0],{
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
            proposalEndTimestamp:Number(proposal.endBlockTimestamp) * 1000,
            runDate: new Date().getTime(),
            isRunDate: new Date().getTime() >=
            Number(proposal.endBlockTimestamp) * 1000,
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
            maxTimeout: 1 * 1000 * 3600, // 1 hour
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
        console.log(err);
        return {data:null, error:err, message:"success", status:200};
     }
    }
