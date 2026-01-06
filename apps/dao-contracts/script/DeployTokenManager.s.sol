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
govToken = GovernmentToken(0xED2e40049d809fFaC24b66B613d0F15BCf1146D1);
standardGovernor = StandardGovernor(0xE682A456ea074772f00Fa094a10C159101294e51);
customGovernor = CustomBuilderGovernor(0xD3107b0bAA0AF3eDB00d58e85276a79e1C337B47);
vm.startBroadcast();
govTokenManager = new TokenManager(0xED2e40049d809fFaC24b66B613d0F15BCf1146D1
     ,0xE682A456ea074772f00Fa094a10C159101294e51,
   0xD3107b0bAA0AF3eDB00d58e85276a79e1C337B47,
0x7789884c5c88AE84775F266045b96fD6Cb5C734b);
 

standardGovernor.setTokenManager(address(govTokenManager));
customGovernor.setTokenManager(address(govTokenManager));
govToken.transferGranterRole(address(govTokenManager));
vm.stopBroadcast();

return(govTokenManager);
    }

}