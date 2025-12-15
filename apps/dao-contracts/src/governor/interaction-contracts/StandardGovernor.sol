// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {
    GovernorBase
} from "../GovernorBase.sol";

contract StandardGovernor is GovernorBase{
    enum StandardProposalVote {
        Yes,
        No,
        Abstain
    }

        struct VoteOption {
    bool isDefeatingVote;
    bool isApprovingVote;
}


mapping(bytes32=>mapping(StandardProposalVote => VoteOption)) public votesOptions;

constructor(address govTokenAddr) GovernorBase(govTokenAddr){}

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
    bytes32 proposalId=this.createProposal(description, targets, calldatas, urgencyLevel, endBlockTimestamp, proposalTimelock,delayInSeconds);
    votesOptions[proposalId][StandardProposalVote.Yes]= VoteOption(false, true);
    votesOptions[proposalId][StandardProposalVote.Abstain]= VoteOption(false, false);
    votesOptions[proposalId][StandardProposalVote.No]= VoteOption(true, false);

    return proposalId;
     }


     function getProposalVotes(bytes32 proposalId) external view returns (Vote[] memory) {
    address[] memory voters = proposalVoters[proposalId];
    Vote[] memory votes = new Vote[](voters.length);
    
    for (uint256 i = 0; i < voters.length; i++) {
        votes[i] = proposalVotes[proposalId][voters[i]];
    }

    return votes;
}

    function castVote(
        bytes32 proposalId,
        string calldata reason,
        address delegatee,
        StandardProposalVote voteOptionIndex
    ) external nonReentrant
    isVotingActive(proposalId)
    isElligibleToVote(proposalId)
     {

        uint256 weight = govToken.getPastVotes(msg.sender, block.number - 1);

  Vote memory vote=Vote({
            voterAddress:msg.sender,
            delegatee:delegatee,
            weight:weight,
            voteOption: uint8(voteOptionIndex),
            votedProposalId:proposalId,
            isDelegated: delegatee != address(0),
            reason:reason,
            timestamp:block.timestamp
        });


        proposalVotes[proposalId][msg.sender] = vote;
        proposalVoters[proposalId].push(msg.sender);
        userVotes[msg.sender].push(vote);
        
        userVotedCount[msg.sender]++;
        emit ProposalVoted(proposalId, msg.sender, weight);

    }




function succeedProposal(bytes32 proposalId) external onlyActionsManager isProposalReadyToSucceed(proposalId) nonReentrant { 
   uint256 quorumNeeded = getProposalQuorumNeeded(proposalId);
    (uint256 votesFor, uint256 votesAgainst, uint256 votesAbstain) = getStandardProposalVotes(proposalId);
    uint256 totalNotCustomVotes = votesFor + votesAgainst + votesAbstain;

    if(totalNotCustomVotes < quorumNeeded){
         proposals[proposalId].state = ProposalState.Defeated;
        proposals[proposalId].defeated = true;
        emit ProposalDefeated(proposalId, proposals[proposalId].proposer, block.timestamp);
        return;
    }

    if(votesFor > votesAgainst && votesFor > votesAbstain){
        proposals[proposalId].state = ProposalState.Succeeded;
        emit ProposalSucceeded(proposalId);
        return;
    }

    proposals[proposalId].state = ProposalState.Defeated;
    proposals[proposalId].defeated = true;
    emit ProposalDefeated(proposalId, proposals[proposalId].proposer, block.timestamp);
}

function callProposal(Proposal memory proposal) internal onlyActionsManager nonReentrant {
     for(uint i = 0; i < proposal.targets.length; i++){
             address target = proposal.targets[i];
             bytes memory data = proposal.calldatas[i];

             if(target != address(0)){
                 (bool success, bytes memory returnedData) = target.call(data);
                 if(!success){
                    if (returnedData.length > 0) { assembly { revert(add(returnedData,32), mload(returnedData)) } }
                     revert ExecutionFailed();
                 }
                    emit CalldataExecuted();
             }
}
        proposals[proposal.id].state = ProposalState.Executed;
        proposals[proposal.id].executedAtBlockNumber = block.number;
        proposals[proposal.id].executed = true;

        emit ProposalExecuted(proposal.id);
}


function executeProposal(bytes32 proposalId) external onlyActionsManager nonReentrant {
Proposal memory proposal = proposals[proposalId];

    if(proposal.state != ProposalState.Queued && proposal.queuedAtBlockNumber + proposal.timelockBlockNumber > block.number){
        revert InvalidProposalState();
    }

        callProposal(proposal);

}



}