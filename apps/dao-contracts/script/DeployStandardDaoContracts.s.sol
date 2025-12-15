// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;
import {Script} from "../lib/forge-std/src/Script.sol";

import {CustomBuilderGovernor} from "../src/governor/interaction-contracts/CustomGovernor.sol";

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
govTokenManager = new TokenManager(address(govToken));

// Gives all the rights to be called by the smart-contract
govToken.transferGranterRole(address(govTokenManager));


standardGovernor = new StandardGovernor(address(govToken));
vm.stopBroadcast();

return(standardGovernor, govToken, govTokenManager);
    }

}