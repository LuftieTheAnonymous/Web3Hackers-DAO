// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20Votes} from "../../lib/openzeppelin-contracts/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {ReentrancyGuard} from "../../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {AccessControl} from "../../lib/openzeppelin-contracts/contracts/access/AccessControl.sol";


contract GovernorBase is ReentrancyGuard, AccessControl{

// Errors
error InvalidProposalState(); 
// Gets called once a function is called, 
// that wants to modify proposal state, that is either not ready to be changed
// or has higher state of execution
error VotingNotStarted();
// Called once user wants to cast a vote before start of the proposal
error VotingPeriodOver();
// Called once user votes the proposal as it's executed or it's endTime block has been reached 
error NotElligibleToPropose();
// Called when user does not have at least 0.05% of the circulating supply
error NotReadyToStart();
// Gets called once the BullMq or the admin by theirself calls the activation Proposal
error AlreadyVoted();
// Prevents from changing the decision, if user already voted or vote again

error NoRoleAssigned(); // Triggered once someone without a role calls a function

error InAppropriateProposalDuration(); // Triggered when endBlockNumber < startBlockNumber or is below min or above max when it comes to duration

error InAppropriateProposalTimeLock(); // Triggered when the proposal timelock (block.number) is above set limit

error NotEqualCalldataAndContractAmount();

error InvalidOptionSelected();

// Events
event ProposalCreated( bytes32 id, address proposer); 

event ProposalCanceled(bytes32 id, address proposer, uint256 canceledAt);

event ProposalActivated(bytes32 id);

event ProposalExecuted(bytes32 id);

event ProposalQueued(bytes32 id, address proposer);

event CalldataExecuted(bytes returnData);

event ProposalVoted(
        bytes32 id,
        address voter,
        uint256 weight
    );


event ProposalSucceeded(bytes32 id);

event ProposalDefeated(bytes32 id, address proposer, uint256 defeatedAt);

// Enums
enum ProposalState{
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Queued,
        Executed
} // Defines Stages for a DAO-Proposal


enum UrgencyLevel{
        Low,
        Medium,
        High
} // Urgency level - Defines the amount of votes that is demanded to pass the proposal successfully


struct Proposal{
    bytes32 id; // proposalId
    address proposer; // proposer address
    string description; // proposal description
    uint256 startBlockNumber; // When to start the voting period
    uint256 endBlockNumber; // When to end the voting period
    UrgencyLevel urgencyLevel; // urgency level of the proposal
    ProposalState state; // proposal state
    address[] targets; // contract addresses to be called
    bytes[] calldatas; // reward data
    uint256 queuedAtBlockNumber; // proposal queued block.number
    uint256 executedAtBlockNumber; // proposal executed block.number
    uint256 succeededAtBlockNumber; // proposal succeeded block.number
    uint256 timelockBlockNumber; // timelock of the proposal
    }


struct Vote {
    address voterAddress; // Votes address
    uint256 weight; // The vote power of certain user (amount of tokens)
    uint8 voteOption; // The index of an option called selected
    bytes32 votedProposalId; // proposalId
    string reason; 
    uint256 timestamp;
} // The struct for Votes


// Role that enables to call the functions related workflow

bytes32 constant private ACTIONS_MANAGER = keccak256("ACTIONS_MANAGER");

// Constant variables for math-operation to get 0.5% of the votes amount (to propose)
// And the percentage of quorum that needs to appear on the voting 
uint256 internal constant THRESHHOLD_DIVIDER = 2e20;
uint256 internal constant LOW_LEVEL_URGENCY_QUORUM = 60;
uint256 internal  constant MEDIUM_LEVEL_URGENCY_QUORUM = 80;
uint256 internal  constant HIGH_LEVEL_URGENCY_QUORUM = 90;

uint256 internal constant MIN_PROPOSAL_PASS_PERCENTAGE = 6e17;


// MIn Proposal Duration (30 minutes)
uint256 private constant MIN_PROPOSAL_DURATION_BLOCK_AMOUNT= 150;

// Max Proposal duration (14 days)
uint256 private constant MAX_PROPOSAL_DURATION_BLOCK_AMOUNT = 100800;

// Max Proposal Time lock duration in blocks
uint256 private constant MAX_TIMELOCK_DURATION = 7200;

uint256 internal constant AVG_MINED_BLOCK_TIME = 12;

uint256 internal proposalCount;
ERC20Votes internal immutable govToken;

mapping(UrgencyLevel => uint256) public urgencyLevelToQuorum;
mapping(address => uint256) public userVotedCount;
mapping(bytes32 => Proposal) public proposals; // proposalId to proposal
mapping(bytes32 => mapping(address => Vote)) public proposalVotes; 

// proposalId to user address to vote
mapping(bytes32 => address[]) public proposalVoters;
mapping(address => Vote[]) public userVotes; // user address to proposalId to vote

constructor(address governmentTokenAddress){
govToken = ERC20Votes(governmentTokenAddress);
// Set default quorum for each urgency level
urgencyLevelToQuorum[UrgencyLevel.Low] = LOW_LEVEL_URGENCY_QUORUM;
urgencyLevelToQuorum[UrgencyLevel.Medium] = MEDIUM_LEVEL_URGENCY_QUORUM;
urgencyLevelToQuorum[UrgencyLevel.High] = HIGH_LEVEL_URGENCY_QUORUM;

_grantRole(ACTIONS_MANAGER, msg.sender);
}

modifier isElligibleToVoteOrUpdateState() {
    if(govToken.getPastVotes(msg.sender, block.number - 1) == 0){
        revert NotElligibleToPropose();
    }
    _;
}

modifier isVotingActive(bytes32 proposalId){

if(proposals[proposalId].state == ProposalState.Pending){
    revert VotingNotStarted();
}

if(block.number > proposals[proposalId].endBlockNumber || proposals[proposalId].state != ProposalState.Active){
        revert VotingPeriodOver();
    }

if(proposalVotes[proposalId][msg.sender].timestamp != 0){
        revert AlreadyVoted();
    }

    _;
}

modifier isElligibleToPropose() {
  if(govToken.getPastVotes(msg.sender, block.number - 1) <= getProposalThreshold()){
            revert NotElligibleToPropose();
        }
    _;
}

modifier onlyActionsManager(){
    if(!hasRole(ACTIONS_MANAGER, msg.sender)){
        revert NoRoleAssigned();
    }
    _;
}

modifier isPendingState(bytes32 proposalId){
       
   if(proposals[proposalId].state != ProposalState.Pending){
            revert InvalidProposalState();
}
_;
}


modifier isProposalReadyToSucceed(bytes32 proposalId) {
if(proposals[proposalId].state != ProposalState.Active || block.number < proposals[proposalId].endBlockNumber
){
            revert InvalidProposalState();
        }
    _;
}

modifier isProposalTimeProperlySet(uint256 delay, uint256 stopBlock, uint256 timelock){

// Check whether the stopBlock has not been selected as past one
if(stopBlock < block.number + delay){
    revert InAppropriateProposalDuration();
}

uint256 duration = stopBlock - (block.number + timelock);

// Check the duration of the Proposal
if(duration > MAX_PROPOSAL_DURATION_BLOCK_AMOUNT || duration < MIN_PROPOSAL_DURATION_BLOCK_AMOUNT){
revert InAppropriateProposalDuration();
}

// Checks whether the timelock is not above 7200 blocks (1 day) 
if(timelock > MAX_TIMELOCK_DURATION){
    revert InAppropriateProposalTimeLock();
}

_;
}

// Returns the entire amount of proposals in the DAO
    function getProposalCount() external view returns (uint256) {
        return proposalCount;
    }

// Returns the quorum urgency rate (in percentage)
    function getUrgencyQuorum(UrgencyLevel urgencyLevel) internal virtual  view returns (uint256) {
        return urgencyLevelToQuorum[urgencyLevel];
    }

    // Returns amount of votings user took part in
    function getUserVotedCount(address user) external view returns (uint256) {
        return userVotedCount[user];
    }

    // Gets the 0.5% amount of all tokens, which allows users to propose 
    // (in initial state all users will be elligible it first will be visible once the DAO would have about 150 participants)
    function getProposalThreshold() public view returns (uint256)  {
        return (govToken.totalSupply() * 1e18) / THRESHHOLD_DIVIDER;
    }

    
// Returns a proposal details
function getProposal(bytes32 proposalId) external view returns (Proposal memory)  {
    return proposals[proposalId];
}


// Returns the quorum needed to proceed the voting
function getProposalQuorumNeeded(bytes32 proposalId) internal view returns (uint256) {
        return (govToken.totalSupply() * getUrgencyQuorum(proposals[proposalId].urgencyLevel)) / 1e2;
}


// Creates a proposal that can be voted
    function createProposal(
        string calldata description,
        address[] memory targets,
        bytes[] memory calldatas,
        UrgencyLevel urgencyLevel,
        uint256 endBlockNumber,
        uint256 proposalTimelockInBlocks,
        uint256 delayInBlocks
    ) external virtual isElligibleToPropose isProposalTimeProperlySet(delayInBlocks, endBlockNumber, proposalTimelockInBlocks) returns (bytes32)  {

        if(targets.length != calldatas.length){
            revert NotEqualCalldataAndContractAmount();
        }

        // Creates a unique, pseudo-random bytes-string for the proposal identification
        bytes32 proposalId = keccak256(abi.encodePacked(proposalCount,description, targets, msg.sender, block.number));
   
   // Creates a struct of Proposal and passes all the details
        Proposal memory proposal = Proposal({
            id:proposalId,
            proposer: msg.sender,
            description: description,
            startBlockNumber: block.number + delayInBlocks,
            endBlockNumber: endBlockNumber,
            urgencyLevel: urgencyLevel,
            state: ProposalState.Pending,
            targets: targets,
            calldatas: calldatas,
            queuedAtBlockNumber:0,
            executedAtBlockNumber:0,
            succeededAtBlockNumber:0,
            timelockBlockNumber:proposalTimelockInBlocks
        });

        proposals[proposalId] = proposal;

      proposalCount++;
     emit ProposalCreated(proposalId, msg.sender);

     return proposalId;
    }

// Activates ability to vote for the members of the DAO
function activateProposal(bytes32 proposalId) external isElligibleToVoteOrUpdateState isPendingState(proposalId) {
 if(block.number < proposals[proposalId].startBlockNumber && proposals[proposalId].state == ProposalState.Pending){
     revert NotReadyToStart();
 }

 proposals[proposalId].state = ProposalState.Active;
 emit ProposalActivated(proposalId);
}

// Cancels the proposal from further execution. This can be the case
// - Once a unsuccessfull function has been called with target.call(dataBytes); in the execution
// - A malicious function could be attached to be executed as a final one

function _cancelProposal(bytes32 proposalId) internal {
    // If the state of the proposal is active, succeeded, canceled, defeated or executed,
    // revert with an error
    if(
    proposals[proposalId].state == ProposalState.Active || 
    proposals[proposalId].state == ProposalState.Succeeded ||
    proposals[proposalId].state ==  ProposalState.Canceled ||
    proposals[proposalId].state == ProposalState.Defeated || 
    proposals[proposalId].state == ProposalState.Executed
    ){
            revert InvalidProposalState();
}

if(proposals[proposalId].state != ProposalState.Queued || (proposals[proposalId].state == ProposalState.Queued && proposals[proposalId].queuedAtBlockNumber + proposals[proposalId].timelockBlockNumber > block.number)){
        revert InvalidProposalState();
}

// Otherwise cancel the proposal from further procedures
   proposals[proposalId].state = ProposalState.Canceled;
    emit ProposalCanceled(proposalId, proposals[proposalId].proposer, block.timestamp);
}


function cancelProposal(bytes32 proposalId) external onlyActionsManager {
 _cancelProposal(proposalId);
}

// Queues succeded proposal to be passed
function queueProposal(bytes32 proposalId) external isElligibleToVoteOrUpdateState  {
// If the state is not equal to succeeded then revert with an error
if(proposals[proposalId].state != ProposalState.Succeeded){
            revert InvalidProposalState();
}

// Otherwise set the state and the queuedBlockNumber and emit an event
    proposals[proposalId].state = ProposalState.Queued;
    proposals[proposalId].queuedAtBlockNumber = block.number;

    emit ProposalQueued(proposalId, proposals[proposalId].proposer);
}


}