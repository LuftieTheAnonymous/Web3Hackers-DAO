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
govToken = GovernmentToken(0x4A739c8710Feb7c4Db9b964661b7e7D415d0cA79);
standardGovernor = StandardGovernor(0xb21D9b279e9aE5F971A0c020Cb0E4bCe54059283);
customGovernor = CustomBuilderGovernor(0x3cd3744C296Cc93CD981b4EFF5891aA391E36C4d);
vm.startBroadcast();
govTokenManager = new TokenManager(0x4A739c8710Feb7c4Db9b964661b7e7D415d0cA79
     ,0xb21D9b279e9aE5F971A0c020Cb0E4bCe54059283,
   0x3cd3744C296Cc93CD981b4EFF5891aA391E36C4d,
0x7789884c5c88AE84775F266045b96fD6Cb5C734b);
 

standardGovernor.setTokenManager(address(govTokenManager));
customGovernor.setTokenManager(address(govTokenManager));
govToken.transferGranterRole(address(govTokenManager));
vm.stopBroadcast();

return(govTokenManager);
    }

}