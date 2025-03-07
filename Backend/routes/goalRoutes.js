import express from 'express';
import {createGoal,getGoals,deleteGoal,doneForDay} from "../controller/goalController.js"
import { verifyUser } from '../middleware/authMiddleware.js';
const router=express.Router()

router.post('/create',verifyUser,createGoal);
router.get('/',verifyUser,getGoals);
router.post('/delete',verifyUser,deleteGoal);
router.post('/done',verifyUser,doneForDay);
export default router;

