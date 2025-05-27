import { Router } from "express";
import { activateProposals, cancelProposal, executeProposals, finishProposals, getProposalDetails, getProposalQuorum, getProposalState, getProposalVotes, queueProposals } from "../controllers/GovernanceController";
import { DAO_CronJobs_elligibilityMiddleware } from "../middlewares/internalEligibility";

const governanceRouter = Router();

governanceRouter.post('/cancel_proposal/:proposalId', cancelProposal);

governanceRouter.get('/activate_proposals',DAO_CronJobs_elligibilityMiddleware, activateProposals);

governanceRouter.post('/finish_proposals',DAO_CronJobs_elligibilityMiddleware, finishProposals);

governanceRouter.get('/queue_proposals',DAO_CronJobs_elligibilityMiddleware, queueProposals);

governanceRouter.get('/execute_proposals',DAO_CronJobs_elligibilityMiddleware, executeProposals);

governanceRouter.get('/get_proposal_votes/:proposalId', getProposalVotes);

governanceRouter.get('/get_proposal_state/:proposalId', getProposalState);

governanceRouter.get('/get_proposal_quorum_needed/:proposalId', getProposalQuorum);

governanceRouter.get('/get_proposal_details/:proposalId', getProposalDetails);

export default governanceRouter;