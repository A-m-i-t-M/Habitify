import express from 'express'
import { verifyUser } from '../middleware/authMiddleware.js'
import { getDailyPlan,motivation,getTaskPlan,generalLLM } from '../controller/geminiController.js'
const router=express.Router()
router.post('/getplan',verifyUser,getDailyPlan);
router.get('/motivation',verifyUser,motivation);
router.post('/task',verifyUser,getTaskPlan);
router.post('/general',verifyUser,generalLLM);
export default router;