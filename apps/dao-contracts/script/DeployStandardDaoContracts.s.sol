// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;
import {Script} from "../lib/forge-std/src/Script.sol";
import {StandardGovernor} from "../src/governor/interaction-contracts/StandardGovernor.sol";

contract DeployStandardGovernor
is Script {
    StandardGovernor standardGovernor;

    function run() public returns(StandardGovernor){
vm.startBroadcast();
standardGovernor = new StandardGovernor(0xED2e40049d809fFaC24b66B613d0F15BCf1146D1);
vm.stopBroadcast();

return(standardGovernor);
    }

}