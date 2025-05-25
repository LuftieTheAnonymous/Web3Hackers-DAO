// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract CustomBuilderGovernor {

// Errors
error InvalidProposalState();
error VotingNotStarted();
error VotingPeriodOver();
error NotElligibleToPropose();
error NotReadyToStart();
error AlreadyVoted();
error ExecutionFailed();

// Events
event ProposalCreated(
        bytes32 id,
        address proposer
    );

event ProposalCanceled(
        bytes32 id,
        address proposer,
        uint256 canceledAt
    );

event ProposalActivated(
        bytes32 id
);

event ProposalExecuted(
        bytes32 id
    );

event ProposalQueued(
        bytes32 id,
        address proposer
    );

event CalldataExecuted();

event ProposalVoted(
        bytes32 id,
        address voter,
        uint256 weight
    );


event ProposalSucceeded( bytes32 id);

event ProposalVoteDelegated(
        uint256 id,
        address voter,
        address delegatee,
        uint256 weight,
        StandardProposalVote standardVoteOption,
        CustomProposalVote customVoteOption
    );

    event ProposalDefeated(
        bytes32 id,
        address proposer,
        uint256 defeatedAt
    );


// Enums
    enum VotingOptionType{
        Standard,
        Custom
    }

    enum StandardProposalVote {
        Yes,
        No,
        Abstain
    }

    enum CustomProposalVote {
        Custom1,
        Custom2,
        Custom3,
        Custom4,
        Custom5
    }

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

//Structs
struct Proposal{
    bytes32 id; // proposalId
    address proposer; // proposer address
    string description; // proposal description
    uint256 startBlockTimestamp; // When to start the voting period
    uint256 endBlockTimestamp; // When to end the voting period
    UrgencyLevel urgencyLevel; // urgency level of the proposal
    ProposalState state; // proposal state
    address[] targets; // reward addresses or system logic
    uint256[] values; // reward values or system logic
    bytes[] calldatas; // reward data or system logic
    bool isCustom; // is custom proposal
    bool executed; // proposal executed
    bool canceled; // proposal canceled
    bool defeated; // proposal defeated
    uint256 queuedAt; // proposal queued at
    uint256 executedAt; // proposal executed at
    uint256 succeededAt; // proposal succeeded at
    uint256 timelock; // timelock of the proposal
    }

struct Vote {
    bytes32 votedProposalId; // proposalId
    address voter;
    address delegatee; // delegatee address
    uint256 weight;
  uint8 voteOption;
    bool isCustom; // is custom vote
    bool isVoted;
    bool isDelegated;
    bool isDefeatingVote;
    bool isApprovingVote;
    string reason;
    uint256 timestamp;
    bytes32 extraData;
    uint256[] customCalldataIndices;
}

struct HighestVotedCustomOption{
    uint8 voteOptionId;
    uint256 castedVotes;
    address lastVoter;
    bool isExecutable;
}

// Variables
uint256 public constant MIN_VOTING_PERIOD = 100; // 100 blocks
uint256 public constant MAX_VOTING_PERIOD = 1000; // 1000 blocks

uint256 public constant MIN_VOTING_DELAY = 1; // 1 block
uint256 public constant MAX_VOTING_DELAY = 10; // 10 blocks

uint256 public constant LOW_LEVEL_URGENCY_QUORUM = 40;
uint256 public constant MEDIUM_LEVEL_URGENCY_QUORUM = 60;
uint256 public constant HIGH_LEVEL_URGENCY_QUORUM = 90;

uint256 public proposalCount;
IVotes public immutable IVotestoken;
ERC20Votes public immutable govToken;


// mappings
mapping(UrgencyLevel => uint256) public urgencyLevelToQuorum;
mapping(bytes32 => Proposal) public proposals; // proposalId to proposal
mapping(bytes32 => mapping(address => Vote)) public proposalVotes; // proposalId to user address to vote
mapping(bytes32 => address[]) public proposalVoters;
mapping(address => Vote[]) public userVotes; // user address to proposalId to vote
mapping(address => uint256) public userVotedCount;

modifier isVotingActive(bytes32 proposalId){

if(proposals[proposalId].state == ProposalState.Pending){
    revert VotingNotStarted();
}

if(block.timestamp > proposals[proposalId].endBlockTimestamp || proposals[proposalId].state != ProposalState.Active){
        revert VotingPeriodOver();
    }

if(proposalVotes[proposalId][msg.sender].isVoted){
        revert AlreadyVoted();
    }

    _;
}

constructor(IVotes _token){
        IVotestoken = _token;
        govToken = ERC20Votes(address(_token));
        // Set default quorum for each urgency level
        urgencyLevelToQuorum[UrgencyLevel.Low] = LOW_LEVEL_URGENCY_QUORUM;
        urgencyLevelToQuorum[UrgencyLevel.Medium] = MEDIUM_LEVEL_URGENCY_QUORUM;
        urgencyLevelToQuorum[UrgencyLevel.High] = HIGH_LEVEL_URGENCY_QUORUM;
    }


    function getIVotesToken() public view returns (IVotes) {
        return IVotestoken;
    }

    function getGovToken() public view returns (ERC20Votes) {
        return govToken;
    }


    function getProposalCount() public view returns (uint256) {
        return proposalCount;
    }

    function getUrgencyQuorum(UrgencyLevel urgencyLevel) public view returns (uint256) {
        return urgencyLevelToQuorum[urgencyLevel];
    }


    function getProposalThreshold() public view returns (uint256) {
        return govToken.totalSupply() / 200;
    }

function getStandardProposalVotes(bytes32 proposalId)
    public
    view
    returns (uint256 votesFor, uint256 votesAgainst, uint256 votesAbstain)
{
    address[] memory voters = proposalVoters[proposalId];
    for (uint256 i = 0; i < voters.length; i++) {
        Vote memory vote = proposalVotes[proposalId][voters[i]];


        if (vote.voteOption == 0) {
            votesFor += vote.weight;
        } else if (vote.voteOption == 1) {
            votesAgainst += vote.weight;
        } else if (vote.voteOption == 2) {
            votesAbstain += vote.weight;
        }
    }
}

function getCustomProposalVotes(bytes32 proposalId)
    public
    view
    returns (HighestVotedCustomOption[5] memory customVoteCounts)
{
    address[] memory voters = proposalVoters[proposalId];
    for (uint256 i = 0; i < voters.length; i++) {
        Vote memory vote = proposalVotes[proposalId][voters[i]];

        uint8 option = vote.voteOption; // 0 to 4 (MAX 5 options)
      
            customVoteCounts[i] = HighestVotedCustomOption(option, vote.weight, voters[i], vote.isApprovingVote);
    }
}

    function insertionSort(HighestVotedCustomOption[5] memory arr, bytes32 proposalId) 
    public view  
    returns (uint256[] memory customCalldataIndices, bool isExecutable) 
{
    for (uint i = 1; i < customCalldataIndices.length; i++) {
        HighestVotedCustomOption memory key = arr[i];
        uint j = i;

        while (j > 0 && arr[j - 1].castedVotes < key.castedVotes) {
            arr[j] = arr[j - 1];
            j--;
        }

        arr[j] = key;
    }

    return (
        proposalVotes[proposalId][arr[0].lastVoter].customCalldataIndices, 
        arr[0].isExecutable
    );
}



function getHighestVotedCustomOption(bytes32 proposalId) public view returns (uint256[] memory indicies, bool isCustomExecutable) {

    HighestVotedCustomOption[5] memory customVoteCounts = getCustomProposalVotes(proposalId);
    (uint256[] memory customCalldataIndices, bool isExecutable) = insertionSort(customVoteCounts, proposalId);

indicies= customCalldataIndices;
isCustomExecutable = isExecutable;
}



function getProposal(bytes32 proposalId) public view returns (Proposal memory) {
    return proposals[proposalId];
}

function getProposalQuorumNeeded(bytes32 proposalId) public view returns (uint256) {
        return (govToken.totalSupply() * getUrgencyQuorum(proposals[proposalId].urgencyLevel)) / 100;
    }

    function castVote(
        bytes32 proposalId,
        string calldata reason,
        address delegatee,
        uint8 voteOption,
        bytes32 extraData,
        bool isCustom,
        bool isApprovingVote,
        bool isDefeatingVote,
        uint256[] calldata customCalldataIndices
    ) public
    isVotingActive(proposalId)
     {
        govToken.delegate(msg.sender);

        uint256 weight = govToken.getPastVotes(msg.sender, block.number - 1);

  Vote memory vote=Vote({
     votedProposalId:proposalId,
            voter:msg.sender,
            delegatee:delegatee,
            weight:weight,
            voteOption:voteOption,
            isCustom:isCustom,
            isVoted:true,
            isApprovingVote:isApprovingVote,
            isDefeatingVote:isDefeatingVote,
            isDelegated:delegatee != address(0),
            reason:reason,
            timestamp:block.timestamp,
            extraData:extraData,
            customCalldataIndices:customCalldataIndices
        });

        proposalVotes[proposalId][msg.sender] = vote;
        proposalVoters[proposalId].push(msg.sender);
        userVotes[msg.sender].push(vote);

userVotedCount[msg.sender]++;
        emit ProposalVoted(proposalId, msg.sender, voteOption);

    }



    function createProposal(
        string calldata description,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        UrgencyLevel urgencyLevel,
        bool isCustom,
        uint256 endBlockTimestamp,
        uint256 proposalTimelock,
        uint256 delayInSeconds
    ) public returns (bytes32) {

if(govToken.getPastVotes(msg.sender, block.number - 1) < getProposalThreshold() ||  govToken.getPastVotes(msg.sender, block.number - 1) == 0){
            revert NotElligibleToPropose();
        }


        bytes32 proposalId = keccak256(abi.encodePacked(proposalCount,description, targets, values, isCustom, msg.sender, block.timestamp));

        Proposal memory proposal = Proposal({
            id:proposalId,
            proposer:msg.sender,
            description:description,
            startBlockTimestamp:block.timestamp + delayInSeconds,
            endBlockTimestamp:endBlockTimestamp,
            urgencyLevel:urgencyLevel,
            state:ProposalState.Pending,
            targets:targets,
            values:values,
            calldatas:calldatas,
            isCustom:isCustom,
            executed:false,
            canceled:false,
            defeated:false,
            queuedAt:0,
            executedAt:0,
            succeededAt:0,
            timelock:proposalTimelock
        });

        proposals[proposalId] = proposal;
     

      proposalCount++;
     emit ProposalCreated(proposalId, msg.sender);

     return proposalId;
    }


function activateProposal(bytes32 proposalId) external {
 if(block.timestamp < proposals[proposalId].startBlockTimestamp && proposals[proposalId].state == ProposalState.Pending){
     revert NotReadyToStart();
 }

 proposals[proposalId].state = ProposalState.Active;
 emit ProposalActivated(proposalId);
}


function succeedProposal(bytes32 proposalId) public {
 
        if(proposals[proposalId].state != ProposalState.Active || block.timestamp < proposals[proposalId].endBlockTimestamp){
            revert InvalidProposalState();
        }

   uint256 quorumNeeded = getProposalQuorumNeeded(proposalId);

if(!proposals[proposalId].isCustom){
    (uint256 votesFor, uint256 votesAgainst, uint256 votesAbstain) = getStandardProposalVotes(proposalId);

    uint256 totalNotCustomVotes = votesFor + votesAgainst + votesAbstain;
    if(totalNotCustomVotes < quorumNeeded){
         proposals[proposalId].state = ProposalState.Defeated;
        proposals[proposalId].defeated = true;
        emit ProposalDefeated(proposalId, msg.sender, block.timestamp);
        return;
    }

    if(votesFor > votesAgainst && votesFor > votesAbstain){
        proposals[proposalId].state = ProposalState.Succeeded;
        emit ProposalSucceeded(proposalId);
        return;
    }

    proposals[proposalId].state = ProposalState.Defeated;
    proposals[proposalId].defeated = true;
    emit ProposalDefeated(proposalId, msg.sender, block.timestamp);
    return;
    }

     HighestVotedCustomOption[5] memory customVoteCounts = getCustomProposalVotes(proposalId);

    uint256 totalVotes = customVoteCounts[0].castedVotes + customVoteCounts[1].castedVotes + customVoteCounts[2].castedVotes + customVoteCounts[3].castedVotes + customVoteCounts[4].castedVotes;
    if(totalVotes < quorumNeeded){
        proposals[proposalId].state = ProposalState.Defeated;
        proposals[proposalId].defeated = true;
        emit ProposalDefeated(proposalId, msg.sender, block.timestamp);
        return;
    }

    proposals[proposalId].state = ProposalState.Succeeded;
    emit ProposalSucceeded(proposalId);

}

function cancelProposal(bytes32 proposalId) public {
   
   if(proposals[proposalId].state != ProposalState.Pending){
            revert InvalidProposalState();
}

        proposals[proposalId].state = ProposalState.Canceled;
        proposals[proposalId].canceled = true;


        emit ProposalCanceled(proposalId, msg.sender, block.timestamp);
    }


function queueProposal(bytes32 proposalId) public  {
if(proposals[proposalId].state != ProposalState.Succeeded ){
            revert InvalidProposalState();
}

    proposals[proposalId].state = ProposalState.Queued;
    proposals[proposalId].queuedAt = block.timestamp;

    emit ProposalQueued(proposalId, msg.sender);
}





function callProposal(Proposal memory proposal) internal {
     for(uint i = 0; i < proposal.targets.length; i++){
             address target = proposal.targets[i];
             uint256 value = proposal.values[i];
             bytes memory data = proposal.calldatas[i];

             if(target != address(0)){
                 emit CalldataExecuted();
                 (bool success, bytes memory returnData) = target.call{value:value}(data);
                 if(!success){
                     revert ExecutionFailed();
                 }
             }
         }
        proposals[proposal.id].state = ProposalState.Executed;
        proposals[proposal.id].executedAt = block.timestamp;
        proposals[proposal.id].executed = true;

        emit ProposalExecuted(proposal.id);
}



function callSelectedProposal(bytes32 proposalId, uint256[] memory customCalldataIndices ) internal {
    
     for(uint i = 0; i < customCalldataIndices.length; i++){
             address target =  proposals[proposalId].targets[customCalldataIndices[i]];
             uint256 value = proposals[proposalId].values[customCalldataIndices[i]];
             bytes memory data = proposals[proposalId].calldatas[customCalldataIndices[i]];

            if(target != address(0)){  
                 (bool success, bytes memory returnData) = target.call{value:value}(data);
                  emit CalldataExecuted();
                 if(!success){
                     revert ExecutionFailed();
                     
                 }
            }
             
     }
}




function executeProposal(bytes32 proposalId) external {
Proposal memory proposal = proposals[proposalId];

    if(proposal.state != ProposalState.Queued && proposal.queuedAt+ proposal.timelock > block.timestamp){
        revert InvalidProposalState();
    }

     if(!proposal.isCustom){
        callProposal(proposal);
return;
     }
     
  
  if(proposal.isCustom){
    HighestVotedCustomOption[5] memory customVoteCounts = getCustomProposalVotes(proposalId);
    (uint256[] memory customCalldataIndices, bool isExecutable) = insertionSort(customVoteCounts, proposalId);

if(isExecutable && customCalldataIndices.length > 0){
        callSelectedProposal(proposalId, customCalldataIndices);
    }
    }


    proposals[proposalId].state = ProposalState.Executed;
    proposals[proposalId].executedAt = block.timestamp;
    proposals[proposalId].executed = true;
    emit ProposalExecuted(proposalId);
}
}