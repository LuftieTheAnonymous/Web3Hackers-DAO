// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {
    GovernorBase
} from "../GovernorBase.sol";

contract StandardGovernor is GovernorBase{

    // Vote Options For Standard Voting
    enum StandardProposalVote {
        Yes,
        No,
        Abstain
    }

// Vote Option Logic to to vote for
        struct VoteOption {
    bool isDefeatingVote;
    bool isApprovingVote;
}

// Vote options available for certain proposal
mapping(bytes32=>mapping(StandardProposalVote => VoteOption)) public votesOptions;

constructor(address govTokenAddr) GovernorBase(govTokenAddr){}

// Returns followingly the sums of votes (for, abstain, against) in a tuple.
    function getStandardProposalVotes(bytes32 proposalId) public
    view
    returns (uint256 votesFor, uint256 votesAbstain,uint256 votesAgainst)
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

    return(votesFor, votesAbstain, votesAgainst);
}

// Inherits from the GovernorBase the function standard
// and modifies the options of voting 

function createProposal(
        string calldata description,
        address[] memory targets,
        bytes[] memory calldatas,
        UrgencyLevel urgencyLevel,
        uint256 endBlockTimestamp,
        uint256 proposalTimelock,
        uint256 delayInSeconds
    ) external nonReentrant isElligibleToPropose override(GovernorBase) returns (bytes32)
     {
// Calls the inherited from GovernorBase function
    bytes32 proposalId=this.createProposal(description, targets, calldatas, urgencyLevel, endBlockTimestamp, proposalTimelock,delayInSeconds);

    // Adds the proposal options
    votesOptions[proposalId][StandardProposalVote.Yes]= VoteOption(false, true);
    votesOptions[proposalId][StandardProposalVote.Abstain]= VoteOption(false, false);
    votesOptions[proposalId][StandardProposalVote.No]= VoteOption(true, false);

    return proposalId;
     }


     // Returns the votes on certain proposal
     function getProposalVotes(bytes32 proposalId) external view returns (Vote[] memory) {
    
    // Retrieves all proposal voters' addresses, who voted on the proposal
    address[] memory voters = proposalVoters[proposalId];

    // creates an array with length of the amount of voters
    Vote[] memory votes = new Vote[](voters.length);
    
    for (uint256 i = 0; i < voters.length; i++) {
        votes[i] = proposalVotes[proposalId][voters[i]]; 
        // Adds a vote of a a user to an array
    }

// Returns all the proposal votes
    return votes;
}

    function castVote(
        bytes32 proposalId,
        string calldata reason,
        StandardProposalVote voteOptionIndex
    ) external nonReentrant
    isVotingActive(proposalId)
    isElligibleToVoteOrUpdateState
     {

        // If invalid option gets selected, revert
        if(uint8(voteOptionIndex) < 2){
            revert InvalidOptionSelected();
        }

        uint256 weight = govToken.getPastVotes(msg.sender, block.number - 1);

// Creates a vote with all the data
  Vote memory vote=Vote({
            voterAddress:msg.sender,
            weight:weight,
            voteOption: uint8(voteOptionIndex),
            votedProposalId:proposalId,
            reason:reason,
            timestamp:block.timestamp
        });

        // Adds the vote to the proposalVotes struct
        proposalVotes[proposalId][msg.sender] = vote;
        // Pushes the voter to an proposalVoters array
        proposalVoters[proposalId].push(msg.sender);
        // Adds proposalVotes to an individual array of votes
        userVotes[msg.sender].push(vote);
        
        // User Voted Counted gets incremenented
        userVotedCount[msg.sender]++;
        emit ProposalVoted(proposalId, msg.sender, weight);

    }




function succeedProposal(bytes32 proposalId) external isProposalReadyToSucceed(proposalId) isElligibleToVoteOrUpdateState nonReentrant { 

    // Returns the demanded Quorum frequency (in tokens)
   uint256 quorumNeeded = getProposalQuorumNeeded(proposalId);
    
    // Counts the total votes
    (uint256 votesFor, uint256 votesAgainst, uint256 votesAbstain) = getStandardProposalVotes(proposalId);
    uint256 totalVotes = votesFor + votesAgainst + votesAbstain;


    // If the total votes amount is less than the required quorum,
    // Defeat the proposal
    if(totalVotes < quorumNeeded){
         proposals[proposalId].state = ProposalState.Defeated;
        emit ProposalDefeated(proposalId, proposals[proposalId].proposer, block.timestamp);
        return;
    }

    // If the votes for is equal or greater than 60% of the required quorum
    // Succeed the proposal 
    if((votesFor * 1e18) / totalVotes >= MIN_PROPOSAL_PASS_PERCENTAGE){
        proposals[proposalId].state = ProposalState.Succeeded;
        emit ProposalSucceeded(proposalId);
        return;
    }

// Otherwise defeat the Proposal
    proposals[proposalId].state = ProposalState.Defeated;
    emit ProposalDefeated(proposalId, proposals[proposalId].proposer, block.timestamp);
}


// Function to perform a call to the targeted contract with the byte-code data passed
// If there are any target contracts to be called else set as executed immediately.
function performProposalExecution(Proposal memory proposal) internal nonReentrant {
// If there are any targets and calldata array length is the same as targets 
if(proposal.targets.length > 0 && proposal.targets.length == proposal.calldatas.length){
    
    // Iterate through the entire array and call the functions accordingly to the order
     for(uint i = 0; i < proposal.targets.length; i++){
             address target = proposal.targets[i];
             bytes memory data = proposal.calldatas[i];

             if(target != address(0)){
                 (bool success, bytes memory returnData) = target.call(data);
                 // If there is no success with an call, it means that wrong data has been passed
                 // Which cancels the proposal from further calls (To not exhasust BullMQ)
                 if(!success){
                     _cancelProposal(proposal.id);
                     return;
                 }
                 // Else emit calldata exeucted
                    emit CalldataExecuted(returnData);
             }
}
    }

    // Finally set the proposal state to executed and add the BlockNumber of an execution
        proposals[proposal.id].state = ProposalState.Executed;
        proposals[proposal.id].executedAtBlockNumber = block.number;
 
        emit ProposalExecuted(proposal.id);
}


function executeProposal(bytes32 proposalId) external isElligibleToVoteOrUpdateState() nonReentrant {
// Get the proposal by it's Id
Proposal memory proposal = proposals[proposalId];

// If proposal is not equal to queued and the time timelock is not expired, revert
if(proposal.state != ProposalState.Queued || (proposal.state == ProposalState.Queued && proposal.queuedAtBlockNumber + proposal.timelockBlockNumber > block.number)){
        revert InvalidProposalState();
    }

// Otherwise call the proposal
    performProposalExecution(proposal);
}



}