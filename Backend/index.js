// In index.js, update the Socket.io implementation
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { register, metricsMiddleware, activeUsersGauge } from './utils/metrics.js';
import userRouter from './routes/userRoutes.js';
import friendRouter from './routes/friendRoutes.js';
import goalRouter from './routes/goalRoutes.js';
import postRouter from './routes/postRoutes.js';
import commentRouter from './routes/commentRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import geminiRouter from './routes/geminiRoutes.js';
import groupRouter from './routes/groupRoutes.js';
import groupMessageRouter from './routes/groupChatMessageRoutes.js'
import { Server } from "socket.io";
import http from "http";
import Message from './models/messageModel.js';
import GroupMessage from './models/groupMessageModel.js';
import Group from './models/groupModel.js';
import User from './models/userModel.js';
dotenv.config();
const app = express();
mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to the Database...'))
    .catch((err) => console.log('DB Connection Error:', err));

// app.use(cors({
//     origin: '*',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
// }));


const allowedOrigins = [
  'https://habitify-one.vercel.app', 
  'http://localhost:5173'            
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));


app.use(express.json()); 
app.use(cookieParser());

// Apply metrics middleware to track all requests
app.use(metricsMiddleware);

// Add metrics endpoint for Prometheus to scrape
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

app.use('/backend/auth', userRouter);
app.use('/backend/friend', friendRouter);
app.use('/backend/goals', goalRouter);
app.use('/backend/posts', postRouter);
app.use('/backend/comments', commentRouter);
app.use('/backend/messages', messageRouter); 
app.use('/backend/gemini',geminiRouter);
app.use('/backend/groups',groupRouter);
app.use('/backend/groupmessage',groupMessageRouter);

app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});

// SOCKET.IO SETUP
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

const onlineUsers = new Map(); 
const activeGroups = new Map(); // Track active group chats

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // User joins the socket
    socket.on("join", (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} is online with socket ID: ${socket.id}`);
        
        // Update active users metric
        activeUsersGauge.set(onlineUsers.size);
    });

    // User joins a group chat room
    socket.on("joinGroup", (groupId) => {
        socket.join(groupId);
        console.log(`Socket ${socket.id} joined group ${groupId}`);
    });

    // Handle direct messages (keep your existing implementation)
    socket.on("sendMessage", async ({ sender, receiver, message }) => {
        try {
            const newMessage = new Message({ sender, receiver, message });
            await newMessage.save();

            const receiverSocketId = onlineUsers.get(receiver);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", newMessage);
            }
        } catch (error) {
            console.error("Message save error:", error);
        }
    });

    // Handle group messages
    socket.on("sendGroupMessage", async ({ sender, groupId, message }) => {
    try {
        // Verify sender is a member of the group
        const group = await Group.findById(groupId);
        if (!group) {
            socket.emit("error", "Group not found");
            return;
        }

        const isMember = group.members.some(memberId => memberId.toString() === sender);
        if (!isMember) {
            socket.emit("error", "You are not a member of this group");
            return;
        }

        // Get sender information
        const senderInfo = await User.findById(sender).select("username avatar");
        
        // Create and save the new message
        const newMessage = new GroupMessage({
            sender,
            group: groupId,
            message
        });
        await newMessage.save();

        // Add message to group's messages array
        group.messages.push(newMessage._id);
        await group.save();

        // Broadcast to all members in the group with full sender info
        io.to(groupId).emit("newGroupMessage", {
            _id: newMessage._id,
            sender: {
                _id: sender,
                username: senderInfo.username,
                avatar: senderInfo.avatar
            },
            message: newMessage.message,
            timestamp: newMessage.createdAt,
            group: groupId
        });
    } catch (error) {
        console.error("Group message error:", error);
        socket.emit("error", "Failed to send message");
    }
});


    // Handle editing group messages
    socket.on("editGroupMessage", async ({ messageId, newMessage, userId }) => {
        try {
            const message = await GroupMessage.findById(messageId);
            if (!message) {
                socket.emit("error", "Message not found");
                return;
            }

            if (message.sender.toString() !== userId) {
                socket.emit("error", "You can only edit your own messages");
                return;
            }

            message.message = newMessage;
            await message.save();

            io.to(message.group.toString()).emit("groupMessageUpdated", {
                messageId,
                newMessage
            });
        } catch (error) {
            console.error("Edit message error:", error);
            socket.emit("error", "Failed to edit message");
        }
    });

    // Handle deleting group messages
    socket.on("deleteGroupMessage", async ({ messageId, userId }) => {
        try {
            const message = await GroupMessage.findById(messageId);
            if (!message) {
                socket.emit("error", "Message not found");
                return;
            }

            if (message.sender.toString() !== userId) {
                socket.emit("error", "You can only delete your own messages");
                return;
            }

            const groupId = message.group;
            await GroupMessage.findByIdAndDelete(messageId);

            io.to(groupId.toString()).emit("groupMessageDeleted", messageId);
        } catch (error) {
            console.error("Delete message error:", error);
            socket.emit("error", "Failed to delete message");
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        for (let [key, value] of onlineUsers.entries()) {
            if (value === socket.id) {
                onlineUsers.delete(key);
            }
        }
        
        // Update active users metric after disconnect
        activeUsersGauge.set(onlineUsers.size);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});
