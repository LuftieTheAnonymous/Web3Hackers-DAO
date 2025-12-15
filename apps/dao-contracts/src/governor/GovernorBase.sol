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
error ExecutionFailed();
// Occurs once a calldata is 
error NoRoleAssigned();

error InAppropriateProposalDuration();

error InAppropriateProposalTimeLock();

// Events
event ProposalCreated( bytes32 id, address proposer);

event ProposalCanceled(bytes32 id, address proposer, uint256 canceledAt);

event ProposalActivated(bytes32 id);

event ProposalExecuted(bytes32 id);

event ProposalQueued(bytes32 id, address proposer);

event CalldataExecuted();

event ProposalVoted(
        bytes32 id,
        address voter,
        uint256 weight
    );


event ProposalSucceeded(bytes32 id);

event ProposalDefeated(bytes32 id, address proposer, uint256 defeatedAt);

enum ProposalState{
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Queued,
        Executed
}


enum UrgencyLevel{
        Low,
        Medium,
        High
}


struct Proposal{
    bytes32 id; // proposalId
    address proposer; // proposer address
    string description; // proposal description
    uint256 startBlockNumber; // When to start the voting period
    uint256 endBlockNumber; // When to end the voting period
    UrgencyLevel urgencyLevel; // urgency level of the proposal
    ProposalState state; // proposal state
    address[] targets; // reward addresses or system logic
    bytes[] calldatas; // reward data or system logic
    bool executed; // proposal executed
    bool canceled; // proposal canceled
    bool defeated; // proposal defeated
    uint256 queuedAtBlockNumber; // proposal queued at
    uint256 executedAtBlockNumber; // proposal executed at
    uint256 succeededAtBlockNumber; // proposal succeeded at
    uint256 timelockBlockNumber; // timelock of the proposal
    }

struct Vote {
    address voterAddress;
    address delegatee; // delegatee address
    uint256 weight;
    uint8 voteOption;
    bytes32 votedProposalId; // proposalId
    bool isDelegated;
    string reason;
    uint256 timestamp;
}


bytes32 constant private ACTIONS_MANAGER = keccak256("ACTIONS_MANAGER");

uint256 internal  constant THRESHHOLD_DIVIDER = 20;
uint256 internal constant LOW_LEVEL_URGENCY_QUORUM = 40;
uint256 internal  constant MEDIUM_LEVEL_URGENCY_QUORUM = 60;
uint256 internal  constant HIGH_LEVEL_URGENCY_QUORUM = 90;


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

modifier isElligibleToVote(bytes32 proposalId) {
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

modifier isProposalTimeProperlySet(uint256 delay, uint256 stopTimestamp, uint256 timelock){
uint256 delaySecondsTurnedToBlocks = delay / AVG_MINED_BLOCK_TIME;

uint256 startTimestampToBlocks = (block.timestamp + AVG_MINED_BLOCK_TIME) / AVG_MINED_BLOCK_TIME;
uint256 endTimeTurnedToBlocks = (stopTimestamp + AVG_MINED_BLOCK_TIME) / AVG_MINED_BLOCK_TIME;
uint256 timeLockTurnedIntoBlocks = (timelock + AVG_MINED_BLOCK_TIME) / AVG_MINED_BLOCK_TIME;

uint256 duration = endTimeTurnedToBlocks - (startTimestampToBlocks + delaySecondsTurnedToBlocks);

if(duration > MAX_PROPOSAL_DURATION_BLOCK_AMOUNT || duration < MIN_PROPOSAL_DURATION_BLOCK_AMOUNT){
revert InAppropriateProposalDuration();
}

if(timeLockTurnedIntoBlocks > MAX_TIMELOCK_DURATION){
    revert InAppropriateProposalTimeLock();
}
_;
}


    function getProposalCount() external view returns (uint256) {
        return proposalCount;
    }

    function getUrgencyQuorum(UrgencyLevel urgencyLevel) internal virtual  view returns (uint256) {
        return urgencyLevelToQuorum[urgencyLevel];
    }

    function getUserVotedCount(address user) external view returns (uint256) {
        return userVotedCount[user];
    }

    function getProposalThreshold() public view returns (uint256)  {
        return govToken.totalSupply() / THRESHHOLD_DIVIDER;
    }

    
function getProposal(bytes32 proposalId) external view returns (Proposal memory)  {
    return proposals[proposalId];
}

function getProposalQuorumNeeded(bytes32 proposalId) internal view returns (uint256) {
        return (govToken.totalSupply() * getUrgencyQuorum(proposals[proposalId].urgencyLevel)) / 1e2;
    }

    function createProposal(
        string calldata description,
        address[] memory targets,
        bytes[] memory calldatas,
        UrgencyLevel urgencyLevel,
        uint256 endBlockTimestamp,
        uint256 proposalTimelock,
        uint256 delayInSeconds
    ) external virtual isElligibleToPropose isProposalTimeProperlySet(delayInSeconds, endBlockTimestamp, proposalTimelock) returns (bytes32)  {
        bytes32 proposalId = keccak256(abi.encodePacked(proposalCount,description, targets, msg.sender, block.timestamp));
        uint256 secondsTurnedToBlocks = (delayInSeconds + AVG_MINED_BLOCK_TIME) / 12;
        uint256 endTimeTurnedToBlocks = (endBlockTimestamp + AVG_MINED_BLOCK_TIME) / 12;
        uint256 timeLockTurnedIntoBlocks = (proposalTimelock + AVG_MINED_BLOCK_TIME) / 12;
        
        Proposal memory proposal = Proposal({
            id:proposalId,
            proposer: msg.sender,
            description: description,
            startBlockNumber: block.number + secondsTurnedToBlocks,
            endBlockNumber: endTimeTurnedToBlocks,
            urgencyLevel: urgencyLevel,
            state: ProposalState.Pending,
            targets: targets,
            calldatas: calldatas,
            executed:false,
            canceled:false,
            defeated:false,
            queuedAtBlockNumber:0,
            executedAtBlockNumber:0,
            succeededAtBlockNumber:0,
            timelockBlockNumber:timeLockTurnedIntoBlocks
        });

        proposals[proposalId] = proposal;

      proposalCount++;
     emit ProposalCreated(proposalId, msg.sender);

     return proposalId;
    }

// Activates ability to vote for the members of the DAO
function activateProposal(bytes32 proposalId) external onlyActionsManager isPendingState(proposalId) {
 if(block.number < proposals[proposalId].startBlockNumber && proposals[proposalId].state == ProposalState.Pending){
     revert NotReadyToStart();
 }

 proposals[proposalId].state = ProposalState.Active;
 emit ProposalActivated(proposalId);
}

function cancelProposal(bytes32 proposalId) public onlyActionsManager {
    if(
    proposals[proposalId].state == ProposalState.Active || 
    proposals[proposalId].state == ProposalState.Succeeded || 
    proposals[proposalId].state == ProposalState.Defeated || 
    proposals[proposalId].state == ProposalState.Executed
    ){
            revert InvalidProposalState();
}

        proposals[proposalId].state = ProposalState.Canceled;
        proposals[proposalId].canceled = true;
    emit ProposalCanceled(proposalId, msg.sender, block.timestamp);
}

function queueProposal(bytes32 proposalId) external onlyActionsManager {
if(proposals[proposalId].state != ProposalState.Succeeded){
            revert InvalidProposalState();
}

    proposals[proposalId].state = ProposalState.Queued;
    proposals[proposalId].queuedAtBlockNumber = block.number;

    emit ProposalQueued(proposalId, msg.sender);
}





}