import express from "express";
import Message from "../models/messageModel.js";
import { verifyUser } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/:receiverId", verifyUser, async (req, res) => {
    try {
        const { receiverId } = req.params;
        const senderId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId },
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Error fetching messages", error: error.message });
    }
});

export default router;
