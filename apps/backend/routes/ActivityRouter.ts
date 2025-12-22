import { Router } from "express";
import {upsertActivity } from "../controllers/ActivityController.js";
import { DAO_Discord_elligibilityMiddleware, MembershipMiddleware } from "../middlewares/internalEligibility.js";

const activityRouter = Router();

activityRouter.post('/update/:memberDiscordId', DAO_Discord_elligibilityMiddleware, MembershipMiddleware, upsertActivity);

activityRouter.delete('/update/:memberDiscordId', DAO_Discord_elligibilityMiddleware,MembershipMiddleware, upsertActivity);

export default activityRouter;