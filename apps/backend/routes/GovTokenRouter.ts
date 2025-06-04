import { Router } from "express";
import { getUserTokenBalance, intialTokenDistribution, punishMember, rewardMember } from "../controllers/GovTokenController.js";
import { DAO_Discord_elligibilityMiddleware } from "../middlewares/internalEligibility.js";



const govTokenRouter = Router();

govTokenRouter.get('/influence/:dicordMemberId',  getUserTokenBalance);

// govTokenRouter.get('/monthly_token_distribution', DAO_CronJobs_elligibilityMiddleware, cronJobsActionsLimiter, monthlyTokenDistribution);

govTokenRouter.post('/reward_member/:userAddress', rewardMember);

govTokenRouter.post('/punish_member/:userAddress', punishMember);

govTokenRouter.post('/intial_token_distribution/:memberDiscordId',DAO_Discord_elligibilityMiddleware, intialTokenDistribution);


export default govTokenRouter;