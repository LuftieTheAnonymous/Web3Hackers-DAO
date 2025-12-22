import {Contract, ethers} from "ethers";
import dotenv from "dotenv";
import { STANDARD_GOVERNOR_CONTRACT_ABI, STANDARD_GOVERNOR_CONTRACT_ADDRESS } from "../contracts-data/governor/standardGovenorConfig.js";
import { TOKEN_CONTRACT_ADDRESS, tokenContractAbi } from "../contracts-data/token/config.js";
import { TOKEN_MANAGER_ABI, TOKEN_MANAGER_CONTRACT_ADDRESS } from "../contracts-data/tokenManager/config.js";
import { CUSTOM_GOVERNOR_ABI, CUSTOM_GOVERNOR_ADDRESS } from "../contracts-data/governor/customGovernorConfig.js";

dotenv.config();

export const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);

export const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

export const standardGovernorContract = new Contract(STANDARD_GOVERNOR_CONTRACT_ADDRESS as `0x${string}`, STANDARD_GOVERNOR_CONTRACT_ABI, wallet);

export const customGovernorContract = new Contract(CUSTOM_GOVERNOR_ADDRESS as `0x${string}`, CUSTOM_GOVERNOR_ABI, wallet);

export const governorTokenContract = new Contract(TOKEN_CONTRACT_ADDRESS as `0x${string}`, tokenContractAbi, wallet);

export const tokenManagerContract = new Contract(TOKEN_MANAGER_CONTRACT_ADDRESS, TOKEN_MANAGER_ABI, wallet);


export const proposalStates: ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Executed"] = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Executed"];