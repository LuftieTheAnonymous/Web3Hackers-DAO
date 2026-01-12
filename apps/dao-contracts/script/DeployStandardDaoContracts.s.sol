// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;
import {Script} from "../lib/forge-std/src/Script.sol";
import {StandardGovernor} from "../src/governor/interaction-contracts/StandardGovernor.sol";

contract DeployStandardGovernor
is Script {
    StandardGovernor standardGovernor;

    function run() public returns(StandardGovernor){
vm.startBroadcast();
standardGovernor = new StandardGovernor(0xfa02019e4eeD6a41CbbE52C5C7e6904C18633B85);
vm.stopBroadcast();

return(standardGovernor);
    }

}