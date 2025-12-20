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
    uint256 private constant DSR_USER_MULTIPLIER = 5 ;
    uint256 private constant MULTIPLICATION_NORMALIZATION_1E2=1e2;
    uint256 private constant MULTIPLICATION_NORMALIZATION_1E3=1e3;
    uint256 private constant MULTIPLICATION_NORMALIZATION_1E4=1e4;
    uint256 private constant ONE_MONTH_IN_BLOCKS = 84600; 


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


    constructor(address governmentTokenAddr, address governorContractAddr, address botAddress) EIP712("Web3HackersDAO", "1") {
      govToken = GovernmentToken(governmentTokenAddr);
      botSigner = botAddress;
      _grantRole(controller, governorContractAddr);
      _grantRole(controller, botAddress);
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


      // IMPLEMENT CONSTANT VARIABLE FOR 1E2, 1E3 AND 1E4
    uint256 amountOfTokens = 
    INITIAL_TOKEN_USER_AMOUNT + (((INITIAL_TOKEN_USER_AMOUNT * psrOptions[TokenReceiveLevel(voucherData.psrLevel)]) / MULTIPLICATION_NORMALIZATION_1E2) + 
    ((INITIAL_TOKEN_USER_AMOUNT * jexsOptions[TokenReceiveLevel(voucherData.jexsLevel)]) /  MULTIPLICATION_NORMALIZATION_1E3) + 
    ((INITIAL_TOKEN_USER_AMOUNT * tklOptions[TechnologyKnowledgeLevel(voucherData.tklLevel)]) / MULTIPLICATION_NORMALIZATION_1E4)
     + ((INITIAL_TOKEN_USER_AMOUNT * web3IntrestOptions[TokenReceiveLevel(voucherData.web3Level)]) / MULTIPLICATION_NORMALIZATION_1E4) + 
    ((INITIAL_TOKEN_USER_AMOUNT * kvtrOptions[KnowledgeVerificationTestRate(voucherData.kvtrLevel)]) / MULTIPLICATION_NORMALIZATION_1E4 ));



    if(voucherData.isAdmin) {
        amountOfTokens += (INITIAL_TOKEN_USER_AMOUNT * DSR_ADMIN_MULTIPLIER) /  MULTIPLICATION_NORMALIZATION_1E2;
        } 
          else {
        amountOfTokens += (INITIAL_TOKEN_USER_AMOUNT * DSR_USER_MULTIPLIER) / MULTIPLICATION_NORMALIZATION_1E2;
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

// Called in BullMQ recurring monthly token distributions
  function rewardMonthlyTokenDistribution(uint256 dailyReports, uint256 DAOVotingPartcipation, 
  uint256 DAOProposalsSucceeded, uint256 problemsSolved, uint256 issuesReported,
 uint256 allMonthMessages, address user) external onlyBotSigner(msg.sender) onlyForInitialTokensReceivers(user) isMonthlyDistributionTime(user) {
    uint256 amount = (dailyReports * 125e15) + (DAOVotingPartcipation * 3e17) + (DAOProposalsSucceeded * 175e15) + (problemsSolved * 3e16) + (issuesReported * 145e16) + (allMonthMessages * 1e14);

  govToken.mint(user, amount);

  lastClaimedMonthlyDistributionTime[user] = block.number;


  emit MemberReceivedMonthlyDistribution(user, amount);
  }




}