import {Contract, ethers} from "ethers";
import dotenv from "dotenv";
import { GOVERNOR_CONTRACT_ADDRESS, governorContractAbi } from "../contracts/governor/config.js";
import { TOKEN_CONTRACT_ADDRESS, tokenContractAbi } from "../contracts/token/config.js";

dotenv.config();

export const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);

export const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

export const governorContractInterface =new ethers.Interface(governorContractAbi);

export const daoContract = new Contract(GOVERNOR_CONTRACT_ADDRESS as `0x${string}`, governorContractInterface, wallet);

export const governorTokenContract = new Contract(TOKEN_CONTRACT_ADDRESS as `0x${string}`, tokenContractAbi, wallet);


export const proposalStates: ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Executed"] = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Executed"];