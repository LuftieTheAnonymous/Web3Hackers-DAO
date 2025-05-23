import { Router } from "express";
import { upsertActivity } from "../controllers/ActivityController";

const activityRouter = Router();

activityRouter.post('/update/:memberDiscordId', upsertActivity);

activityRouter.delete('/update/:memberDiscordId', upsertActivity);


export default activityRouter;