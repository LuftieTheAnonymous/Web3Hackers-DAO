import express from "express";
import { notifyEveryDAOMember } from "../controllers/NotificationsController";

const router=express.Router();


router.post('/notify-dao-members', notifyEveryDAOMember);

export default router;