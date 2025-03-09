import express from 'express'
import {createComment,deleteComment,updateComment} from '../controller/commentController.js'
import { verifyUser } from '../middleware/authMiddleware.js'

const router=express.Router()

router.post('/create',verifyUser,createComment);
router.post('/update',verifyUser,updateComment);
router.post('/delete',verifyUser,deleteComment);

export default router;