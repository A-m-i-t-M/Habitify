/*import express from "express";
import { signUP, signIN, signOut, verifyOTP,updateUser } from "../controller/userController.js";
import {verifyUser} from "../middleware/authMiddleware.js"
const router = express.Router();

router.post("/signup", signUP);
router.post("/verify-otp", verifyOTP);
router.post("/signin", signIN);
router.get("/signout", signOut);
router.post("/update",verifyUser,updateUser);

export default router;*/
import express from 'express';
import { signUP, signIN, signOut, updateUser, verifyOTP, updateProfilePicture } from '../controller/userController.js';
import { verifyUser } from '../middleware/authMiddleware.js';
import { upload } from '../utils/cloudinery.js';

const router = express.Router();

router.post('/signup', upload.single('profilePicture'), signUP);
router.post('/signin', signIN);
router.post('/verify-otp', verifyOTP);
router.get('/signout', signOut);
router.put('/update', verifyUser, upload.single('profilePicture'), updateUser);
router.post('/update-profile-picture', verifyUser, upload.single('profilePicture'), updateProfilePicture);

export default router;

