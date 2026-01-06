// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;
import {Script} from "../lib/forge-std/src/Script.sol";

import {CustomBuilderGovernor} from "../src/governor/interaction-contracts/CustomGovernor.sol";
import {GovernmentToken} from "../src/GovToken.sol";
import {IVotes} from "../lib/openzeppelin-contracts/contracts/governance/utils/IVotes.sol";

contract DeployCustomGovernor is Script {
    CustomBuilderGovernor customGovernor;

    function run() public returns(CustomBuilderGovernor){
vm.startBroadcast();

customGovernor = new CustomBuilderGovernor(0xED2e40049d809fFaC24b66B613d0F15BCf1146D1);

vm.stopBroadcast();

return(customGovernor);
    }

}