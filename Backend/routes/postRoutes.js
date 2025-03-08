import express from "express";
import {createPost,getUserPosts,deletePost} from "../controller/postController.js"
import { verifyUser } from "../middleware/authMiddleware.js";
const router=express.Router()

router.post('/create',verifyUser,createPost);
router.get('/',verifyUser,getUserPosts);
router.post('/delete',verifyUser,deletePost);
export default router;