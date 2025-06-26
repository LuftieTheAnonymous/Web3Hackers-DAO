import { Router } from "express";
import {   createProposalEligible, getEmbededProposalDetails, getProposalDetails, getProposalState, getProposalVotes } from "../controllers/GovernanceController.js";
import { DAO_Discord_elligibilityMiddleware, MembershipMiddleware } from "../middlewares/internalEligibility.js";
import { proposalCreationLimiter } from "../middlewares/rateLimiters.js";


const governanceRouter = Router();

governanceRouter.get('/get_proposal_votes/:proposalId', getProposalVotes);

governanceRouter.get('/get_proposal_state/:proposalId', getProposalState);

governanceRouter.get('/get_proposal_details/:proposalId', getProposalDetails);

governanceRouter.get('/get_embeded_proposal_details/:proposalId', DAO_Discord_elligibilityMiddleware, getEmbededProposalDetails);

governanceRouter.post('/create-proposal-eligibility/:memberDiscordId', MembershipMiddleware, proposalCreationLimiter, createProposalEligible);

export default governanceRouter;