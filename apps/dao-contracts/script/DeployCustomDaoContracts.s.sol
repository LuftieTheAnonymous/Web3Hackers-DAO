// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;
import {Script} from "../lib/forge-std/src/Script.sol";

import {CustomBuilderGovernor} from "../src/governor/interaction-contracts/CustomGovernor.sol";
import {GovernmentToken} from "../src/GovToken.sol";
import {TokenManager} from "../src/TokenManager.sol";
import {IVotes} from "../lib/openzeppelin-contracts/contracts/governance/utils/IVotes.sol";

contract DeployCustomDaoContracts
is Script {
    GovernmentToken govToken;
    CustomBuilderGovernor customGovernor;
    TokenManager govTokenManager;

    function run() public returns(CustomBuilderGovernor, GovernmentToken, TokenManager){
vm.startBroadcast();
govToken = new GovernmentToken();
customGovernor = new CustomBuilderGovernor(address(govToken));
govTokenManager = new TokenManager(address(govToken), address(customGovernor), vm.envAddress("BOT_ADDRESS"));


govToken.grantManageRole(address(customGovernor));
govToken.grantManageRole(vm.envAddress("BOT_ADDRESS"));
govToken.transferGranterRole(address(govTokenManager));
// Gives all the rights to be called by the smart-contract

vm.stopBroadcast();

return(customGovernor, govToken, govTokenManager);
    }

}