// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;
import {StandardGovernor} from "../src/governor/interaction-contracts/StandardGovernor.sol";
import {GovernmentToken} from "../src/GovToken.sol";
import {TokenManager} from "../src/TokenManager.sol";
import {DeployStandardDaoContracts} from "../script/DeployStandardDaoContracts.s.sol";
import {Test, console} from "../lib/forge-std/src/Test.sol";
import "../lib/openzeppelin-contracts/contracts/utils/Strings.sol";



contract DaoTesting is Test {
StandardGovernor standardGovernor;
GovernmentToken govToken;
TokenManager tokenManager;
DeployStandardDaoContracts deployContract;

    uint256 sepoliaEthFork;
address user = makeAddr("user");
address validBotAddress = vm.envAddress("BOT_ADDRESS");

function setUp() public {
sepoliaEthFork=vm.createSelectFork("ETH_ALCHEMY_SEPOLIA_RPC_URL");
deployContract = new DeployStandardDaoContracts();
(standardGovernor, govToken, tokenManager)=deployContract.run();

vm.makePersistent(validBotAddress);
}

function testGranterRole() public view {

assert(govToken.hasRole(govToken.GRANTER_ROLE(), address(tokenManager)) == true);
assert(govToken.hasRole(govToken.MANAGE_ROLE(), msg.sender) == true);
assert(govToken.hasRole(govToken.MANAGE_ROLE(), user) != true);
}


function getVoucherSignature(
address receiver,
string memory isAdmin,
uint256 psrLevel,
uint256 jexsLevel,
uint256 tklLevel,
uint256 web3Level,
uint256 kvtrLevel

) public returns (bytes memory, uint256){
    uint256 expiryTime = block.number + 350;

    string[] memory inputs = new string[](12);
    inputs[0] = "npx";
    inputs[1]="tsx";
    inputs[2] = "../test-ts-scripts/generateSignedTx.ts";
    inputs[3]= Strings.toHexString(address(tokenManager));
    inputs[4] = Strings.toHexString(receiver);
    inputs[5] = isAdmin;
    inputs[6] = Strings.toString(psrLevel);
    inputs[7] = Strings.toString(jexsLevel);
    inputs[8]  = Strings.toString(tklLevel);
    inputs[9] = Strings.toString(web3Level);
    inputs[10] = Strings.toString(kvtrLevel);
    inputs[11] = Strings.toString(expiryTime);

bytes memory result = vm.ffi(inputs);
(bytes memory signature) = abi.decode(result, (bytes));

return (signature, expiryTime);


}

function testReceiveInitialTokensAndRevertCases() public {

vm.expectRevert();
govToken.addToWhitelist(user);

vm.expectRevert();
govToken.addBlacklist(user);


vm.prank(validBotAddress);
govToken.addToWhitelist(user);

(bytes memory signature, uint256 expiryBlock) = getVoucherSignature(user, "false", 0, 0, 0, 0, 0);

TokenManager.Voucher memory voucherFlawed = TokenManager.Voucher(
        user,
        expiryBlock,
        true,
        0,
        0,
        0,
        0,
        0
    );

vm.expectRevert();
tokenManager.handInUserInitialTokens(voucherFlawed, signature);

TokenManager.Voucher memory voucherCorrect = TokenManager.Voucher(
        user,
        expiryBlock,
        false,
        0,
        0,
        0,
        0,
        0
    );

tokenManager.handInUserInitialTokens(voucherCorrect, signature);

vm.expectRevert();
tokenManager.handInUserInitialTokens(voucherCorrect, signature);


vm.expectRevert();
tokenManager.kickOutFromDAO(user);
}


}