import { Router } from "express";
import { cancelProposal, getProposalDetails, getProposalState, getProposalVotes } from "../controllers/GovernanceController.js";


const governanceRouter = Router();

governanceRouter.post('/cancel_proposal/:proposalId', cancelProposal);

governanceRouter.get('/get_proposal_votes/:proposalId', getProposalVotes);

governanceRouter.get('/get_proposal_state/:proposalId', getProposalState);

governanceRouter.get('/get_proposal_details/:proposalId', getProposalDetails);

export default governanceRouter;