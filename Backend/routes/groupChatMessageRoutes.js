import express from "express";
import { createMessage,getMessages} from "../controller/groupChatMessageController.js";
import { verifyUser } from "../middleware/authMiddleware.js";

const router=express.Router()
router.post("/create",verifyUser,createMessage);
router.post("/get",verifyUser,getMessages);
export default router;