import { daoContract, provider } from "../../../../config/ethersConfig.js";
import { ProposalEventArgs } from "../../../../controllers/GovernanceController.js";
import retry from 'async-retry';

export const finishProposals= async () => {
    try{
        
     const lastBlock = await provider.getBlockNumber();
     const filters = daoContract.filters.ProposalActivated();

     const events = await daoContract.queryFilter(filters, lastBlock - 499, lastBlock);

 const receipts =    events.map(async (event) => {
      return  await retry(async ()=>{
            return Promise.resolve(async()=>{
           const proposal = await daoContract.getProposal((event as ProposalEventArgs).args[0]);
        console.log(proposal);
        if(Number(proposal.state) === 1 && new Date(Number(proposal.endBlockTimestamp) * 1000).getTime() <= new Date().getTime()){
            const tx = await daoContract.succeedProposal(proposal.id);
    
    
            const txReceipt = await tx.wait();
return txReceipt
        }
     })
        },{
            retries: 5,
            maxTimeout: 1 * 1000 * 3600, // 1 hour
            onRetry(err, attempt) {
                console.log(`Retrying... Attempt ${attempt} due to error: ${err}`);
            }
        })
        


   
    });

    const receiptsResults = await Promise.all(receipts);

    console.log(receiptsResults, "finished proposals");
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
