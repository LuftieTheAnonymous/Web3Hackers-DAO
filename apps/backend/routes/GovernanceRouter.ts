import { Router } from "express";
import {  getEmbededProposalDetails, getProposalDetails, getProposalState, getProposalVotes } from "../controllers/GovernanceController.js";
import { DAO_Discord_elligibilityMiddleware } from "../middlewares/internalEligibility.js";


const governanceRouter = Router();

governanceRouter.get('/get_proposal_votes/:proposalId', getProposalVotes);

governanceRouter.get('/get_proposal_state/:proposalId', getProposalState);

governanceRouter.get('/get_proposal_details/:proposalId', getProposalDetails);

governanceRouter.get('/get_embeded_proposal_details/:proposalId', DAO_Discord_elligibilityMiddleware, getEmbededProposalDetails);

export default governanceRouter;