import express from "express";
import {createGroup,deleteGroup,updateGroup,addMember,removeMemberFromGroup,getUserGroups,getAllUsersInGroup} from "../controller/groupChatController.js";
import { verifyUser } from "../middleware/authMiddleware.js";

const router=express.Router()

router.post("/create",verifyUser,createGroup);
router.post("/delete",verifyUser,deleteGroup);
router.post("/update",verifyUser,updateGroup);
router.post("/addMember",verifyUser,addMember);
router.post("/remove",verifyUser,removeMemberFromGroup);
router.get("/get",verifyUser,getUserGroups);
router.post("/members",verifyUser,getAllUsersInGroup);
export default router;