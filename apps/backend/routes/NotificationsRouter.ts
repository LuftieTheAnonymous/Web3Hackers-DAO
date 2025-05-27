import express from "express";
import { notifyEveryDAOMember } from "../controllers/NotificationsController";
import { notificationsEligibilityMiddleware } from "../middlewares/internalEligibility";

const router=express.Router();

router.post('/notify-dao-members',notificationsEligibilityMiddleware, notifyEveryDAOMember);



export default router;