// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;
import {Script} from "../lib/forge-std/src/Script.sol";

import {CustomBuilderGovernor} from "../src/governor/interaction-contracts/CustomGovernor.sol";
import {StandardGovernor} from "../src/governor/interaction-contracts/StandardGovernor.sol";
import {GovernmentToken} from "../src/GovToken.sol";
import {TokenManager} from "../src/TokenManager.sol";
import {IVotes} from "../lib/openzeppelin-contracts/contracts/governance/utils/IVotes.sol";

contract DeployDaoContracts
is Script {
    TokenManager govTokenManager;
    StandardGovernor standardGovernor;
    CustomBuilderGovernor customGovernor;
    GovernmentToken govToken;

    function run() public returns(TokenManager){
govToken = GovernmentToken(0xfa02019e4eeD6a41CbbE52C5C7e6904C18633B85);
standardGovernor = StandardGovernor(0x1DE0A7584B2C916f95ec3654Bd816627CDcb0782);
customGovernor = CustomBuilderGovernor(0x9a60c99430C1BeA43b0235923469CcCF587d53Ed);
vm.startBroadcast();
govTokenManager = new TokenManager(0xfa02019e4eeD6a41CbbE52C5C7e6904C18633B85
     ,0x1DE0A7584B2C916f95ec3654Bd816627CDcb0782,
   0x9a60c99430C1BeA43b0235923469CcCF587d53Ed,
0x7789884c5c88AE84775F266045b96fD6Cb5C734b);
 

standardGovernor.setTokenManager(address(govTokenManager));
customGovernor.setTokenManager(address(govTokenManager));
govToken.transferGranterRole(address(govTokenManager));
vm.stopBroadcast();

return(govTokenManager);
    }

}