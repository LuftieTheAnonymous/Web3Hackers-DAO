// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

    import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
    import {GovernmentToken} from "./GovToken.sol";
    import {AccessControl} from "../lib/openzeppelin-contracts/contracts/access/AccessControl.sol";
    import {ECDSA} from "../lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
    import {EIP712} from "../lib/openzeppelin-contracts/contracts/utils/cryptography/EIP712.sol";



contract TokenManager is EIP712, AccessControl, ReentrancyGuard {
    using ECDSA for bytes32;

  // Events
    event InitialTokensReceived(address indexed account, uint256 indexed amount);
    event MemberRewarded(address indexed account, uint256 indexed amount);
    event MemberReceivedMonthlyDistribution(address indexed account, uint256 indexed amount);
    event BotSignerRotated(address previousBotSigner, address currentBotSigner);
    event MemberPunished(address indexed member, uint256 indexed amount);
    // Errors
    error MonthlyDistributionNotReady();
    error IntialTokensNotReceived();
    error UnelligibleToCall();
    error VoucherExpired();
    error InvalidSigner(address signerAddress, address botSigner);
    error AlreadyReceivedInitialTokens();

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

    // Structs
    struct Voucher {
        address receiver;
        uint256 expiryBlock;
        bool isAdmin;
        uint8 psrLevel;
        uint8 jexsLevel;
        uint8 tklLevel;
        uint8 web3Level;
        uint8 kvtrLevel;
    }

    uint256 private constant INITIAL_TOKEN_USER_AMOUNT = 1e21;
    uint256 private constant MALICIOUS_ACTIONS_LIMIT = 3;
    uint256 private constant DSR_ADMIN_MULTIPLIER = 35;
    uint256 private constant DSR_USER_MULTIPLIER = 25 ;
    uint256 private constant MULTIPLICATION_NORMALIZATION_1E2=1e2;
    uint256 private constant MULTIPLICATION_NORMALIZATION_1E3=1e3;
    uint256 private constant MULTIPLICATION_NORMALIZATION_1E4=1e4;
    uint256 private constant ONE_MONTH_IN_BLOCKS = 84600; 
    uint256 private constant DAILY_REPORT_MULTIPLIER = 125e14;
    uint256 private constant VOTING_PARTICIPATION_MULTIPLIER= 175e15;
    uint256 private constant PROBLEMS_SOLVED_MULTIPLIER = 2e17;
    uint256 private constant RESOURCE_SHARED_MULTIPLIER = 145e15;
    uint256 private constant ALL_MONTH_MESSAGES_MULTIPLIER = 1e14;

    uint256 private constant ACTIVE_VOICE_CHAT_PARTICIPATION_MULTIPLIER = 5e14;

    bytes32 public constant VOUCHER_TYPEHASH = keccak256(
        "Voucher(address receiver,uint256 expiryBlock,bool isAdmin,uint8 psrLevel,uint8 jexsLevel,uint8 tklLevel,uint8 web3Level,uint8 kvtrLevel)"
    );
    bytes32 private constant controller = keccak256("controller");
    address private botSigner;
    GovernmentToken govToken;

    // mappings
    mapping(address => bool) private receivedInitialTokens;
    mapping(address => uint256) private lastClaimedMonthlyDistributionTime;
    mapping(TokenReceiveLevel => uint256) private psrOptions;
    mapping(TokenReceiveLevel => uint256) private jexsOptions;
    mapping(TechnologyKnowledgeLevel => uint256) private tklOptions;
    mapping(TokenReceiveLevel => uint256) private web3IntrestOptions;
    mapping(KnowledgeVerificationTestRate => uint256) private kvtrOptions;




    constructor(address governmentTokenAddr, address standardGovernorContractAddr, address customGovernorContractAddress, address botAddress) EIP712("Web3HackersDAO", "1") {
      govToken = GovernmentToken(governmentTokenAddr);
      botSigner = botAddress;
      _grantRole(controller, standardGovernorContractAddr);
      _grantRole(controller, customGovernorContractAddress);
      _grantRole(controller, botAddress);

       // Programming Seniority Level (PSR) options
          psrOptions[TokenReceiveLevel.LOW] = 0;
          psrOptions[TokenReceiveLevel.MEDIUM_LOW] = 40;
          psrOptions[TokenReceiveLevel.MEDIUM] = 75;
          psrOptions[TokenReceiveLevel.HIGH] = 130;

    // Job Experience Seniority Level (JEXS) options
          jexsOptions[TokenReceiveLevel.LOW] = 0;
          jexsOptions[TokenReceiveLevel.MEDIUM_LOW] = 50;
          jexsOptions[TokenReceiveLevel.MEDIUM] = 65;
          jexsOptions[TokenReceiveLevel.HIGH] = 90;

        // TKL options
        tklOptions[TechnologyKnowledgeLevel.LOW_KNOWLEDGE] = 0;
        tklOptions[TechnologyKnowledgeLevel.HIGHER_LOW_KNOWLEDGE] = 45;
        tklOptions[TechnologyKnowledgeLevel.MEDIUM_KNOWLEDGE] = 200;
        tklOptions[TechnologyKnowledgeLevel.HIGH_KNOWLEDGE] = 500;
        tklOptions[TechnologyKnowledgeLevel.EXPERT_KNOWLEDGE] = 1000;

        // WI - Web3 Interest options
        web3IntrestOptions[TokenReceiveLevel.LOW] = 0;
        web3IntrestOptions[TokenReceiveLevel.MEDIUM_LOW] = 100;
        web3IntrestOptions[TokenReceiveLevel.MEDIUM] = 500;
        web3IntrestOptions[TokenReceiveLevel.HIGH] = 1500;

        // Knowledge Verification Test Rate (KVTR) options
        kvtrOptions[KnowledgeVerificationTestRate.LOW] = 0;
        kvtrOptions[KnowledgeVerificationTestRate.MEDIUM_LOW] = 25;
        kvtrOptions[KnowledgeVerificationTestRate.MEDIUM] = 50;
        kvtrOptions[KnowledgeVerificationTestRate.MEDIUM_HIGH] = 100;
        kvtrOptions[KnowledgeVerificationTestRate.HIGH] = 500;
        kvtrOptions[KnowledgeVerificationTestRate.VERY_HIGH] = 650;
        kvtrOptions[KnowledgeVerificationTestRate.EXPERT] = 750;
        kvtrOptions[KnowledgeVerificationTestRate.EXPERT_PLUS] = 1000;

    }


    modifier isMonthlyDistributionTime(address user) {
      if(lastClaimedMonthlyDistributionTime[user] != 0 && block.number - lastClaimedMonthlyDistributionTime[user] < ONE_MONTH_IN_BLOCKS){
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

modifier onlyGovernor {
if(!hasRole(controller, msg.sender)){
  revert UnelligibleToCall();
}
  _;
}

modifier onlyBotSigner(address signerAddress){
if(signerAddress != botSigner){
  revert UnelligibleToCall();
}
  _;
}


// Performed by admin in order to deprive user of his tokens and delist him out of whitelist.
function kickOutFromDAO(address user) external onlyGovernor {
govToken.burn(user, govToken.balanceOf(user));
receivedInitialTokens[user] = false;
govToken.addBlacklist(user);
}

function burnTokensOnLeave(address user) external onlyBotSigner(msg.sender){
govToken.burn(user, govToken.balanceOf(user));
receivedInitialTokens[user] = false;
govToken.removeFromWhitelist(user);
}

function setBotSigner(address newAddress) external onlyBotSigner(msg.sender) {
address old = botSigner;
botSigner = newAddress;
emit BotSignerRotated(old, newAddress);
}

// Public functions (User-Interactive)
function handInUserInitialTokens(
Voucher calldata voucherData,
bytes calldata signature
) external nonReentrant  {

if(voucherData.expiryBlock <= block.number){
 revert VoucherExpired(); 
}

bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
  VOUCHER_TYPEHASH,
      voucherData.receiver,
              voucherData.expiryBlock,
              voucherData.isAdmin,
              voucherData.psrLevel,
              voucherData.jexsLevel,
              voucherData.tklLevel,
              voucherData.web3Level,
              voucherData.kvtrLevel
)));


    address signer = ECDSA.recover(digest, signature);

    if(signer != botSigner){
      revert InvalidSigner(signer, botSigner);
    }

     if (receivedInitialTokens[voucherData.receiver] == true) {
       revert AlreadyReceivedInitialTokens();
    }


    uint256 psrBonus = (INITIAL_TOKEN_USER_AMOUNT * psrOptions[TokenReceiveLevel(voucherData.psrLevel)]) / MULTIPLICATION_NORMALIZATION_1E2;
    uint256 jexsBonus = (INITIAL_TOKEN_USER_AMOUNT * jexsOptions[TokenReceiveLevel(voucherData.jexsLevel)]) / MULTIPLICATION_NORMALIZATION_1E3;
    uint256 tklBonus = (INITIAL_TOKEN_USER_AMOUNT * tklOptions[TechnologyKnowledgeLevel(voucherData.tklLevel)]) / MULTIPLICATION_NORMALIZATION_1E4;
    uint256 web3Bonus = (INITIAL_TOKEN_USER_AMOUNT * web3IntrestOptions[TokenReceiveLevel(voucherData.web3Level)]) / MULTIPLICATION_NORMALIZATION_1E4;
    uint256 kvtrBonus = (INITIAL_TOKEN_USER_AMOUNT * kvtrOptions[KnowledgeVerificationTestRate(voucherData.kvtrLevel)]) / MULTIPLICATION_NORMALIZATION_1E4;
    
    uint256 amountOfTokens = INITIAL_TOKEN_USER_AMOUNT + psrBonus + jexsBonus + tklBonus + web3Bonus + kvtrBonus;



    if(voucherData.isAdmin) {
        amountOfTokens += (INITIAL_TOKEN_USER_AMOUNT * DSR_ADMIN_MULTIPLIER) /  MULTIPLICATION_NORMALIZATION_1E2;
        } 
          else {
        amountOfTokens += (INITIAL_TOKEN_USER_AMOUNT * DSR_USER_MULTIPLIER) / MULTIPLICATION_NORMALIZATION_1E3;
        }


      govToken.mint(voucherData.receiver, amountOfTokens);
      receivedInitialTokens[voucherData.receiver] = true;
    
      emit InitialTokensReceived(voucherData.receiver, amountOfTokens);
    }

    function punishMember(address user, uint256 amount) public onlyGovernor onlyForInitialTokensReceivers(user) {
    govToken.burn(user, amount);
    emit MemberPunished(user, amount);
    }

    function rewardUser(address user, uint256 amount) external onlyGovernor onlyForInitialTokensReceivers(user) {
    govToken.mint(user, amount);
    emit MemberRewarded(user, amount);
    }

    // Allows member to burn all the tokens user has and delist him of whitelist
function leaveDAO() external {
 govToken.burnOwnTokens(govToken.balanceOf(msg.sender));
  receivedInitialTokens[msg.sender] = false;
 govToken.removeFromWhitelist(msg.sender);
}

function getAnticipatedReward(uint256 dailyReports, uint256 daoVotingPartcipation, 
  uint256 daoProposalsSucceeded, uint256 problemsSolved, uint256 resourceShareAmount,
 uint256 allMonthMessages, uint256 activeVoiceChatParticipation) public pure returns (uint256){
  uint256 amount = (dailyReports * DAILY_REPORT_MULTIPLIER) + (daoVotingPartcipation * VOTING_PARTICIPATION_MULTIPLIER) +
  (daoProposalsSucceeded * VOTING_PARTICIPATION_MULTIPLIER) + 
  (problemsSolved * PROBLEMS_SOLVED_MULTIPLIER) +
  (resourceShareAmount * RESOURCE_SHARED_MULTIPLIER) + 
  (allMonthMessages * ALL_MONTH_MESSAGES_MULTIPLIER) + 
  (activeVoiceChatParticipation * ACTIVE_VOICE_CHAT_PARTICIPATION_MULTIPLIER);
return amount;
}


// Called in BullMQ recurring monthly token distributions
  function rewardMonthlyTokenDistribution(uint256 dailyReports, 
  uint256 daoVotingPartcipation, 
  uint256 daoProposalsSucceeded,
   uint256 problemsSolved, uint256 resourceShareAmount,
 uint256 allMonthMessages, uint256 activeVoiceChatParticipation, address user) external onlyBotSigner(msg.sender) onlyForInitialTokensReceivers(user) isMonthlyDistributionTime(user) {
    uint256 amount = getAnticipatedReward(dailyReports, daoVotingPartcipation, daoProposalsSucceeded, problemsSolved, resourceShareAmount, allMonthMessages, activeVoiceChatParticipation);

  govToken.mint(user, amount);

  lastClaimedMonthlyDistributionTime[user] = block.number;


  emit MemberReceivedMonthlyDistribution(user, amount);
  }




}