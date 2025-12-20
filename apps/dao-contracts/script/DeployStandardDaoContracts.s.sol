// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;
import {Script} from "../lib/forge-std/src/Script.sol";


import {StandardGovernor} from "../src/governor/interaction-contracts/StandardGovernor.sol";
import {GovernmentToken} from "../src/GovToken.sol";
import {TokenManager} from "../src/TokenManager.sol";
import {IVotes} from "../lib/openzeppelin-contracts/contracts/governance/utils/IVotes.sol";

contract DeployStandardDaoContracts
is Script {
    GovernmentToken govToken;
    StandardGovernor standardGovernor;
    TokenManager govTokenManager;

    function run() public returns(StandardGovernor, GovernmentToken, TokenManager){
vm.startBroadcast();
govToken = new GovernmentToken();
standardGovernor = new StandardGovernor(address(govToken));
govTokenManager = new TokenManager(address(govToken), address(standardGovernor), vm.envAddress("BOT_ADDRESS"));

standardGovernor.setTokenManager(address(govTokenManager));

govToken.grantManageRole(address(standardGovernor));
govToken.grantManageRole(vm.envAddress("BOT_ADDRESS"));
govToken.transferGranterRole(address(govTokenManager));

vm.stopBroadcast();

return(standardGovernor, govToken, govTokenManager);
    }

}