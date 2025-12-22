// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;
import {Script} from "../lib/forge-std/src/Script.sol";
import {GovernmentToken} from "../src/GovToken.sol";

contract DeployToken
is Script {
    GovernmentToken govToken;
 
    function run() public returns(GovernmentToken){
vm.startBroadcast();
govToken = new GovernmentToken();

vm.stopBroadcast();

return(govToken);
    }

}