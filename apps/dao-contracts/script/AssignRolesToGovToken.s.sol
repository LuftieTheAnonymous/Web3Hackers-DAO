// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;
import {Script} from "../lib/forge-std/src/Script.sol";

import {CustomBuilderGovernor} from "../src/governor/interaction-contracts/CustomGovernor.sol";
import {StandardGovernor} from "../src/governor/interaction-contracts/StandardGovernor.sol";
import {GovernmentToken} from "../src/GovToken.sol";
import {IVotes} from "../lib/openzeppelin-contracts/contracts/governance/utils/IVotes.sol";

contract DeployDaoContracts is Script {
    GovernmentToken govToken;

function run() public {
govToken= GovernmentToken(0xfa02019e4eeD6a41CbbE52C5C7e6904C18633B85);
vm.startBroadcast();
govToken.grantManageRole(0x1DE0A7584B2C916f95ec3654Bd816627CDcb0782);
govToken.grantManageRole(0x9a60c99430C1BeA43b0235923469CcCF587d53Ed);
govToken.grantManageRole(0x7789884c5c88AE84775F266045b96fD6Cb5C734b);
vm.stopBroadcast();
    }

}