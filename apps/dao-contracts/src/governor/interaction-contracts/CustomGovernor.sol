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
struct Calldata{
address target;
bytes dataBytes;
}

struct CustomVoteOption{
 Calldata[] calldataArr;
 bool isDefeatingVote;
 bool isApprovingVote;
}

mapping(bytes32=>mapping(CustomProposalVote => CustomVoteOption)) public votesCustomOptions;

constructor(address govTokenAddr) GovernorBase(govTokenAddr){}


function createCustomProposal(
        string calldata description,
        address[] memory targets,
        bytes[] memory calldatas,
        UrgencyLevel urgencyLevel,
        uint256 endBlockTimestamp,
        uint256 proposalTimelock,
        uint256 delayInSeconds,
        Calldata[][5] memory selectiveCalldata
    ) external nonReentrant isElligibleToPropose returns (bytes32)
     {
    bytes32 proposalId=this.createProposal(description, targets, calldatas, urgencyLevel, endBlockTimestamp, proposalTimelock,delayInSeconds);
   
   for (uint8 i = 0; i < selectiveCalldata.length; i++) {

    Calldata[]  memory optionCalldata=selectiveCalldata[i];
    
    bool isApproving = optionCalldata.length > 0;

    votesCustomOptions[proposalId][CustomProposalVote(i)]= CustomVoteOption(
      optionCalldata,
      !isApproving,
      isApproving
    );
   }

    return proposalId;
}


// Action functions
    function castVote(
        bytes32 proposalId,
        string calldata reason,
        address delegatee,
        CustomProposalVote voteOption
    ) external nonReentrant
    isVotingActive(proposalId)
    isElligibleToVote(proposalId)
     {

        uint256 weight = govToken.getPastVotes(msg.sender, block.number - 1);

  Vote memory vote=Vote({
     votedProposalId:proposalId,
            voterAddress:msg.sender,
            delegatee:delegatee,
            weight:weight,
            voteOption:uint8(voteOption),
            isDelegated:delegatee != address(0),
            reason:reason,
            timestamp:block.timestamp
        });


        proposalVotes[proposalId][msg.sender] = vote;
        proposalVoters[proposalId].push(msg.sender);
        userVotes[msg.sender].push(vote);
        
        userVotedCount[msg.sender]++;
        emit ProposalVoted(proposalId, msg.sender, weight);

    }




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

        if (option >= 5) continue;

        // Sum weights per option
        voteSums[option] += vote.weight;

        // Check if this voter has highest weight for the option
        if (vote.weight > highestVoteWeight[option]) {
            highestVoteWeight[option] = vote.weight;
            highestVoter[option] = voters[i];
            highestIsApproving[option] = votesCustomOptions[proposalId][CustomProposalVote(option)].isApprovingVote;
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

    return customVoteCounts;
}


function insertionSort(HighestVotedCustomOption[5] memory arr, bytes32 proposalId)
    private view  
    returns (Calldata[] memory mostVotedCustomCalldata
    , bool isExecutable) 
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
        votesCustomOptions[proposalId][CustomProposalVote(proposalVotes[proposalId][arr[0].lastVoter].voteOption)].calldataArr,
        arr[0].isExecutable
    );
}


function getHighestVotedCustomOption(bytes32 proposalId) external view returns (Calldata[] memory callDataArray, bool isCustomExecutable) {
    HighestVotedCustomOption[5] memory customVoteCounts = getCustomProposalVotes(proposalId);
    (Calldata[] memory customCalldata, bool isExecutable) = insertionSort(customVoteCounts, proposalId);

callDataArray= customCalldata;
isCustomExecutable = isExecutable;
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



function callSelectedProposal(Calldata[] memory customCalldataElements ) internal nonReentrant {
    for(uint i = 0; i < customCalldataElements.length; i++){
             address target =  customCalldataElements[i].target;
             bytes memory data = customCalldataElements[i].dataBytes;
            if(target != address(0)){  
                 (bool success, ) = target.call(data);
                 if(!success){
                     revert ExecutionFailed();
                     
                 }
                  emit CalldataExecuted();
            }
             
     }
}

function executeProposal(bytes32 proposalId) external onlyActionsManager nonReentrant {
Proposal memory proposal = proposals[proposalId];

    if(proposal.state != ProposalState.Queued && proposal.queuedAtBlockNumber + proposal.timelockBlockNumber > block.number){
        revert InvalidProposalState();
    }

  
    HighestVotedCustomOption[5] memory customVoteCounts = getCustomProposalVotes(proposalId);
    (Calldata[] memory customCalldataArr, bool isExecutable) = insertionSort(customVoteCounts, proposalId);

if(isExecutable && customCalldataArr.length > 0){
        callSelectedProposal(customCalldataArr);
    }

    proposals[proposalId].state = ProposalState.Executed;
    proposals[proposalId].executedAtBlockNumber = block.number;
    proposals[proposalId].executed = true;
    emit ProposalExecuted(proposalId);
}


    }
