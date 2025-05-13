import express from "express";
import { createMessage,getMessages,editMessage,deleteMessage} from "../controller/groupChatMessageController.js";
import { verifyUser } from "../middleware/authMiddleware.js";

const router=express.Router()
router.post("/create",verifyUser,createMessage);
router.post("/get",verifyUser,getMessages);
router.post("/edit",verifyUser,editMessage);
router.post("/delete",verifyUser,deleteMessage);
export default router;