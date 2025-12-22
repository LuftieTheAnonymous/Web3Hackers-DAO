// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;
import {Script} from "../lib/forge-std/src/Script.sol";

import {CustomBuilderGovernor} from "../src/governor/interaction-contracts/CustomGovernor.sol";
import {StandardGovernor} from "../src/governor/interaction-contracts/StandardGovernor.sol";
import {GovernmentToken} from "../src/GovToken.sol";
import {IVotes} from "../lib/openzeppelin-contracts/contracts/governance/utils/IVotes.sol";

contract DeployDaoContracts
is Script {
    GovernmentToken govToken;


    function run() public {
govToken= GovernmentToken(0x20BFD783d19Ef960991eF27404c8D890Dd57205E);
vm.startBroadcast();
govToken.grantManageRole(0xE1A0a63297A9F1D8b5cdccbC5A1634090402BBC9);
govToken.grantManageRole(0x83282bB88D372580DADb403A01aF67a2b0110D81);
govToken.grantManageRole(0x7789884c5c88AE84775F266045b96fD6Cb5C734b);
vm.stopBroadcast();
    }

}