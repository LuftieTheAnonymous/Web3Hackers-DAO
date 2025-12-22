// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;
import {Script} from "../lib/forge-std/src/Script.sol";
import {StandardGovernor} from "../src/governor/interaction-contracts/StandardGovernor.sol";

contract DeployStandardGovernor
is Script {
    StandardGovernor standardGovernor;

    function run() public returns(StandardGovernor){
vm.startBroadcast();
standardGovernor = new StandardGovernor(0x20BFD783d19Ef960991eF27404c8D890Dd57205E);
vm.stopBroadcast();

return(standardGovernor);
    }

}