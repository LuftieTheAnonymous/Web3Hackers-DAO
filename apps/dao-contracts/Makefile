deploy-token-sepolia:
	forge script script/DeployToken.s.sol \
		--rpc-url $(ETH_ALCHEMY_SEPOLIA_RPC_URL) \
		--sender 0x7789884c5c88AE84775F266045b96fD6Cb5C734b \
		--account actionWallet \
		--broadcast \
		-vvvvv \
		--verify \
		--etherscan-api-key $(ETHER_SCAN_API_KEY) \
		--via-ir

deploy-custom-sepolia:
	forge script script/DeployCustomDaoContracts.s.sol \
		--rpc-url $(ETH_ALCHEMY_SEPOLIA_RPC_URL) \
		--sender 0x7789884c5c88AE84775F266045b96fD6Cb5C734b \
		--account actionWallet \
		--broadcast \
		-vvvvv \
		--verify \
		--etherscan-api-key $(ETHER_SCAN_API_KEY) \
		--via-ir

deploy-standard-sepolia:
	forge script script/DeployStandardDaoContracts.s.sol \
		--rpc-url $(ETH_ALCHEMY_SEPOLIA_RPC_URL) \
		--sender 0x7789884c5c88AE84775F266045b96fD6Cb5C734b \
		--account actionWallet \
		--broadcast \
		-vvvvv \
		--verify \
		--etherscan-api-key $(ETHER_SCAN_API_KEY) \
		--via-ir

assign-roles-sepolia:
	forge script script/AssignRolesToGovToken.s.sol \
		--rpc-url $(ETH_ALCHEMY_SEPOLIA_RPC_URL) \
		--sender 0x7789884c5c88AE84775F266045b96fD6Cb5C734b \
		--account actionWallet \
		--broadcast \
		-vvvvv \
		--verify \
		--etherscan-api-key $(ETHER_SCAN_API_KEY) \
		--via-ir

deploy-token-manager-sepolia:
	forge script script/DeployTokenManager.s.sol \
		--rpc-url $(ETH_ALCHEMY_SEPOLIA_RPC_URL) \
		--sender 0x7789884c5c88AE84775F266045b96fD6Cb5C734b \
		--account actionWallet \
		--broadcast \
		-vvvvv \
		--verify \
		--etherscan-api-key $(ETHER_SCAN_API_KEY) \
		--via-ir
