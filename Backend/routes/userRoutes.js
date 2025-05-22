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
import { signUP, signIN, signOut, updateUser, verifyOTP, updateProfilePicture, requestPasswordChangeOTP, changePassword, requestDeleteAccountOTP, deleteAccount, updateEmailNotifications } from '../controller/userController.js';
import { verifyUser } from '../middleware/authMiddleware.js';
import { upload } from '../utils/cloudinery.js';

const router = express.Router();

router.post('/signup', upload.single('profilePicture'), signUP);
router.post('/verify-otp', verifyOTP);
router.post('/signin', signIN);
router.get('/signout', signOut);
router.put('/update', verifyUser, upload.single('profilePicture'), updateUser);
router.post('/update-profile-picture', verifyUser, upload.single('profilePicture'), updateProfilePicture);
router.post('/request-password-change-otp', verifyUser, requestPasswordChangeOTP);
router.post('/change-password', verifyUser, changePassword);
router.post('/request-delete-account-otp', verifyUser, requestDeleteAccountOTP);
router.post('/delete-account', verifyUser, deleteAccount);
router.post('/update-email-notifications', verifyUser, updateEmailNotifications);

export default router;

