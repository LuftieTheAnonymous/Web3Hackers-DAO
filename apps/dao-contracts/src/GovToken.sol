    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.24;

    import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
    import {ERC20Permit} from "../lib/openzeppelin-contracts/contracts/token/ERC20/extensions/ERC20Permit.sol";
    import {ERC20Votes} from "../lib/openzeppelin-contracts/contracts/token/ERC20/extensions/ERC20Votes.sol";
    import {VotesExtended} from "../lib/openzeppelin-contracts/contracts/governance/utils/VotesExtended.sol";
    import {Nonces} from "../lib/openzeppelin-contracts/contracts/utils/Nonces.sol";
    import {Votes} from "../lib/openzeppelin-contracts/contracts/governance/utils/Votes.sol";
    import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
    import {AccessControl} from "../lib/openzeppelin-contracts/contracts/access/AccessControl.sol";


    import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

  import {Pausable} from "../lib/openzeppelin-contracts/contracts/utils/Pausable.sol";


    contract GovernmentToken is ERC20, ERC20Permit, ERC20Votes, VotesExtended, AccessControl, Ownable, ReentrancyGuard, Pausable {

    error IntialTokensAlreadyReceived();
    error IntialTokensNotReceived();
    error MaliciousActionsLimitReached();
    error MonthlyDistributionNotReady();
    error SupplySurpassed();
    error AddressNonZero();
  error NotWhitelisted();
  error NoProperAdminRole();


    event InitialTokensReceived(address indexed account);
    event UserRewarded(address indexed account, uint256 indexed amount);
    event UserPunished(address indexed account, uint256 indexed amount);
    event UserReceivedMonthlyDistribution(address indexed account, uint256 indexed amount);
    event AdminRoleGranted(address indexed account);
    event AdminRoleRevoked(address indexed account);
    event MaliciousCounterIncreased(address indexed account);

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

      uint256 private constant initial_token_user_amount = 1000 * 10**18;
      uint256 private constant malicious_actions_limit = 3;
      uint256 private constant MAX_SUPPLY = 19 * 10**24;
      uint256 private constant DSR_ADMIN_MULTIPLIER = 35;
      uint256 private constant DSR_USER_MULTIPLIER = 5 ;
      uint256 private monthly_distribution_timestamp; 
      bytes32 public constant MANAGE_ROLE = keccak256("MANAGE_ROLE");

      mapping(address => bool) private receivedInitialTokens;
      mapping(address=>uint256) public userMaliciousActions;
      mapping(address => bool) private whitelist;
    mapping(TokenReceiveLevel => uint256) private psrOptions;
    mapping(TokenReceiveLevel => uint256) private jexsOptions;
    mapping(TechnologyKnowledgeLevel => uint256) private tklOptions;
    mapping(TokenReceiveLevel => uint256) private web3IntrestOptions;
    mapping(KnowledgeVerificationTestRate => uint256) private kvtrOptions;

  mapping(address => uint256) private lastClaimedTime;

        constructor() ERC20("BuilderToken", "BUILD") Ownable(msg.sender) ERC20Permit("BuilderToken") {
          // Programming Seniority Level (PSR) options
          psrOptions[TokenReceiveLevel.LOW] = 15;
          psrOptions[TokenReceiveLevel.MEDIUM_LOW] = 40;
          psrOptions[TokenReceiveLevel.MEDIUM] = 75;
          psrOptions[TokenReceiveLevel.HIGH] = 130;

    // Job Experience Seniority Level (JEXS) options
          jexsOptions[TokenReceiveLevel.LOW] = 30;
          jexsOptions[TokenReceiveLevel.MEDIUM_LOW] = 50;
          jexsOptions[TokenReceiveLevel.MEDIUM] = 65;
          jexsOptions[TokenReceiveLevel.HIGH] = 90;

        // TKL options
        tklOptions[TechnologyKnowledgeLevel.LOW_KNOWLEDGE] = 50;
        tklOptions[TechnologyKnowledgeLevel.HIGHER_LOW_KNOWLEDGE] = 75;
        tklOptions[TechnologyKnowledgeLevel.MEDIUM_KNOWLEDGE] = 200;
        tklOptions[TechnologyKnowledgeLevel.HIGH_KNOWLEDGE] = 500;
        tklOptions[TechnologyKnowledgeLevel.EXPERT_KNOWLEDGE] = 1000;

        // WI - Web3 Interest options
        web3IntrestOptions[TokenReceiveLevel.LOW] = 75;
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
        
        _grantRole(MANAGE_ROLE, msg.sender);
        } 

        modifier hasExceededSupply(){
          if(totalSupply() > MAX_SUPPLY) {
            revert SupplySurpassed();
            }
            _;
        }

        modifier rewardOnlyInitialTokensReceivers(address member) {
    if(!receivedInitialTokens[member] && whitelist[member] == false) {
        revert IntialTokensNotReceived(); 
    }
    _;
        }

        modifier onlyWhitelisted(address member) {
          if(!whitelist[member]){
            revert NotWhitelisted();
          }
          _;

          }

          modifier mintOnlyBelowMaxSupply(uint256 mintedTokens) {
          if(totalSupply() + mintedTokens > MAX_SUPPLY) {
            revert SupplySurpassed();
          }
            _;
                }

    modifier onlyManageRole() {
      if(!hasRole(MANAGE_ROLE, msg.sender)) {
        revert NoProperAdminRole();
      }
      _;
    }

    modifier isMonthlyDistributionTime() {
      if(block.timestamp - lastClaimedTime[msg.sender] < 30 * 24 * 60 * 60){
        revert MonthlyDistributionNotReady();
      }
      _;
    }


modifier isAddressNonZero(address _address) {
if(address(0) == _address) {
        revert AddressNonZero();
      }
    _;
    }

  function grantManageRole(address account) public onlyOwner isAddressNonZero(account) {
      _grantRole(MANAGE_ROLE, account);
      emit AdminRoleGranted(account);
    }

  function revokeManageRole(address account) public onlyOwner isAddressNonZero(account) {
      _revokeRole(MANAGE_ROLE, account);
      emit AdminRoleRevoked(account);
    }

    function addToWhitelist(address user) public onlyManageRole  isAddressNonZero(user) {
      whitelist[user] = true;
    }

    function removeFromWhitelist(address user) public onlyManageRole isAddressNonZero(user)  {
      whitelist[user] = false;
    }



    function totalSupply () public view virtual override(ERC20) returns (uint256) {
      return super.totalSupply();
    }


    function decimals() public view virtual override(ERC20) returns (uint8) {
      return 18;
    }



    // Internal functions (Contract Callable)
    function _maxSupply() internal view virtual override(ERC20Votes) returns (uint256) {
      return MAX_SUPPLY;
    }

    function _mint(address account, uint256 amount) internal override(ERC20) mintOnlyBelowMaxSupply(amount) hasExceededSupply {
    super._mint(account, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20) {
    super._burn(account, amount);
    }


    function _update(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes) {
    super._update(from, to, amount);
    }


    function _transferVotingUnits(address from, address to, uint256 amount) internal  virtual override(Votes, VotesExtended) {
    super._transferVotingUnits(from, to, amount);
    }


      function _getVotingUnits(address account) internal view override(Votes, ERC20Votes) returns (uint256) {
        return super._getVotingUnits(account);
      }

    function _delegate(address account, address delegatee) internal virtual override(Votes, VotesExtended) {
    super._delegate(account, delegatee);
    }

        function _pause() internal virtual override(Pausable) {
      super._pause();
    }

    function _unpause() internal virtual override(Pausable) {
      super._unpause();
    }



function pause() external onlyOwner {
      _pause();
    }

function unpause() external onlyOwner {
      _unpause();
}

      // Public functions (User-Interactive)
    function handInUserInitialTokens(TokenReceiveLevel _psrLevel, TokenReceiveLevel _jexsLevel, TechnologyKnowledgeLevel _tklLevel, TokenReceiveLevel _web3IntrestLevel, KnowledgeVerificationTestRate _kvtrLevel, address receiverAddress) external isAddressNonZero(receiverAddress) onlyWhitelisted(receiverAddress)    {
        if (receivedInitialTokens[receiverAddress] == true) {
        punishMember(receiverAddress, initial_token_user_amount / 10);
        emit UserPunished(receiverAddress, initial_token_user_amount / 10);
        return;
    }

    uint256 amountOfTokens = initial_token_user_amount + (((initial_token_user_amount * psrOptions[_psrLevel]) / 1e2) + ((initial_token_user_amount * jexsOptions[_jexsLevel]) / 1e3) + ((initial_token_user_amount * tklOptions[_tklLevel]) / 1e4) + ((initial_token_user_amount * web3IntrestOptions[_web3IntrestLevel]) / 1e4) + ((initial_token_user_amount * kvtrOptions[_kvtrLevel]) / 1e4));

      if (totalSupply() + amountOfTokens > MAX_SUPPLY) {
            revert SupplySurpassed();
          }

    if(!hasRole(MANAGE_ROLE, msg.sender)) {
            amountOfTokens += initial_token_user_amount * (DSR_ADMIN_MULTIPLIER  / 1e2);
          } else {
            amountOfTokens += initial_token_user_amount * (DSR_USER_MULTIPLIER / 1e2);
          }


      _mint(receiverAddress, amountOfTokens);
      receivedInitialTokens[receiverAddress] = true;
    lastClaimedTime[receiverAddress] = block.timestamp;
      emit InitialTokensReceived(receiverAddress);
    }

    function punishMember(address user, uint256 amount) public nonReentrant  {
    if(super.balanceOf(user) < amount) {
            _burn(user, super.balanceOf(user));
            return;
      }

      if (userMaliciousActions[user] >= malicious_actions_limit)  {
        _burn(user, super.balanceOf(user));
      } else {
        _burn(user, amount);
        userMaliciousActions[user] += 1;
        emit UserPunished(user, amount);
      }
    }

    function rewardUser(address user, uint256 amount) public nonReentrant  rewardOnlyInitialTokensReceivers(user) {
      _mint(user, amount);
    emit UserRewarded(user, amount);
    }

  function rewardMonthlyTokenDistribution(uint256 dailyReports, uint256 DAOVotingPartcipation, uint256 DAOProposalsSucceeded, uint256 problemsSolved, uint256 issuesReported, uint256 vcMinutes, uint256 avgMessagesPerDay, address user) external isMonthlyDistributionTime onlyManageRole nonReentrant  {

    uint256 amount = dailyReports * 125e16 + DAOVotingPartcipation * 3e18 + DAOProposalsSucceeded * 175e16 + problemsSolved * 3e18 + issuesReported * 145e16 + vcMinutes * 1e17 + avgMessagesPerDay * 1e14;

  _mint(user, amount);

  lastClaimedTime[user] = block.timestamp;

  emit UserReceivedMonthlyDistribution(user, amount);
  }

    function increaseUserMaliciousActions(address user) public onlyManageRole  {  
      userMaliciousActions[user] += 1;
      emit MaliciousCounterIncreased(user);
    }

    function readMemberInfluence(address user) public view returns (uint256) {
      return _getVotingUnits(user);
    }

    function transfer(address to, uint256 amount) public override(ERC20) returns (bool) {
    return super.transfer(to, amount);
    }

    function approve(address spender, uint256 amount) public override(ERC20) returns (bool) {
    return super.approve(spender, amount);
    }

    function nonces(address _owner) public view virtual override(ERC20Permit, Nonces) returns (uint256) {
    return super.nonces(_owner);
    }

    function delegate(address delegatee) public virtual override(Votes) {
      super.delegate(delegatee);
    }


    function getPastBalanceOf(address account, uint256 timepoint) public view virtual override(VotesExtended) returns (uint256) {
      return super.getPastBalanceOf(account, timepoint);
    }

    function getPastVotes(address account, uint256 timepoint) public view virtual override(Votes) returns (uint256) {
      return super.getPastVotes(account, timepoint);
    }



    }