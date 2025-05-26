import { Router } from "express";
import { getUserTokenBalance,monthlyTokenDistribution, intialTokenDistribution, updateMonthlyStats, punishMember, rewardMember } from "../controllers/GovTokenController";
import { DAO_elligibilityMiddleware } from "../middlewares/internalEligibility";


const govTokenRouter = Router();



govTokenRouter.get('/influence/:dicordMemberId',  getUserTokenBalance);

govTokenRouter.get('/monthly_token_distribution', DAO_elligibilityMiddleware, monthlyTokenDistribution);

govTokenRouter.post('/reward_member/:userAddress', rewardMember);

govTokenRouter.post('/update-monthly-stats/:memberDiscordId', updateMonthlyStats);

govTokenRouter.post('/punish_member/:userAddress', punishMember);

govTokenRouter.post('/intial_token_distribution/:memberDiscordId',DAO_elligibilityMiddleware, intialTokenDistribution);




export default govTokenRouter;