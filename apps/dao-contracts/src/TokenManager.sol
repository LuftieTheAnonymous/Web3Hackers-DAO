// SPDX-License-Identifier: MIT

    import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

    import {GovernmentToken} from "./GovToken.sol";

    import {AccessControl} from "../lib/openzeppelin-contracts/contracts/access/AccessControl.sol";


pragma solidity ^0.8.24;

contract TokenManager is AccessControl, ReentrancyGuard{

  // Events
    event InitialTokensReceived(address indexed account, uint256 indexed amount);
    event UserRewarded(address indexed account, uint256 indexed amount);
    event UserPunished(address indexed account, uint256 indexed amount);
    event UserReceivedMonthlyDistribution(address indexed account, uint256 indexed amount);

    // Errors
    error MonthlyDistributionNotReady();
    error IntialTokensNotReceived();


    // ENUMs in order to determine accurately the level of certain parameter
    enum TokenReceiveLevel {
      LOW,
      MEDIUM_LOW,
      MEDIUM,
      HIGH 
    }

    enum TechnologyKnowledgeLevel {
      LOW_KNOWLEDGE,
      HIGHER_LOW_KNOWLEDGE,
      MEDIUM_KNOWLEDGE,
      HIGH_KNOWLEDGE,
      EXPERT_KNOWLEDGE
    } 


    enum KnowledgeVerificationTestRate{
      LOW,
      MEDIUM_LOW,
      MEDIUM,
    MEDIUM_HIGH,
      HIGH,
      VERY_HIGH,
      EXPERT,
      EXPERT_PLUS
    }

    GovernmentToken govToken;

    uint256 private constant INITIAL_TOKEN_USER_AMOUNT = 1e21;
    uint256 private constant MALICIOUS_ACTIONS_LIMIT = 3;
    uint256 private constant DSR_ADMIN_MULTIPLIER = 35;
    uint256 private constant DSR_USER_MULTIPLIER = 5 ;
    uint256 private constant MULTIPLICATION_NORMALIZATION_1E2=1e2;
    uint256 private constant MULTIPLICATION_NORMALIZATION_1E3=1e3;
    uint256 private constant MULTIPLICATION_NORMALIZATION_1E4=1e4;
    uint256 private constant oneMonth = 30 days; 

    // mappings
    mapping(address => bool) private receivedInitialTokens;
    mapping(address => uint256) private lastClaimedMonthlyDistributionTime;
    mapping(TokenReceiveLevel => uint256) private psrOptions;
    mapping(TokenReceiveLevel => uint256) private jexsOptions;
    mapping(TechnologyKnowledgeLevel => uint256) private tklOptions;
    mapping(TokenReceiveLevel => uint256) private web3IntrestOptions;
    mapping(KnowledgeVerificationTestRate => uint256) private kvtrOptions;



    constructor(address governmentTokenAddr){
      govToken = GovernmentToken(governmentTokenAddr);
    }


    modifier isMonthlyDistributionTime() {
      if(lastClaimedMonthlyDistributionTime[msg.sender] != 0 && block.timestamp - lastClaimedMonthlyDistributionTime[msg.sender] < oneMonth){
        revert MonthlyDistributionNotReady();
      }
      _;
    }

            modifier onlyForInitialTokensReceivers(address member) {
    if(!receivedInitialTokens[member]) {
        revert IntialTokensNotReceived(); 
    }
    _;
        }



// Performed by admin in order to deprive user of his tokens and delist him out of whitelist.
function kickOutFromDAO(address user) external  {
govToken.burn(user, govToken.balanceOf(user));
receivedInitialTokens[user] = false;
govToken.removeFromWhitelist(user);
govToken.addBlacklist(user);
}


      // Public functions (User-Interactive)
function handInUserInitialTokens
(TokenReceiveLevel _psrLevel, 
TokenReceiveLevel _jexsLevel, 
TechnologyKnowledgeLevel _tklLevel, 
TokenReceiveLevel _web3IntrestLevel, 
KnowledgeVerificationTestRate _kvtrLevel, 
address receiverAddress) external nonReentrant {
        // IMPLEMENT CONSTANT VARIABLE FOR 10
        if (receivedInitialTokens[receiverAddress]) {
          uint256 punishmentAmount= INITIAL_TOKEN_USER_AMOUNT / 10;
        punishMember(receiverAddress, punishmentAmount);
        emit UserPunished(receiverAddress, punishmentAmount);
        return;
    }

      // IMPLEMENT CONSTANT VARIABLE FOR 1E2, 1E3 AND 1E4
    uint256 amountOfTokens = 
    INITIAL_TOKEN_USER_AMOUNT + (((INITIAL_TOKEN_USER_AMOUNT * psrOptions[_psrLevel]) / MULTIPLICATION_NORMALIZATION_1E2) + 
    ((INITIAL_TOKEN_USER_AMOUNT * jexsOptions[_jexsLevel]) /  MULTIPLICATION_NORMALIZATION_1E3) + 
    ((INITIAL_TOKEN_USER_AMOUNT * tklOptions[_tklLevel]) / MULTIPLICATION_NORMALIZATION_1E4)
     + ((INITIAL_TOKEN_USER_AMOUNT * web3IntrestOptions[_web3IntrestLevel]) / MULTIPLICATION_NORMALIZATION_1E4) + 
    ((INITIAL_TOKEN_USER_AMOUNT * kvtrOptions[_kvtrLevel]) / MULTIPLICATION_NORMALIZATION_1E4 ));



    if(govToken.isCallerTokenManager()) {
        amountOfTokens += INITIAL_TOKEN_USER_AMOUNT * (DSR_ADMIN_MULTIPLIER  /  MULTIPLICATION_NORMALIZATION_1E2 );
        } 
          else {
        amountOfTokens += INITIAL_TOKEN_USER_AMOUNT * (DSR_USER_MULTIPLIER / MULTIPLICATION_NORMALIZATION_1E2);
        }


      govToken.mint(receiverAddress, amountOfTokens);
      receivedInitialTokens[receiverAddress] = true;
    
      emit InitialTokensReceived(receiverAddress, amountOfTokens);
    }

    function punishMember(address user, uint256 amount) public nonReentrant onlyForInitialTokensReceivers(user) {
    govToken.burn(user, amount);
    emit UserPunished(user, amount);
    }

    function rewardUser(address user, uint256 amount) external nonReentrant onlyForInitialTokensReceivers(user) {
    govToken.mint(user, amount);
    emit UserRewarded(user, amount);
    }

    // Allows member to burn all the tokens user has and delist him of whitelist
function leaveDAO() external {
 govToken.burnOwnTokens(govToken.balanceOf(msg.sender));
  receivedInitialTokens[msg.sender] = false;
 govToken.removeFromWhitelist(msg.sender);
}

// Called in BullMQ recurring monthly token distributions
  function rewardMonthlyTokenDistribution(uint256 dailyReports, uint256 DAOVotingPartcipation, 
  uint256 DAOProposalsSucceeded, uint256 problemsSolved, uint256 issuesReported,
 uint256 allMonthMessages, address user) external isMonthlyDistributionTime  {

    // IMPLEMENT CONSTANT VARIABLES FOR THE MULTIPLIERS
    uint256 amount = dailyReports * 125e15 + DAOVotingPartcipation * 3e17 + DAOProposalsSucceeded * 175e15 + problemsSolved * 3e16 + issuesReported * 145e16 + allMonthMessages * 1e14;

  govToken.mint(user, amount);

  lastClaimedMonthlyDistributionTime[user] = block.timestamp;

  emit UserReceivedMonthlyDistribution(user, amount);
  }




}