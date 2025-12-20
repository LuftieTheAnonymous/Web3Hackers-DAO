// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {CustomBuilderGovernor} from "../src/governor/interaction-contracts/CustomGovernor.sol";
import {GovernorBase} from "../src/governor/GovernorBase.sol";
import {GovernmentToken} from "../src/GovToken.sol";
import {TokenManager} from "../src/TokenManager.sol";
import {DeployCustomDaoContracts} from "../script/DeployCustomDaoContracts.s.sol";
import {Test, console} from "../lib/forge-std/src/Test.sol";
import "../lib/openzeppelin-contracts/contracts/utils/Strings.sol";


contract DaoTesting is Test {
CustomBuilderGovernor customGovernor;
GovernmentToken govToken;
TokenManager tokenManager;
DeployCustomDaoContracts deployContract;


address[] targets;
bytes[] byteCodeData;
CustomBuilderGovernor.Calldata[][] calldataArray =new CustomBuilderGovernor.Calldata[][](5);

uint256 sepoliaEthFork;
address user = makeAddr("user");
address user2 = makeAddr("user2");
address validBotAddress = vm.envAddress("BOT_ADDRESS");

function setUp() public {
sepoliaEthFork=vm.createSelectFork("ETH_ALCHEMY_SEPOLIA_RPC_URL");
deployContract = new DeployCustomDaoContracts();
(customGovernor, govToken, tokenManager)=deployContract.run();

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

(bytes32 id, address proposer, string memory description, uint256 startBlock,uint256 endBlock, GovernorBase.UrgencyLevel urgency, GovernorBase.ProposalState proposalState,uint256 queuedAtBlockNumber,uint256 executedAtBlockNumber, uint256 succeededAtBlockNumber,uint256 timelockBlockNumber)=customGovernor.proposals(proposalId);
vm.roll(startBlock);
customGovernor.activateProposal(proposalId);

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

vm.roll(endBlock);
customGovernor.succeedProposal(proposalId);

customGovernor.queueProposal(proposalId);

vm.expectRevert();
customGovernor.executeProposal(proposalId);

vm.roll(block.number + timelockBlockNumber);
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
    

calldataArray[0][0]=CustomBuilderGovernor.Calldata(address(tokenManager), abi.encodeWithSignature("rewartUser(address,uint256)", user, 15e18));
bytes32 proposalId2 = customGovernor.createCustomProposal("This proposal is to first vote", targets, byteCodeData, GovernorBase.UrgencyLevel(0), block.number + 3000, 450, 300,
calldataArray
);

(bytes32 id2, address proposer2, string memory description2, uint256 startBlock2,uint256 endBlock2, GovernorBase.UrgencyLevel urgency2, GovernorBase.ProposalState proposalState2,uint256 queuedAtBlockNumber2,uint256 executedAtBlockNumber2, uint256 succeededAtBlockNumber2,uint256 timelockBlockNumber2)=customGovernor.proposals(proposalId2);

vm.roll(startBlock2);
customGovernor.activateProposal(proposalId2);

customGovernor.castVote(proposalId2, "Because I like this option", 0);


vm.roll(endBlock2);
customGovernor.succeedProposal(proposalId2);

customGovernor.queueProposal(proposalId2);

vm.roll(block.number + timelockBlockNumber2);
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

calldataArray[0][0]=CustomBuilderGovernor.Calldata(address(tokenManager), abi.encodeWithSignature("rewardUser(address,uint256)", user, 15e18));
bytes32 proposalId3 = customGovernor.createCustomProposal("This proposal is to first vote", targets, byteCodeData, GovernorBase.UrgencyLevel(0), block.number + 3000, 450, 300,
calldataArray
);

(bytes32 id3, address proposer3, string memory description3, uint256 startBlock3,uint256 endBlock3, GovernorBase.UrgencyLevel urgency3, GovernorBase.ProposalState proposalState3,uint256 queuedAtBlockNumber3,uint256 executedAtBlockNumber3, uint256 succeededAtBlockNumber3,uint256 timelockBlockNumber3)=customGovernor.proposals(proposalId3);

vm.roll(startBlock3);
customGovernor.activateProposal(proposalId3);


vm.roll(endBlock3);
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

calldataArray[0][0]=CustomBuilderGovernor.Calldata(address(tokenManager), abi.encodeWithSignature("rewardUser(address,uint256)", user, 15e18));
bytes32 proposalId3 = customGovernor.createCustomProposal("This proposal is to first vote", targets, byteCodeData, GovernorBase.UrgencyLevel(0), block.number + 3000, 450, 300,
calldataArray
);

(bytes32 id3, address proposer3, string memory description3, uint256 startBlock3,uint256 endBlock3, GovernorBase.UrgencyLevel urgency3, GovernorBase.ProposalState proposalState3,uint256 queuedAtBlockNumber3,uint256 executedAtBlockNumber3, uint256 succeededAtBlockNumber3,uint256 timelockBlockNumber3)=customGovernor.proposals(proposalId3);


vm.roll(startBlock3);
customGovernor.activateProposal(proposalId3);

vm.stopPrank();


vm.prank(user2);
customGovernor.castVote(proposalId3, "Hello", 1);

vm.prank(user);
customGovernor.castVote(proposalId3, "XD", 0);

vm.roll(endBlock3);

vm.prank(user);
customGovernor.succeedProposal(proposalId3);

vm.prank(user);
vm.expectRevert();
customGovernor.queueProposal(proposalId3);
    
}


}