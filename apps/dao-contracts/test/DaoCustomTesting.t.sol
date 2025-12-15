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

address user = makeAddr("user");

function setUp() public {
deployContract = new DeployCustomDaoContracts();
(customGovernor, govToken, tokenManager)=deployContract.run();
}


}