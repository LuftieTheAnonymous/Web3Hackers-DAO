import { Router } from "express";
import { getUserTokenBalance,monthlyTokenDistribution, intialTokenDistribution, punishMember, rewardMember } from "../controllers/GovTokenController";
import { DAO_CronJobs_elligibilityMiddleware, DAO_Discord_elligibilityMiddleware } from "../middlewares/internalEligibility";


const govTokenRouter = Router();



govTokenRouter.get('/influence/:dicordMemberId',  getUserTokenBalance);

govTokenRouter.get('/monthly_token_distribution', DAO_CronJobs_elligibilityMiddleware, monthlyTokenDistribution);

govTokenRouter.post('/reward_member/:userAddress', rewardMember);

govTokenRouter.post('/punish_member/:userAddress', punishMember);

govTokenRouter.post('/intial_token_distribution/:memberDiscordId',DAO_Discord_elligibilityMiddleware, intialTokenDistribution);




export default govTokenRouter;