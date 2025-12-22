// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {CustomBuilderGovernor} from "../src/governor/interaction-contracts/CustomGovernor.sol";
import {GovernorBase} from "../src/governor/GovernorBase.sol";
import {GovernmentToken} from "../src/GovToken.sol";
import {TokenManager} from "../src/TokenManager.sol";
import {DeployTestingContracts} from "../script/test/DeployDaoContracts.s.sol";
import {Test, console} from "../lib/forge-std/src/Test.sol";
import "../lib/openzeppelin-contracts/contracts/utils/Strings.sol";


contract DaoTesting is Test {
CustomBuilderGovernor customGovernor;
GovernmentToken govToken;
TokenManager tokenManager;
DeployTestingContracts deployContract;


address[] targets;
bytes[] byteCodeData;
CustomBuilderGovernor.Calldata[][] calldataArray =new CustomBuilderGovernor.Calldata[][](5);

uint256 sepoliaEthFork;
address user = makeAddr("user");
address user2 = makeAddr("user2");
address validBotAddress = 0x7789884c5c88AE84775F266045b96fD6Cb5C734b;

function setUp() public {
sepoliaEthFork=vm.createSelectFork("ETH_ALCHEMY_SEPOLIA_RPC_URL");
deployContract = new DeployTestingContracts();
(,customGovernor, govToken, tokenManager)=deployContract.run();

for (uint i = 0; i < calldataArray.length; i++) {
    calldataArray[i] = new CustomBuilderGovernor.Calldata[](1); // make inner arrays length 1
}


}

function testGovernorFunction() public {
uint256 urgencyLevel = customGovernor.getProposalCount();
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

function testCreateCustomProposalAndVotingWorkflow() public {
// Get the amount to
uint256 amountAnticipatedToBeReceived = tokenManager.getAnticipatedReward(12,42,26,23,346,35);

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

vm.expectRevert();
customGovernor.castVote(0, 'Reason so', (0));

calldataArray[0][0]=CustomBuilderGovernor.Calldata(address(tokenManager), abi.encodeWithSignature("rewardUser(address,uint256)", user, 15e18));
calldataArray[1][0]=CustomBuilderGovernor.Calldata(address(tokenManager), abi.encodeWithSignature("punishMember(address,uint256)", user, 15e18));

bytes32 proposalId = customGovernor.createCustomProposal("This proposal is to first vote", 
targets, byteCodeData, GovernorBase.UrgencyLevel(0), block.number + 3000, 450, 300,
calldataArray
);

vm.expectRevert();
customGovernor.castVote(proposalId, "Because I like this option", 0);

vm.expectRevert();
customGovernor.activateProposal(proposalId);

GovernorBase.Proposal memory proposal =customGovernor.getProposal(proposalId);
vm.roll(proposal.startBlockNumber);
customGovernor.activateProposal(proposalId);

vm.expectRevert();
customGovernor.castVote(proposalId, "Because I like this option", 5);

customGovernor.castVote(proposalId, "Because I like this option", 0);

customGovernor.getCustomProposalVotes(proposalId);
customGovernor.getProposalCount();
customGovernor.getProposalThreshold();


vm.expectRevert();
customGovernor.castVote(proposalId, "Because I like this option", 1);

vm.expectRevert();
customGovernor.succeedProposal(proposalId);

vm.expectRevert();
customGovernor.queueProposal(proposalId);

vm.roll(proposal.endBlockNumber);
customGovernor.succeedProposal(proposalId);

customGovernor.queueProposal(proposalId);

vm.expectRevert();
customGovernor.executeProposal(proposalId);

vm.roll(block.number + proposal.timelockBlockNumber);
customGovernor.executeProposal(proposalId);




vm.stopPrank();

vm.prank(validBotAddress);
govToken.addToWhitelist(msg.sender);

vm.prank(user);
govToken.delegate(msg.sender); 
vm.expectRevert();
bytes32 proposalId4 = customGovernor.createCustomProposal("This proposal is to first vote", targets, byteCodeData, GovernorBase.UrgencyLevel(0), block.number + 3000, 450, 300,calldataArray);


}


function testCreateCustomProposalAndVotingWorkflowWithoutCallback() public {
// Get the amount to
uint256 amountAnticipatedToBeReceived = tokenManager.getAnticipatedReward(12,42,26,23,346,35);

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

vm.expectRevert();
customGovernor.castVote(0, 'Reason so', (0));

bytes32 proposalId = customGovernor.createCustomProposal("This proposal is to first vote", 
targets, byteCodeData, GovernorBase.UrgencyLevel(0), block.number + 3000, 450, 300,
calldataArray
);

vm.expectRevert();
customGovernor.castVote(proposalId, "Because I like this option", 0);

vm.expectRevert();
customGovernor.activateProposal(proposalId);

GovernorBase.Proposal memory proposal =customGovernor.getProposal(proposalId);
vm.roll(proposal.startBlockNumber);
customGovernor.activateProposal(proposalId);

vm.expectRevert();
customGovernor.castVote(proposalId, "Because I like this option", 5);

customGovernor.castVote(proposalId, "Because I like this option", 0);

customGovernor.getCustomProposalVotes(proposalId);
customGovernor.getProposalCount();
customGovernor.getProposalThreshold();


vm.expectRevert();
customGovernor.castVote(proposalId, "Because I like this option", 1);

vm.expectRevert();
customGovernor.succeedProposal(proposalId);

vm.expectRevert();
customGovernor.queueProposal(proposalId);

vm.roll(proposal.endBlockNumber);
customGovernor.succeedProposal(proposalId);

customGovernor.queueProposal(proposalId);

vm.expectRevert();
customGovernor.executeProposal(proposalId);

vm.roll(block.number + proposal.timelockBlockNumber);
customGovernor.executeProposal(proposalId);




vm.stopPrank();

vm.prank(validBotAddress);
govToken.addToWhitelist(msg.sender);

vm.prank(user);
govToken.delegate(msg.sender); 
vm.expectRevert();
bytes32 proposalId4 = customGovernor.createCustomProposal("This proposal is to first vote", targets, byteCodeData, GovernorBase.UrgencyLevel(0), block.number + 3000, 450, 300,calldataArray);


}



function testInvalidByteCodeProvided() public {
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

calldataArray[0][0]=CustomBuilderGovernor.Calldata(address(tokenManager), abi.encodeWithSignature("rewaraUser(address,uint256)", user, 15e18));
bytes32 proposalId2 = customGovernor.createCustomProposal("This proposal is to first vote", targets, byteCodeData, GovernorBase.UrgencyLevel(0), block.number + 3000, 450, 300,
calldataArray
);
GovernorBase.Proposal memory proposal = customGovernor.getProposal(proposalId2);

vm.roll(proposal.startBlockNumber);
customGovernor.activateProposal(proposalId2);

customGovernor.castVote(proposalId2, "Because I like this option", 0);


vm.roll(proposal.endBlockNumber);
customGovernor.succeedProposal(proposalId2);

customGovernor.queueProposal(proposalId2);

vm.roll(block.number + proposal.timelockBlockNumber);
customGovernor.executeProposal(proposalId2);

    vm.stopPrank();
}


function testProposalNoOneVoted() public {
    (bytes memory signature, uint256 expiryBlock) = getVoucherSignature(user, "true", 0, 0, 0, 0, 0);
vm.prank(validBotAddress);
govToken.addToWhitelist(user);

vm.startPrank(user);
TokenManager.Voucher memory voucher = TokenManager.Voucher(
        user,
        expiryBlock,
        true,
        0,
        0,
        0,
        0,
        0
    );

tokenManager.handInUserInitialTokens(voucher, signature);

govToken.delegate(user);

calldataArray[0][0]=CustomBuilderGovernor.Calldata(address(tokenManager), abi.encodeWithSignature("rewardUser(address,uint256)", user, 15e18));
bytes32 proposalId3 = customGovernor.createCustomProposal("This proposal is to first vote", targets, byteCodeData, GovernorBase.UrgencyLevel(0), block.number + 3000, 450, 300,
calldataArray
);

GovernorBase.Proposal memory proposal = customGovernor.getProposal(proposalId3);

vm.roll(proposal.startBlockNumber);
customGovernor.activateProposal(proposalId3);


vm.roll(proposal.endBlockNumber);
customGovernor.succeedProposal(proposalId3);


vm.expectRevert();
customGovernor.queueProposal(proposalId3);
vm.stopPrank();
    
}


function testProposalNotEnoughQuorumRate() public {
vm.prank(validBotAddress);
govToken.addToWhitelist(user);


(bytes memory signature2, uint256 expiryBlock2) = getVoucherSignature(user2, "false", 0, 0, 0, 0, 0);
TokenManager.Voucher memory voucher2 = TokenManager.Voucher(
        user2,
        expiryBlock2,
        false,
        0,
        0,
        0,
        0,
        0
    );


vm.prank(validBotAddress);
govToken.addToWhitelist(user2);

vm.roll(expiryBlock2 + 1);

vm.prank(user2);
vm.expectRevert();
tokenManager.handInUserInitialTokens(voucher2, signature2);

(bytes memory signature3, uint256 expiryBlock3) = getVoucherSignature(user2, "false", 0, 0, 0, 0, 0);
TokenManager.Voucher memory voucher3 = TokenManager.Voucher(
        user2,
        expiryBlock3,
        false,
        0,
        0,
        0,
        0,
        0
    );

vm.prank(user2);
tokenManager.handInUserInitialTokens(voucher3, signature3);

    (bytes memory signature, uint256 expiryBlock) = getVoucherSignature(user, "true", 0, 0, 0, 0, 0);

vm.startPrank(user);
TokenManager.Voucher memory voucher = TokenManager.Voucher(
        user,
        expiryBlock,
        true,
        0,
        0,
        0,
        0,
        0
    );

tokenManager.handInUserInitialTokens(voucher, signature);

govToken.delegate(user);

calldataArray[0][0]=CustomBuilderGovernor.Calldata(address(tokenManager), abi.encodeWithSignature("rewardUser(address,uint256)", user, 15e18));
bytes32 proposalId3 = customGovernor.createCustomProposal("This proposal is to first vote", targets, byteCodeData, GovernorBase.UrgencyLevel(0), block.number + 3000, 450, 300,
calldataArray
);

GovernorBase.Proposal memory proposal = customGovernor.getProposal(proposalId3);


vm.roll(proposal.startBlockNumber);
customGovernor.activateProposal(proposalId3);

vm.stopPrank();


vm.prank(user2);
vm.expectRevert();
customGovernor.castVote(proposalId3, "Hello", 1);


vm.prank(user2);
govToken.delegate(user2);

vm.prank(user2);
customGovernor.castVote(proposalId3, "Hello", 1);

vm.prank(user);
customGovernor.castVote(proposalId3, "XD", 0);

vm.roll(proposal.endBlockNumber);

vm.prank(user);
customGovernor.succeedProposal(proposalId3);

vm.prank(user);
vm.expectRevert();
customGovernor.queueProposal(proposalId3);
    
}


}