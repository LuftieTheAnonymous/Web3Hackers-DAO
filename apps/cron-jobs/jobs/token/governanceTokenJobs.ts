import { CronJob } from "cron";

export const monthlyContributionJob = new CronJob("* * * */1 *", async () => {
    try{
            console.log('monthlyContributionJob is running');
    const response =  await fetch('http://localhost:2137/gov_token/monthly_token_distribution');
    const data = await response.json();

    console.log(" Token Distribution Data", data, "Token Distribution Data");
    }catch(e){
        console.log(e);
    }
},()=>{
    console.log('monthlyContributionJob is completed');
});