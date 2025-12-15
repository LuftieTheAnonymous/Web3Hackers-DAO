// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {GovernorBase} from "../GovernorBase.sol";
contract CustomBuilderGovernor is GovernorBase {

// Custom voting option
    enum CustomProposalVote {
        Custom1,
        Custom2,
        Custom3,
        Custom4,
        Custom5
    }


// Gathering of all the data pertaining selected option
struct SummaryCustomOption{
    uint8 voteOptionId;
    uint256 castedVotes;
    address lastVoter;
    bool isExecutable;
}
// Struct for the data to be called once a approving option will
// have the most votes.
struct Calldata{
address target;
bytes dataBytes;
}

// VoteOption struct with defined parameters for execution
struct CustomVoteOption{
 Calldata[] calldataArr;
 bool isDefeatingVote;
 bool isApprovingVote;

}
// Mapping proposalId=> CustomVoteOptionIndex=> CustomVoteOption
mapping(bytes32=>mapping(CustomProposalVote => CustomVoteOption)) public votesCustomOptions;
constructor(address govTokenAddr) GovernorBase(govTokenAddr){}

// Function to create proposal
function createCustomProposal(
        string calldata description,
        address[] memory targets,
        bytes[] memory calldatas,
        UrgencyLevel urgencyLevel,
        uint256 endBlockTimestamp,
        uint256 proposalTimelockBlocks,
        uint256 delayBlocks,
        Calldata[][5] memory selectiveCalldata
    ) external nonReentrant isElligibleToPropose returns (bytes32)
     {
    // Creates a proposal from the inherited base
    bytes32 proposalId=this.createProposal(description, targets, calldatas, urgencyLevel, endBlockTimestamp, proposalTimelockBlocks, delayBlocks);
   
   // Iteration through the calldata provided arrays 
   for (uint8 i = 0; i < selectiveCalldata.length; i++) {
    // Retrieves the array with calldata
    Calldata[] memory optionCalldata = selectiveCalldata[i];

    // Checks if there is any address zero tarrget inside calldata array
    bool isApproving = true;

    for (uint j = 0; i < optionCalldata.length; i++) {
        if(optionCalldata[j].target == address(0)){
            isApproving=false;
        }
    }
    
    // Add the custom option to the vote options
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
        CustomProposalVote voteOption
    ) external nonReentrant
    isVotingActive(proposalId)
    isElligibleToVote(proposalId)
     {
// If the index will be higher than 4, revert
if(uint8(voteOption) > 4){
    revert InvalidOptionSelected();
}

// Get the weight of the vote
        uint256 weight = govToken.getPastVotes(msg.sender, block.number - 1);

// create a vote with all data
  Vote memory vote=Vote({
     votedProposalId:proposalId,
            voterAddress:msg.sender,
            weight:weight,
            voteOption:uint8(voteOption),
            reason:reason,
            timestamp:block.timestamp
        });

// Attach to the arrays and increase the state of userVotedCount
        proposalVotes[proposalId][msg.sender] = vote;
        proposalVoters[proposalId].push(msg.sender);
        userVotes[msg.sender].push(vote);
        
        userVotedCount[msg.sender]++;
        emit ProposalVoted(proposalId, msg.sender, weight);

    }



// Get custom proposal Votes
function getCustomProposalVotes(bytes32 proposalId)
    public
    view
    returns (SummaryCustomOption[5] memory customVoteCounts)
{
 // Creates arrays for voteSums, weight of the highestVote, highest voter addresses, highestIsApproving boolean
    uint256[5] memory voteSums;
    uint256[5] memory highestVoteWeight;
    address[5] memory highestVoter;
    bool[5] memory highestIsApproving;


    address[] memory voters = proposalVoters[proposalId];


// Iterates through all voters
    for (uint256 i = 0; i < voters.length; i++) {
        // Retrieves the vote
        Vote memory vote = proposalVotes[proposalId][voters[i]];
        // Get option id
        uint8 option = vote.voteOption;

        if (option < 5) continue;

        // Sum weights per option
        voteSums[option] += vote.weight;

        

        // Check if this voter has highest weight for the option and attach his values power of the vote and address
        if (vote.weight > highestVoteWeight[option]) {
            highestVoteWeight[option] = vote.weight;
            highestVoter[option] = voters[i];
        }
            highestIsApproving[option] = votesCustomOptions[proposalId][CustomProposalVote(option)].isApprovingVote;
    }

    // Build final result array per option
    for (uint8 j = 0; j < 5; j++) {
        customVoteCounts[j] = SummaryCustomOption(
            j,
            voteSums[j],
            highestVoter[j],
            highestIsApproving[j]
        );
    }

    return (customVoteCounts);
}

// Sorts elements from the most voted option to the least voted option
function insertionSort(SummaryCustomOption[5] memory arr, bytes32 proposalId) private view returns 
(Calldata[] memory mostVotedCustomCalldata, bool isExecutable, uint256 voteTokens) 
{
    // Start iteration from second element 
    for (uint8 i = 1; i < arr.length; i++) {

        // Get second element and save it
        SummaryCustomOption memory key = arr[i];
        uint8 j = i; // pass index to the j variable

        // Commit the steps while the condition is true
        // Condition: j greater than 0 and previous element from initial index is lesser than
        // the arr[i] element
        while (j > 0 && arr[j - 1].castedVotes < key.castedVotes) {
        // element j-1 assigned to element with index j value
            arr[j] = arr[j - 1];
            // Decrement j 
            j--;
        }

        // set the actual value of arr[j] to key
        arr[j] = key;
    }
    return (
        votesCustomOptions[proposalId][CustomProposalVote(proposalVotes[proposalId][arr[0].lastVoter].voteOption)].calldataArr,
        arr[0].isExecutable,
        arr[0].castedVotes
    );
}

function callSelectedProposal(bytes32 proposalId, Calldata[] memory customCalldataElements ) internal nonReentrant {

    // Iterate through callDataElements
    for(uint i = 0; i < customCalldataElements.length; i++){
             address target =  customCalldataElements[i].target;
             bytes memory data = customCalldataElements[i].dataBytes;

// If target address is zero or data to be called is bytes32(0), break
    if(target == address(0) || uint256(bytes32(data)) == uint256(bytes32(0)) ){  
        break;
    }

// Call the contracts and if is not succeeded cancel the proposal        
                 (bool success, bytes memory returnedData) = target.call(data);
                 if(!success){
                    cancelProposal(proposalId); 
                 }
                  emit CalldataExecuted(returnedData);
            
             
     }
}


// Returns the winning option with it's calldata and if is executable
function getSummaryCustomOption(bytes32 proposalId) external view returns (
    Calldata[] memory callDataArray, bool isCustomExecutable) {
    SummaryCustomOption[5] memory customVoteCounts = getCustomProposalVotes(proposalId);
    (Calldata[] memory customCalldata, bool isExecutable,) = insertionSort(customVoteCounts, proposalId);

callDataArray= customCalldata;
isCustomExecutable = isExecutable;
}

function succeedProposal(bytes32 proposalId) external onlyActionsManager isProposalReadyToSucceed(proposalId) nonReentrant {

// Get the quorum
   uint256 quorumNeeded = getProposalQuorumNeeded(proposalId);
   
   // Get all proposal votes
     SummaryCustomOption[5] memory customVoteCounts = getCustomProposalVotes(proposalId);

// Returns option vote
     (, , uint256 optionVoteTokens) = insertionSort(customVoteCounts, proposalId);

// Count total votes
    uint256 totalVotes = customVoteCounts[0].castedVotes + customVoteCounts[1].castedVotes + customVoteCounts[2].castedVotes + customVoteCounts[3].castedVotes + customVoteCounts[4].castedVotes;
    
    // // If quorum is not matched, defeat the proposal
    if(totalVotes < quorumNeeded){
        proposals[proposalId].state = ProposalState.Defeated;
        emit ProposalDefeated(proposalId, proposals[proposalId].proposer, block.timestamp);
        return;
    }
 // // If quorum is matched, but 60% of the quorum is not reached, defeat.
    if((optionVoteTokens * 1e18) / totalVotes < 6e17){
         proposals[proposalId].state = ProposalState.Defeated;
        emit ProposalDefeated(proposalId, proposals[proposalId].proposer, block.timestamp);
        return;
    }

    proposals[proposalId].state = ProposalState.Succeeded;
    emit ProposalSucceeded(proposalId);

}

// Executes proposal and calls contracts that are included as calldata
function executeProposal(bytes32 proposalId) external onlyActionsManager nonReentrant {
Proposal memory proposal = proposals[proposalId];

    if(proposal.state != ProposalState.Queued && proposal.queuedAtBlockNumber + proposal.timelockBlockNumber > block.number){
        revert InvalidProposalState();
    }
    SummaryCustomOption[5] memory customVoteCounts = getCustomProposalVotes(proposalId);
    (Calldata[] memory customCalldataArr, bool isExecutable,) = insertionSort(customVoteCounts, proposalId);

if(isExecutable && customCalldataArr.length > 0){
        callSelectedProposal(proposalId, customCalldataArr);
    }

    proposals[proposalId].state = ProposalState.Executed;
    proposals[proposalId].executedAtBlockNumber = block.number;
    emit ProposalExecuted(proposalId);
}

}