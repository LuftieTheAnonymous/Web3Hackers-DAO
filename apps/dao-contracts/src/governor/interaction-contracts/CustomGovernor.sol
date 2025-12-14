// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {GovernorBase} from "../GovernorBase.sol";


contract CustomBuilderGovernor is GovernorBase {

    enum CustomProposalVote {
        Custom1,
        Custom2,
        Custom3,
        Custom4,
        Custom5
    }


struct HighestVotedCustomOption{
    uint8 voteOptionId;
    uint256 castedVotes;
    address lastVoter;
    bool isExecutable;
}

struct CustomVoteOption{
 bytes[] calldataIndicies;
 bool isDefeatingVote;
 bool isApprovingVote;
}

mapping(bytes32=>mapping(CustomProposalVote => CustomVoteOption)) public votesOptions;

constructor(address govTokenAddr) GovernorBase(govTokenAddr){}

function getCustomProposalVotes(bytes32 proposalId)
    public
    view
    returns (HighestVotedCustomOption[5] memory customVoteCounts)
{
    uint256[5] memory voteSums;
    uint256[5] memory highestVoteWeight;
    address[5] memory highestVoter;
    bool[5] memory highestIsApproving;

    address[] memory voters = proposalVoters[proposalId];
    for (uint256 i = 0; i < voters.length; i++) {
        Vote memory vote = proposalVotes[proposalId][voters[i]];
        uint8 option = vote.voteOption;

        if (option >= 4) continue;

        // Sum weights per option
        voteSums[option] += vote.weight;

        // Check if this voter has highest weight for the option
        if (vote.weight > highestVoteWeight[option]) {
            highestVoteWeight[option] = vote.weight;
            highestVoter[option] = voters[i];
            highestIsApproving[option] = votesOptions[proposalId][CustomProposalVote(option)].isApprovingVote;
        }
    }

    // Build final result array per option
    for (uint8 j = 0; j < 5; j++) {
        customVoteCounts[j] = HighestVotedCustomOption(
            j,
            voteSums[j],
            highestVoter[j],
            highestIsApproving[j]
        );
    }
}



    function insertionSort(HighestVotedCustomOption[5] memory arr, bytes32 proposalId)
    private view  
    returns (uint256[] memory customCalldataIndices, bool isExecutable) 
{
    for (uint i = 1; i < arr.length; i++) {
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



function getHighestVotedCustomOption(bytes32 proposalId) external view returns (uint256[] memory indicies, bool isCustomExecutable) {

    HighestVotedCustomOption[5] memory customVoteCounts = getCustomProposalVotes(proposalId);
    (uint256[] memory customCalldataIndices, bool isExecutable) = insertionSort(customVoteCounts, proposalId);

indicies= customCalldataIndices;
isCustomExecutable = isExecutable;
}


// Action functions
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
    ) external nonReentrant
    isVotingActive(proposalId)
    isElligibleToVote(proposalId)
     {

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




function succeedProposal(bytes32 proposalId) external onlyActionsManager isProposalReadyToSucceed(proposalId) nonReentrant {
 
   uint256 quorumNeeded = getProposalQuorumNeeded(proposalId);

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


function callProposal(Proposal memory proposal) internal nonReentrant {
     for(uint i = 0; i < proposal.targets.length; i++){
             address target = proposal.targets[i];
             bytes memory data = proposal.calldatas[i];

             if(target != address(0)){
                 (bool success, ) = target.call(data);
                 if(!success){
                     revert ExecutionFailed();
                 }
                    emit CalldataExecuted();
             }
         }
        proposals[proposal.id].state = ProposalState.Executed;
        proposals[proposal.id].executedAt = block.timestamp;
        proposals[proposal.id].executed = true;

        emit ProposalExecuted(proposal.id);
}



function callSelectedProposal(bytes32 proposalId, uint256[] memory customCalldataIndices ) internal nonReentrant {
    
     for(uint i = 0; i < customCalldataIndices.length; i++){
             address target =  proposals[proposalId].targets[customCalldataIndices[i]];
             uint256 value = proposals[proposalId].values[customCalldataIndices[i]];
             bytes memory data = proposals[proposalId].calldatas[customCalldataIndices[i]];

            if(target != address(0)){  
                 (bool success, ) = target.call{value:value}(data);
                 if(!success){
                     revert ExecutionFailed();
                     
                 }
                  emit CalldataExecuted();
            }
             
     }
}




function executeProposal(bytes32 proposalId) external onlyActionsManager nonReentrant {
Proposal memory proposal = proposals[proposalId];

    if(proposal.state != ProposalState.Queued && proposal.queuedAt + proposal.timelock > block.timestamp){
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