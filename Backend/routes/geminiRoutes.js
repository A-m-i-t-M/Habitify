import express from 'express'
import { verifyUser } from '../middleware/authMiddleware.js'
import { getDailyPlan } from '../controller/geminiController.js'
const router=express.Router()
router.post('/getplan',verifyUser,getDailyPlan)
export default router;