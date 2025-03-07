import express from "express";
import { signUP, signIN, signOut, verifyOTP,updateUser } from "../controller/userController.js";
import {verifyUser} from "../middleware/authMiddleware.js"
const router = express.Router();

router.post("/signup", signUP);
router.post("/verify-otp", verifyOTP);
router.post("/signin", signIN);
router.get("/signout", signOut);
router.post("/update",verifyUser,updateUser);

export default router;
