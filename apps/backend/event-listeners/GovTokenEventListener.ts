import { governorTokenContract } from "../config/ethersConfig.js";


    // Notify user of events for (Web push notifications, discord, etc.)

    // Every time an user is punished and this event is mostly likely to be called every 1 hours
    // Because of the proposal execution cron-job every 1 hours
export const executeGovenorTokenEvents=()=>{
governorTokenContract.on("UserPunished", async (args:any) => {

    // Implement the feature that will take the receiver Id and will notify him
    // with web-push notification about the punishment
    console.log("User Punished Triggered");
    console.log("Arguments: ", args);
});

// Every time an user is rewarded and this event is mostly likely to be called every 1 hours.
governorTokenContract.on("UserRewarded", async (args:any) => {

    // Implement the feature that will take the receiver Id and will notify him
    // with web-push notification about the reward


    console.log("User Rewarded Triggered");
    console.log("Arguments: ", args);
});

governorTokenContract.on("InitialTokensReceived", async (args:any) => {
    
    console.log("Initial Tokens Received Triggered");
    console.log("Arguments: ", args);
});

governorTokenContract.on('UserReceivedMonthlyDistribution', (args:any) => {
try{
        console.log("UserReceivedMonthlyDistribution Triggered");
    console.log("Arguments: ", args);
}catch(err){
    console.log(err);
}
});
}