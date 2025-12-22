// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;
import {Script} from "../../lib/forge-std/src/Script.sol";
import {StandardGovernor} from "../../src/governor/interaction-contracts/StandardGovernor.sol";
import {CustomBuilderGovernor} from "../../src/governor/interaction-contracts/CustomGovernor.sol";
import {GovernmentToken} from "../../src/GovToken.sol";
import {TokenManager} from "../../src/TokenManager.sol";

contract DeployTestingContracts
is Script {
    GovernmentToken govToken;
    CustomBuilderGovernor customGovernor;
    StandardGovernor standardGovernor;
    TokenManager govTokenManager;

    function run() public returns(StandardGovernor, CustomBuilderGovernor, GovernmentToken, TokenManager){
vm.startBroadcast();
govToken = new GovernmentToken();
standardGovernor = new StandardGovernor(address(govToken));
customGovernor = new CustomBuilderGovernor(address(govToken));
govTokenManager = new TokenManager(address(govToken), address(standardGovernor), address(customGovernor), 0x7789884c5c88AE84775F266045b96fD6Cb5C734b);

customGovernor.setTokenManager(address(govTokenManager));
standardGovernor.setTokenManager(address(govTokenManager));

govToken.grantManageRole(address(customGovernor));
govToken.grantManageRole(0x7789884c5c88AE84775F266045b96fD6Cb5C734b);
govToken.transferGranterRole(address(govTokenManager));
// Gives all the rights to be called by the smart-contract

vm.stopBroadcast();

return(standardGovernor, customGovernor, govToken, govTokenManager);
    }

}