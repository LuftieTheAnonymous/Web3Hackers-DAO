import { Router } from "express";
import { insertVoiceChatActivity, upsertActivity } from "../controllers/ActivityController";

const activityRouter = Router();

activityRouter.post('/update/:memberDiscordId', upsertActivity);

activityRouter.delete('/update/:memberDiscordId', upsertActivity);

activityRouter.post('/insert/voice-activity/:memberDiscordId', insertVoiceChatActivity);

export default activityRouter;