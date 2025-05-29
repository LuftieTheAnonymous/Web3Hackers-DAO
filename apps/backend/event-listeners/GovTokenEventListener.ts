import { governorTokenContract } from "../config/ethersConfig";


    // Notify user of events for (Web push notifications, discord, etc.)

export const executeGovenorTokenEvents=()=>{
governorTokenContract.on("UserPunished", async (args:any) => {
    console.log("User Punished Triggered");
    console.log("Arguments: ", args);
});

governorTokenContract.on("UserRewarded", async (args:any) => {
    console.log("User Rewarded Triggered");
    console.log("Arguments: ", args);
});

governorTokenContract.on("InitialTokensReceived", async (args:any) => {
    console.log("Initial Tokens Received Triggered");
    console.log("Arguments: ", args);
});
}