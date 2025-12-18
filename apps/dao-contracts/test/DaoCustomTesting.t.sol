// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {CustomBuilderGovernor} from "../src/governor/interaction-contracts/CustomGovernor.sol";
import {GovernmentToken} from "../src/GovToken.sol";
import {TokenManager} from "../src/TokenManager.sol";
import {DeployCustomDaoContracts} from "../script/DeployCustomDaoContracts.s.sol";
import {Test, console} from "../lib/forge-std/src/Test.sol";

contract DaoTesting is Test {
CustomBuilderGovernor customGovernor;
GovernmentToken govToken;
TokenManager tokenManager;
DeployCustomDaoContracts deployContract;

uint256 sepoliaEthFork;
address user = makeAddr("user");
address validBotAddress = vm.envAddress("BOT_ADDRESS");

function setUp() public {
sepoliaEthFork=vm.createSelectFork("ETH_ALCHEMY_SEPOLIA_RPC_URL");
deployContract = new DeployCustomDaoContracts();
(customGovernor, govToken, tokenManager)=deployContract.run();
}

function testGovernorFunction() public {
uint256 urgencyLevel = customGovernor.getProposalCount();
}

}