    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.24;

    import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
    import {ERC20Permit} from "../lib/openzeppelin-contracts/contracts/token/ERC20/extensions/ERC20Permit.sol";
    import {ERC20Votes} from "../lib/openzeppelin-contracts/contracts/token/ERC20/extensions/ERC20Votes.sol";
    import {VotesExtended} from "../lib/openzeppelin-contracts/contracts/governance/utils/VotesExtended.sol";
    import {Nonces} from "../lib/openzeppelin-contracts/contracts/utils/Nonces.sol";
    import {Votes} from "../lib/openzeppelin-contracts/contracts/governance/utils/Votes.sol";
    import {AccessControl} from "../lib/openzeppelin-contracts/contracts/access/AccessControl.sol";

    contract GovernmentToken is ERC20, ERC20Permit, ERC20Votes, VotesExtended, AccessControl {

// Errors
    error SupplySurpassed();
    error AddressNonZero();
  error NotWhitelisted();
  error NotBlackListed();
  error NoProperAdminRole();
  error InvalidAmount(uint256 amount);
  
// Events
    event AdminRoleGranted(address indexed account);
    event AdminRoleRevoked(address indexed account);
    event ProposalVoteDelegated(
        address voter,
        address delegatee,
        uint256 weight
    );

// Constant values
    uint256 public constant MAX_SUPPLY = 19e24;
      bytes32 public constant MANAGE_ROLE = keccak256("MANAGE_ROLE");
      bytes32 public constant GRANTER_ROLE = keccak256("GRANTER_ROLE");

      // Mappings
      mapping(address => bool) private whitelist;
      mapping(address => bool) private blacklist;

  constructor() ERC20("BuilderToken", "BUILD") ERC20Permit("BuilderToken") {
          (bool grantedGranterRole)=  _grantRole(GRANTER_ROLE, msg.sender);
          (bool grantedManager) = _grantRole(MANAGE_ROLE, msg.sender);    
  
  if(!grantedGranterRole || !grantedManager){
revert NoProperAdminRole();
  }
} 

// Modifiers 
        modifier onlyWhitelisted(address member) {
          if(!whitelist[member]){
            revert NotWhitelisted();
          }
          _;
  }

       modifier onlyBlacklisted(address member) {
          if(!blacklist[member]){
            revert NotBlackListed();
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

    modifier onlyGranterRole() {
      if(!hasRole(GRANTER_ROLE, msg.sender)) {
        revert NoProperAdminRole();
      }
      _;
    }
    modifier isAddressNonZero(address _address) {
      if(address(0) == _address) {
        revert AddressNonZero();
      }
    _;
    }

    modifier isBalanceExceeded(uint256 amount, address memberAddress){
if(amount > balanceOf(memberAddress)){
  revert InvalidAmount(amount);
}
      _;
    }

    // Internal functions (Contract Callable)
    function _maxSupply() internal view virtual override(ERC20Votes) returns (uint256) {
      return MAX_SUPPLY;
    }

    function _mint(address account, uint256 amount) internal override(ERC20) {
    super._mint(account, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20) {
    super._burn(account, amount);
    }


    function _update(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes) {
    super._update(from, to, amount);
    }


    function _transferVotingUnits(address from, address to, uint256 amount) internal virtual onlyWhitelisted(to) override(Votes, VotesExtended) {
    super._transferVotingUnits(from, to, amount);
    }


  function _delegate(address account, address delegatee) internal  virtual override(Votes, VotesExtended) {
  super._delegate(account, delegatee);
  }


// Grant management of the token access roles 
  function grantManageRole(address account) external onlyGranterRole isAddressNonZero(account) {
    (bool grantedManagerRole)= _grantRole(MANAGE_ROLE, account);
    
    if(!grantedManagerRole){
      revert NoProperAdminRole();
    }
    
     emit AdminRoleGranted(account);
    }

// Revoke manager role
function revokeManageRole(address account) external onlyGranterRole isAddressNonZero(account) {
    (bool successfullyRevoked) =  _revokeRole(MANAGE_ROLE, account);
    
    if(successfullyRevoked){
     emit AdminRoleRevoked(account);
    }
}

// Transfer the elligibility over actions to a new granter (In deployment it is passed to a TokenManager Contract)
function transferGranterRole(address newGranter) external onlyGranterRole isAddressNonZero(newGranter) {
(bool succefullGranter) = _grantRole(GRANTER_ROLE, newGranter);
(bool grantedManager) = _grantRole(MANAGE_ROLE, newGranter);

if(succefullGranter){
 (bool revokedGranter) = _revokeRole(GRANTER_ROLE, msg.sender);
}
}

// Addition of the user only possible if Admin calls the transaction.
function addToWhitelist(address user) public onlyManageRole isAddressNonZero(user) {
      whitelist[user] = true;
}

function removeFromWhitelist(address user) public onlyManageRole onlyWhitelisted(user){
  whitelist[user]=false;
}

function addBlacklist(address user) public onlyManageRole isAddressNonZero(user) {
if(whitelist[user]){
    removeFromWhitelist(user);
}
      blacklist[user] = true;
}
function removeFromBlacklist(address user) public onlyManageRole onlyBlacklisted(user){
  blacklist[user]=false;
}
function mint(address account, uint256 amount) external mintOnlyBelowMaxSupply(amount) onlyManageRole onlyWhitelisted(account) {
_mint(account, amount);
}

function burn(address account, uint256 amount) external onlyManageRole isBalanceExceeded(amount, account) onlyWhitelisted(account) {
_burn(account, amount);
}

function burnOwnTokens (uint256 amount) isBalanceExceeded(amount, msg.sender) external {
  _burn(msg.sender, amount);
}

// User to see how big percentage of voting power does particular user have.
    function readMemberInfluence(address user) external view returns (uint256) {
      return _getVotingUnits(user);
    }

    function nonces(address _owner) public view override(ERC20Permit, Nonces) returns (uint256) {
    return super.nonces(_owner);
    }

  function delegate(address delegatee) public onlyWhitelisted(delegatee) override(Votes) {
   _delegate(msg.sender, delegatee);

   if(delegatee != msg.sender){
    emit ProposalVoteDelegated(msg.sender, delegatee, balanceOf(msg.sender));
   }
    }

// Returns value to check whether the caller has a role of manager
function isCallerTokenManager() public view returns (bool){
return hasRole(MANAGE_ROLE, msg.sender);
}

    }