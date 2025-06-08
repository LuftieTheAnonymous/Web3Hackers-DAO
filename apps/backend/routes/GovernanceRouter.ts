import { Router } from "express";
import { cancelProposal, getEmbededProposalDetails, getProposalDetails, getProposalState, getProposalVotes } from "../controllers/GovernanceController.js";
import { DAO_Discord_elligibilityMiddleware, proposalCancelEndpointEligibilityMiddleware } from "../middlewares/internalEligibility.js";


const governanceRouter = Router();

governanceRouter.post('/cancel_proposal/:proposalId', proposalCancelEndpointEligibilityMiddleware, cancelProposal);

governanceRouter.get('/get_proposal_votes/:proposalId', getProposalVotes);

governanceRouter.get('/get_proposal_state/:proposalId', getProposalState);

governanceRouter.get('/get_proposal_details/:proposalId', getProposalDetails);

governanceRouter.get('/get_embeded_proposal_details/:proposalId', DAO_Discord_elligibilityMiddleware, getEmbededProposalDetails);

export default governanceRouter;