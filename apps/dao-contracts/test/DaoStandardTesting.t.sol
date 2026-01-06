// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {GovernorBase} from "../src/governor/GovernorBase.sol";
import {StandardGovernor} from "../src/governor/interaction-contracts/StandardGovernor.sol";
import {GovernmentToken} from "../src/GovToken.sol";
import {TokenManager} from "../src/TokenManager.sol";
import {DeployTestingContracts} from "../script/test/DeployDaoContracts.s.sol";
import {Test, console} from "../lib/forge-std/src/Test.sol";
import "../lib/openzeppelin-contracts/contracts/utils/Strings.sol";
contract DaoTesting is Test {
StandardGovernor standardGovernor;
GovernmentToken govToken;
TokenManager tokenManager;
DeployTestingContracts deployContract;

uint256 sepoliaEthFork;
address user = makeAddr("user");
address user2 = makeAddr("user2");
address validBotAddress = 0x7789884c5c88AE84775F266045b96fD6Cb5C734b;

function setUp() public {
sepoliaEthFork=vm.createSelectFork("ETH_ALCHEMY_SEPOLIA_RPC_URL");
deployContract = new DeployTestingContracts();
(standardGovernor,, govToken, tokenManager)=deployContract.run();

vm.makePersistent(validBotAddress);
}

function testGranterRole() public view {

assert(govToken.hasRole(govToken.GRANTER_ROLE(), address(tokenManager)) == true);
assert(govToken.hasRole(govToken.MANAGE_ROLE(), msg.sender) == true);
assert(govToken.hasRole(govToken.MANAGE_ROLE(), user) != true);
}


function getVoucherSignature(
address receiver,
string memory isAdmin,
uint256 psrLevel,
uint256 jexsLevel,
uint256 tklLevel,
uint256 web3Level,
uint256 kvtrLevel

) public returns (bytes memory, uint256){
    uint256 expiryTime = block.number + 350;

    string[] memory inputs = new string[](12);
    inputs[0] = "npx";
    inputs[1]="tsx";
    inputs[2] = "../test-ts-scripts/generateSignedTx.ts";
    inputs[3]= Strings.toHexString(address(tokenManager));
    inputs[4] = Strings.toHexString(receiver);
    inputs[5] = isAdmin;
    inputs[6] = Strings.toString(psrLevel);
    inputs[7] = Strings.toString(jexsLevel);
    inputs[8]  = Strings.toString(tklLevel);
    inputs[9] = Strings.toString(web3Level);
    inputs[10] = Strings.toString(kvtrLevel);
    inputs[11] = Strings.toString(expiryTime);

bytes memory result = vm.ffi(inputs);
(bytes memory signature) = abi.decode(result, (bytes));

return (signature, expiryTime);
}


function testRevertAddressZeroCases() public {
    vm.startPrank(validBotAddress);
// Does not have right to revoke the role
vm.expectRevert();
govToken.revokeManageRole(address(0));

// Address zero is forbidden to be added
vm.expectRevert();
govToken.addBlacklist(address(0));

vm.expectRevert();
govToken.addToWhitelist(address(0));
vm.stopPrank();
}

function testRevertArbitaryUserCallingWhiteListBlacklist() public{
// No Arbitrary people can call add to whitelist or blacklist

    vm.expectRevert();
govToken.addToWhitelist(user);

vm.expectRevert();
govToken.addBlacklist(user);
}


function testCannotMintOverSupplyLimit() public {

    vm.prank(validBotAddress);
    vm.expectRevert();
    govToken.mint(user, 21e24 + 1);

    vm.prank(validBotAddress);
    govToken.addToWhitelist(user);

// No calls from arbitrary people (even people with tokens)
vm.prank(user);
vm.expectRevert();
govToken.mint(user2, 1e18);

vm.prank(user);
vm.expectRevert();
govToken.burn(user2, 1e18);

vm.prank(user);
vm.expectRevert();
govToken.mint(user2, 1e18);
}


function testReceiveInitialTokensAndRevertCases() public {

vm.prank(validBotAddress);
govToken.addToWhitelist(user);

(bytes memory signature, uint256 expiryBlock) = getVoucherSignature(user, "false", 0, 0, 0, 0, 0);

vm.startPrank(user);
TokenManager.Voucher memory voucherFlawed = TokenManager.Voucher(
        user,
        expiryBlock,
        true,
        0,
        0,
        0,
        0,
        0
    );

vm.expectRevert();
tokenManager.handInUserInitialTokens(voucherFlawed, signature);

TokenManager.Voucher memory voucherCorrect = TokenManager.Voucher(
        user,
        expiryBlock,
        false,
        0,
        0,
        0,
        0,
        0
    );

// Successfull tokens handin

tokenManager.handInUserInitialTokens(voucherCorrect, signature);

// Cannot delegate to not whitelisted member
vm.expectRevert();
govToken.delegate(msg.sender);

// Get punished for handing in tokens once again
// ⚠️ If anyone can call this function it can lead that someone gets an hash of signed-tx and multiple times 
// And drains the wallet
// ✅ Fixed by punishing to preventing user from reentrancy and turned to revert
vm.expectRevert();
tokenManager.handInUserInitialTokens(voucherCorrect, signature);


vm.stopPrank();


(bytes memory signature2, uint256 expiryBlock2) = getVoucherSignature(msg.sender, "true", 2, 0, 2, 2, 4);
TokenManager.Voucher memory voucherCorrect2 = TokenManager.Voucher(
        msg.sender,
        expiryBlock2,
        true,
        2,
        0,
        2,
        2,
        4
    );

vm.prank(validBotAddress);
govToken.addToWhitelist(msg.sender);

// THis
vm.prank(msg.sender);
tokenManager.handInUserInitialTokens(voucherCorrect2, signature2);

assert(govToken.balanceOf(msg.sender) > govToken.balanceOf(user));
}


function testCreateProposalAndVotingWorkflow() public {

(bytes memory signature, uint256 expiryBlock) = getVoucherSignature(user, "false", 0, 0, 0, 0, 0);

vm.prank(validBotAddress);
govToken.addToWhitelist(user);

vm.startPrank(user);
TokenManager.Voucher memory voucher = TokenManager.Voucher(
        user,
        expiryBlock,
        false,
        0,
        0,
        0,
        0,
        0
    );

tokenManager.handInUserInitialTokens(voucher, signature);

govToken.delegate(user);

// Sets invalid data for proposal execution call
address[] memory targets = new address[](1);
bytes[] memory byteCodeData= new bytes[](1);

targets[0]=address(tokenManager); 
byteCodeData[0]= abi.encodeWithSignature("rewarrUser(address,uint256)", user, 15e18);

// Cannot casr vote on a proposal that does not exist
vm.expectRevert();
standardGovernor.castVote(0, 'Reason so', StandardGovernor.StandardProposalVote(0));

// Arithmetic error or invalid timelock
vm.expectRevert();
bytes32 proposalIdFlawed1 = standardGovernor.createStandardProposal("This proposal is to first vote", targets, byteCodeData, GovernorBase.UrgencyLevel(0), block.number + 3000, 7201, 300);

vm.expectRevert();
bytes32 proposalIdFlawed2 = standardGovernor.createStandardProposal("This proposal is to first vote", targets, byteCodeData, GovernorBase.UrgencyLevel(0), block.number + 3000, 600, 7200);

// Create a valid proposal
bytes32 proposalId = standardGovernor.createStandardProposal("This proposal is to first vote", targets, byteCodeData, GovernorBase.UrgencyLevel(0), block.number + 3000, 450, 300);

// Revert because the voting has not been activated
vm.expectRevert();
standardGovernor.castVote(proposalId, "Because I like this option", StandardGovernor.StandardProposalVote.Yes);

// Cannot activate because time has not passed
vm.expectRevert();
standardGovernor.activateProposal(proposalId);

GovernorBase.Proposal memory proposal =standardGovernor.getProposal(proposalId);

// Successfull vote cast after activation

vm.roll(proposal.startBlockNumber);
standardGovernor.activateProposal(proposalId);

standardGovernor.castVote(proposalId, "Because I like this option", StandardGovernor.StandardProposalVote.Yes);

// Cannot cast vote again
vm.expectRevert();
standardGovernor.castVote(proposalId, "Because I like this option", StandardGovernor.StandardProposalVote.Abstain);

// Get Proposals' informations
standardGovernor.getStandardProposalVotes(proposalId);
standardGovernor.getProposalVotes(proposalId);
standardGovernor.getProposalCount();
standardGovernor.getProposalThreshold();

// Cannot call succeed or queue 
vm.expectRevert();
standardGovernor.succeedProposal(proposalId);


vm.expectRevert();
standardGovernor.queueProposal(proposalId);


// Succeed and queue the proposal as it reaches 
vm.roll(proposal.endBlockNumber);
standardGovernor.succeedProposal(proposalId);

standardGovernor.queueProposal(proposalId);

// Cannot execute proposal until lock time is passed
vm.expectRevert();
standardGovernor.executeProposal(proposalId);

// gets called
vm.roll(block.number + proposal.timelockBlockNumber);
standardGovernor.executeProposal(proposalId);
vm.stopPrank();

}

function testCreateProposalAndVotingWorkflowWihoutCallback() public {

(bytes memory signature, uint256 expiryBlock) = getVoucherSignature(user, "false", 0, 0, 0, 0, 0);

vm.prank(validBotAddress);
govToken.addToWhitelist(user);

vm.startPrank(user);
TokenManager.Voucher memory voucher = TokenManager.Voucher(
        user,
        expiryBlock,
        false,
        0,
        0,
        0,
        0,
        0
    );

tokenManager.handInUserInitialTokens(voucher, signature);

govToken.delegate(user);

// Sets invalid data for proposal execution call
address[] memory targets;
bytes[] memory byteCodeData;

// Create a valid proposal
bytes32 proposalId = standardGovernor.createStandardProposal("This proposal is to first vote", targets, byteCodeData, GovernorBase.UrgencyLevel(0), block.number + 3000, 450, 300);

GovernorBase.Proposal memory proposal=standardGovernor.getProposal(proposalId);

// Successfull vote cast after activation

vm.roll(proposal.startBlockNumber);
standardGovernor.activateProposal(proposalId);

standardGovernor.castVote(proposalId, "Because I like this option", StandardGovernor.StandardProposalVote.Yes);

// Succeed and queue the proposal as it reaches 
vm.roll(proposal.endBlockNumber);
standardGovernor.succeedProposal(proposalId);

standardGovernor.queueProposal(proposalId);

// Cannot execute proposal until lock time is passed
vm.expectRevert();
standardGovernor.executeProposal(proposalId);

// gets called
vm.roll(block.number + proposal.timelockBlockNumber);
standardGovernor.executeProposal(proposalId);
vm.stopPrank();

}



function testSuccessfullCallToExternal() public {

(bytes memory signature, uint256 expiryBlock) = getVoucherSignature(user, "false", 0, 0, 0, 0, 0);

vm.prank(validBotAddress);
govToken.addToWhitelist(user);

vm.startPrank(user);
TokenManager.Voucher memory voucher = TokenManager.Voucher(
        user,
        expiryBlock,
        false,
        0,
        0,
        0,
        0,
        0
    );

tokenManager.handInUserInitialTokens(voucher, signature);

govToken.delegate(user);

address[] memory targets = new address[](3);
bytes[] memory byteCodeData= new bytes[](3);

targets[0]=address(govToken); 
byteCodeData[0]= abi.encodeWithSignature("addBlacklist(address)", validBotAddress);
targets[1]= address(tokenManager);
byteCodeData[1] = abi.encodeWithSignature("rewardUser(address,uint256)", user, 1e18);
targets[2]= address(tokenManager);
byteCodeData[2] = abi.encodeWithSignature("rewardUser(address,uint256)", user, 1e18);

bytes32 proposalId2 = standardGovernor.createStandardProposal("This proposal is to first vote", targets, byteCodeData, GovernorBase.UrgencyLevel(0), block.number + 3000, 450, 300);

GovernorBase.Proposal memory proposal = standardGovernor.getProposal(proposalId2);

vm.roll(proposal.startBlockNumber);
standardGovernor.activateProposal(proposalId2);

vm.expectRevert();
standardGovernor.activateProposal(proposalId2);

standardGovernor.castVote(proposalId2, "Because I like this option", StandardGovernor.StandardProposalVote.Yes);


vm.stopPrank();

vm.prank(user2);
vm.expectRevert();
standardGovernor.cancelProposal(proposalId2);


vm.startPrank(user);

vm.roll(proposal.endBlockNumber);
standardGovernor.succeedProposal(proposalId2);

vm.expectRevert();
standardGovernor.castVote(proposalId2, "Because I like this option", StandardGovernor.StandardProposalVote.Abstain);

standardGovernor.queueProposal(proposalId2);

vm.expectRevert();
standardGovernor.executeProposal(proposalId2);

vm.roll(block.number + proposal.timelockBlockNumber);
standardGovernor.executeProposal(proposalId2);


vm.stopPrank();
}


function testDelegateToOtherMember() public {

(bytes memory signature, uint256 expiryBlock) = getVoucherSignature(user, "false", 0, 0, 0, 0, 0);

vm.prank(validBotAddress);
govToken.addToWhitelist(user);

vm.startPrank(user);
TokenManager.Voucher memory voucher = TokenManager.Voucher(
        user,
        expiryBlock,
        false,
        0,
        0,
        0,
        0,
        0
    );

tokenManager.handInUserInitialTokens(voucher, signature);

address[] memory targets = new address[](0);
bytes[] memory byteCodeData= new bytes[](0);

govToken.delegate(user);

bytes32 proposalId2 = standardGovernor.createStandardProposal("This proposal is to first vote", targets, byteCodeData, GovernorBase.UrgencyLevel(0), block.number + 3000, 450, 300);

GovernorBase.Proposal memory proposal = standardGovernor.getProposal(proposalId2);

vm.roll(proposal.startBlockNumber);
standardGovernor.activateProposal(proposalId2);
vm.stopPrank();

vm.prank(user);
vm.expectRevert();
govToken.delegate(user2);

vm.prank(validBotAddress);
govToken.addToWhitelist(user2);

vm.prank(user);
govToken.delegate(user2);

vm.prank(user2);
vm.expectRevert();
standardGovernor.castVote(proposalId2, "Because I like this option", StandardGovernor.StandardProposalVote.Yes);

vm.prank(user);
govToken.delegate(user);

vm.prank(user);
standardGovernor.castVote(proposalId2, "Because I like this option", StandardGovernor.StandardProposalVote.Yes);


govToken.getVotes(user2);



}



function testKickoutFromDao() public {

vm.expectRevert();
govToken.addToWhitelist(user);

vm.expectRevert();
govToken.addBlacklist(user);


vm.prank(validBotAddress);
govToken.addToWhitelist(user);

(bytes memory signature, uint256 expiryBlock) = getVoucherSignature(user, "false", 0, 0, 0, 0, 0);

vm.startPrank(user);

TokenManager.Voucher memory voucherCorrect = TokenManager.Voucher(
        user,
        expiryBlock,
        false,
        0,
        0,
        0,
        0,
        0
    );

tokenManager.handInUserInitialTokens(voucherCorrect, signature);

vm.stopPrank();

vm.expectRevert();
tokenManager.kickOutFromDAO(user);

vm.prank(validBotAddress);
govToken.addToWhitelist(user);

vm.prank(validBotAddress);
tokenManager.kickOutFromDAO(user);

}

function testRemoveOnLeave() public {

vm.prank(validBotAddress);
govToken.addToWhitelist(user);
(bytes memory signature, uint256 expiryBlock) = getVoucherSignature(user, "false", 0, 0, 0, 0, 0);


TokenManager.Voucher memory voucherCorrect = TokenManager.Voucher(
        user,
        expiryBlock,
        false,
        0,
        0,
        0,
        0,
        0
    );

tokenManager.handInUserInitialTokens(voucherCorrect, signature);


vm.prank(validBotAddress);
vm.expectRevert();
tokenManager.rewardMonthlyTokenDistribution(25, 145, 12, 1, 5, 5, 13, user2);

vm.prank(user2);
vm.expectRevert();
tokenManager.rewardMonthlyTokenDistribution(25, 145, 12, 1, 5, 5, 13, user2);
    
vm.prank(validBotAddress);
tokenManager.rewardMonthlyTokenDistribution(25, 145, 12, 1, 5, 5, 13, user);
vm.prank(validBotAddress);
vm.expectRevert();
tokenManager.rewardMonthlyTokenDistribution(25, 145, 12, 1, 5, 5,13, user);

vm.prank(user);
vm.expectRevert();
tokenManager.burnTokensOnLeave(user);

vm.prank(validBotAddress);
tokenManager.burnTokensOnLeave(user);

}

function testReadInfluence() public {
govToken.readMemberInfluence(user);
govToken.nonces(user);

vm.prank(validBotAddress);
vm.expectRevert();
govToken.removeFromBlacklist(user);

vm.prank(validBotAddress);
vm.expectRevert();
govToken.burn(user, 1e18);

vm.prank(address(tokenManager));
vm.expectRevert();
govToken.grantManageRole(address(0));
}

}