// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {CustomBuilderGovernor} from "../src/CustomGovernor.sol";
import {GovernmentToken} from "../src/GovToken.sol";
import {TokenManager} from "../src/TokenManager.sol";
import {DeployContract} from "../script/GovernanceContracts.s.sol";
import {Test, console} from "../lib/forge-std/src/Test.sol";
contract DaoTesting is Test {

CustomBuilderGovernor governor;
GovernmentToken govToken;
TokenManager tokenManager;
DeployContract deployContract;

address user = makeAddr("user");

function setUp() public {
deployContract = new DeployContract();
(governor, govToken, tokenManager)=deployContract.run();
}

function testGranterRole() public view {
assert(govToken.hasRole(govToken.GRANTER_ROLE(), address(tokenManager)) == true);
assert(govToken.hasRole(govToken.MANAGE_ROLE(), msg.sender) == true);
assert(govToken.hasRole(govToken.MANAGE_ROLE(), user) != true);
}

function testReadVariables() public {
}

function testRevertsUnelligible(uint256 amountMint) public {

vm.expectRevert();
govToken.mint(user, 1e18);

vm.startPrank(user);
vm.expectRevert();
govToken.burn(user, 0);
vm.stopPrank();

vm.prank(msg.sender);
govToken.addToWhitelist(user);

// Reverts because admin is not whitelisted
vm.startPrank(user);
vm.expectRevert();
tokenManager.kickOutFromDAO(msg.sender);
vm.stopPrank();

// Whitelist admin
vm.prank(msg.sender);
govToken.addToWhitelist(msg.sender);

vm.startPrank(user);
vm.expectRevert();
tokenManager.kickOutFromDAO(user);
vm.stopPrank();

// Revert 
vm.expectRevert();
tokenManager.rewardUser(user, amountMint);

}

function testClaimInitialTokensAndGetRewarded() public {
vm.startPrank(msg.sender);
govToken.addToWhitelist(user);
vm.stopPrank();

vm.prank(msg.sender);
tokenManager.handInUserInitialTokens(
TokenManager.TokenReceiveLevel.LOW,
TokenManager.TokenReceiveLevel.LOW, 
TokenManager.TechnologyKnowledgeLevel.HIGHER_LOW_KNOWLEDGE, 
TokenManager.TokenReceiveLevel.LOW, 
TokenManager.KnowledgeVerificationTestRate.LOW,
user
);


}

}