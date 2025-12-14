// SPDX-License-Identifier: MIT

import {
    GovernorBase
} from "../GovernorBase.sol";

pragma solidity ^0.8.24;

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
        uint256[] memory values,
        bytes[] memory calldatas,
        UrgencyLevel urgencyLevel,
        uint256 endBlockTimestamp,
        uint256 proposalTimelock,
        uint256 delayInSeconds
    ) external nonReentrant isElligibleToPropose override(GovernorBase) returns (bytes32)
     { 
    bytes32 proposalId=this.createProposal(description, targets, values, calldatas, urgencyLevel, endBlockTimestamp, proposalTimelock,delayInSeconds);
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
}