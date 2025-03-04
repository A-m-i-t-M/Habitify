import express from "express";
import { signUP, signIN, signOut, verifyOTP } from "../controller/userController.js";

const router = express.Router();

router.post("/signup", signUP);
router.post("/verify-otp", verifyOTP);
router.post("/signin", signIN);
router.get("/signout", signOut);

export default router;
