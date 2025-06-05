import express from 'express';
import { addMember, getMember, getMembers } from '../controllers/MembersController.js';
import { DAO_Discord_elligibilityMiddleware } from '../middlewares/internalEligibility.js';


const membersRouter = express.Router();

membersRouter.get('/get-all-members', getMembers);

membersRouter.post('/add-member', DAO_Discord_elligibilityMiddleware, addMember);

membersRouter.get('/get-member/:discordId', getMember);

export default membersRouter;