import { Router } from "express";
import { farewellMember, getUserTokenBalance, intialTokenDistribution, punishMember, rewardMember } from "../controllers/GovTokenController.js";
import { DAO_Discord_elligibilityMiddleware, frontend_Discord_elligibilityMiddleware, MembershipMiddleware, rewardPunishEndpointEligibilityMiddleware } from "../middlewares/internalEligibility.js";
import { punishUserLimiter, rewardUserLimiter } from "../middlewares/rateLimiters.js";



const govTokenRouter = Router();

govTokenRouter.get('/influence/:dicordMemberId', getUserTokenBalance);

govTokenRouter.post('/reward_member/:userAddress',rewardPunishEndpointEligibilityMiddleware, rewardUserLimiter, rewardMember);

govTokenRouter.post('/punish_member/:userAddress',rewardPunishEndpointEligibilityMiddleware, punishUserLimiter, punishMember);

govTokenRouter.post('/intial_token_distribution/:memberDiscordId',DAO_Discord_elligibilityMiddleware, intialTokenDistribution);

govTokenRouter.post('/influence/remove/:memberDiscordId',frontend_Discord_elligibilityMiddleware,MembershipMiddleware, farewellMember);


export default govTokenRouter;