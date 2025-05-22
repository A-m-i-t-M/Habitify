import express from 'express';
import {createGoal,getGoals,deleteGoal,doneForDay,getFriendsProgress,updateGoal,getLeaderboard,getStreak,fetchDailyGoals,forceStreakCheck,getUserProgress} from "../controller/goalController.js"
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
router.get('/dailygoals',verifyUser,fetchDailyGoals);
router.post('/check-streak',verifyUser,forceStreakCheck);
router.get('/progress',verifyUser,getUserProgress);

export default router;

