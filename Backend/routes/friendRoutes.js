import express from 'express';
import { sendFriendRequest, getPendingRequests, getFriends, acceptFriendRequest, removeFriend, declineFriendRequest} from '../controller/friendController.js';
import { verifyUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send-request', verifyUser, sendFriendRequest);
router.post('/pending-requests',verifyUser,getPendingRequests);
router.post('/get-friends',verifyUser,getFriends);
router.post('/accept-request',verifyUser,acceptFriendRequest);
router.post('/delete-friend',verifyUser,removeFriend);
router.post('/reject',verifyUser,declineFriendRequest);
export default router;
