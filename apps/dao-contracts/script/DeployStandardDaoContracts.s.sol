// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;
import {Script} from "../lib/forge-std/src/Script.sol";
import {StandardGovernor} from "../src/governor/interaction-contracts/StandardGovernor.sol";

contract DeployStandardGovernor
is Script {
    StandardGovernor standardGovernor;

    function run() public returns(StandardGovernor){
vm.startBroadcast();
standardGovernor = new StandardGovernor(0x4A739c8710Feb7c4Db9b964661b7e7D415d0cA79);
vm.stopBroadcast();

return(standardGovernor);
    }

}