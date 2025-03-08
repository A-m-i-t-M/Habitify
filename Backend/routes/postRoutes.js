import express from "express";
import {createPost,getUserPosts,deletePost,upvote,getFriendsPosts} from "../controller/postController.js"
import { verifyUser } from "../middleware/authMiddleware.js";
const router=express.Router()

router.post('/create',verifyUser,createPost);
router.get('/',verifyUser,getUserPosts);
router.post('/delete',verifyUser,deletePost);
router.post('/upvote',verifyUser,upvote);
router.get('/posts',verifyUser,getFriendsPosts);
export default router;