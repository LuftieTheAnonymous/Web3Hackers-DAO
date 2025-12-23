import { standardGovernorContract, customGovernorContract } from "../config/ethersConfig.js";
import dotenv from "dotenv";
import { onActivatedProposal, onCreateProposal, onProposalCanceled, onProposalExecuted, onProposalQueued, onProposalSucceeded } from "./actions/governor/governorOnEventCallbacks.js";

dotenv.config();


export const executeGovenorContractEvents=()=>{

standardGovernorContract.on("ProposalCreated", async (proposalId)=>{
  await onCreateProposal(proposalId, standardGovernorContract);
});

customGovernorContract.on('ProposalCreated', async(proposalId)=>{
  await onCreateProposal(proposalId, customGovernorContract);
});

standardGovernorContract.on("ProposalActivated", async(proposalId)=>{
  await onActivatedProposal(proposalId, standardGovernorContract);
});

customGovernorContract.on('ProposalCreated', async(proposalId)=>{
  await onActivatedProposal(proposalId, customGovernorContract);
});

standardGovernorContract.on("ProposalSucceeded", async (proposalId)=>{
  await onProposalSucceeded(proposalId, standardGovernorContract);
});

customGovernorContract.on("ProposalSucceeded", async (proposalId)=>{
  await onProposalSucceeded(proposalId, customGovernorContract);
});

standardGovernorContract.on("ProposalCanceled", async(args)=>{
  await onProposalCanceled(args, standardGovernorContract);
});

customGovernorContract.on("ProposalCanceled", async(args)=>{
  await onProposalCanceled(args, customGovernorContract);
});


standardGovernorContract.on("ProposalQueued", async(args)=>{
  await onProposalQueued(args, standardGovernorContract);
});

customGovernorContract.on("ProposalQueued", async(args)=>{
  await onProposalQueued(args, customGovernorContract);
});


standardGovernorContract.on("ProposalExecuted", async(id)=>{
  await onProposalExecuted(id, standardGovernorContract);
});

customGovernorContract.on("ProposalExecuted", async(id)=>{
  await onProposalExecuted(id, customGovernorContract);
});
}