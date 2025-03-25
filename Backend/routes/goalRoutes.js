import express from 'express';
import {createGoal,getGoals,deleteGoal,doneForDay,getFriendsProgress,updateGoal,getLeaderboard,getStreak} from "../controller/goalController.js"
import { verifyUser } from '../middleware/authMiddleware.js';
const router=express.Router()

router.post('/create',verifyUser,createGoal);
router.get('/',verifyUser,getGoals);
router.post('/delete',verifyUser,deleteGoal);
router.post('/done',verifyUser,doneForDay);
router.get('/friends-progress',verifyUser,getFriendsProgress);
router.post('/update',verifyUser,updateGoal);
router.post('/leaderboard',verifyUser,getLeaderboard);
router.get('/streak',verifyUser,getStreak);
export default router;

