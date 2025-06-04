import { daoContract, provider } from "../../../../config/ethersConfig.js";
import retry from 'async-retry';
import { ProposalEventArgs } from "../../../../controllers/GovernanceController.js";

 export   const executeProposals = async () => {
        try{

             const lastBlock = await provider.getBlockNumber();
     const filters = daoContract.filters.ProposalQueued(); 
 
 const events = await daoContract.queryFilter(filters, lastBlock - 499, lastBlock);

 console.log(events);


const receipts =events.map(async (event) => {
     return  await retry(async ()=>{
              return Promise.resolve((async()=>{
  const proposal = await daoContract.getProposal((event as ProposalEventArgs).args[0]); 
                if(Number(proposal[6]) === 5){
                    const tx = await daoContract.executeProposal((event as ProposalEventArgs).args[0]);
                    console.log(tx);
            
                    const txReceipt = await tx.wait();
                    console.log(txReceipt);
            
                }
              }))
            }, {
            retries: 5,
            maxTimeout: 1 * 1000 * 3600, // 1 hour
            onRetry(err, attempt) {
                console.log(`Retrying... Attempt ${attempt} due to error: ${err}`);
            }
            });
        });

        const receiptsResults = await Promise.all(receipts);
        console.log(receiptsResults);

        if(!receiptsResults || receiptsResults.length === 0){
             return {data:null, error:"No proposals to execute", message:"error", status:404};
        }

            return {message:"success", status:200, data:receipts, error:null};
        }
    catch(error){
        return {message:"error", status:500, data:null, error};
    }
}
