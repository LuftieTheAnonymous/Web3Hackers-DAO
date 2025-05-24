
import { CronJob } from "cron";


export const activateProposalsJob = new CronJob("* */15 * * *", async () => {
try{
      console.log('activateProposalJob is running');
    const response =  await fetch('http://localhost:2137/governance/activate_proposals');
  const data = await response.json();

  console.log('Activate Proposal Data');
  console.log(data);
  console.log('Activate Proposal Data');
}catch(e){
  console.log("error");
  console.log(e);
}
},()=>{
  console.log('activateProposalJob is completed');
});

export const queueProposalsJob= new CronJob("* */15 * * *", async () => {
  try{
    console.log('queueProposalJob is running');
  const response =  await fetch('http://localhost:2137/governance/queue_proposals');
  const data = await response.json();

    console.log('Queue Proposal Data');
  console.log(data);
  console.log('Queue Proposal Data');
  }catch(e){
    console.log(e);
  }
},()=>{
  console.log('queueProposalJob is completed');
});


export const executeProposalsJob= new CronJob("* */15 * * *", async () => {
try{
      console.log('executeProposalJob is running');
    const response =  await fetch('http://localhost:2137/governance/execute_proposals');
  const data = await response.json();

  console.log('Execute Proposal Data');
  console.log(data);
  console.log('Execute Proposal Data');
}catch(e){
  console.log(e);
}
},()=>{
            console.log('executeProposalJob is completed');
});
  

export const finishProposalsJob= new CronJob("* */15 * * *", async () => {
try{
      console.log('finishProposalJob is running');
    const response =  await fetch('http://localhost:2137/governance/finish_proposals');
  const data = await response.json();

    console.log('Finish Proposal Data');
  console.log(data);
      console.log('Finish Proposal Data');
}catch(e){
  console.log(e);
}
},()=>{
            console.log('finishProposalJob is completed');
});