import { tokenManagerContract } from "../config/ethersConfig.js";


    // Notify user of events for (Web push notifications, discord, etc.)

    // Every time an user is punished and this event is mostly likely to be called every 1 hours
    // Because of the proposal execution cron-job every 1 hours
export const executeGovenorTokenEvents=()=>{
tokenManagerContract.on("MemberPunished", async (args:any) => {
    console.log("Member Punished Triggered");
    console.log("Arguments: ", args);
});

// Every time an user is rewarded and this event is mostly likely to be called every 1 hours.
tokenManagerContract.on("MemberRewarded", async (args:any) => {
    console.log("Member Rewarded Triggered");
    console.log("Arguments: ", args);
});

tokenManagerContract.on("InitialTokensReceived", async (args:any) => {
    
    console.log("Initial Tokens Received Triggered");
    console.log("Arguments: ", args);
});

tokenManagerContract.on('MemberReceivedMonthlyDistribution', (args:any) => {
try{
        console.log("MemberReceivedMonthlyDistribution Triggered");
    console.log("Arguments: ", args);
}catch(err){
    console.log(err);
}
});
}