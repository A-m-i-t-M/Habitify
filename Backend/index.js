import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routes/userRoutes.js';
import friendRouter from './routes/friendRoutes.js';
import goalRouter from './routes/goalRoutes.js';
import postRouter from './routes/postRoutes.js';
import commentRouter from './routes/commentRoutes.js';
import messageRouter from './routes/messageRoutes.js'; // NEW IMPORT
import { Server } from "socket.io";
import http from "http";
import Message from './models/messageModel.js'; // NEW IMPORT

dotenv.config();
const app = express();
mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to the Database...'))
    .catch((err) => console.log('DB Connection Error:', err));

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json()); 
app.use(cookieParser());

app.use('/backend/auth', userRouter);
app.use('/backend/friend', friendRouter);
app.use('/backend/goals', goalRouter);
app.use('/backend/posts', postRouter);
app.use('/backend/comments', commentRouter);
app.use('/backend/messages', messageRouter); // NEW ROUTE

// ERROR HANDLER
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

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join", (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} is online`);
    });

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

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        for (let [key, value] of onlineUsers.entries()) {
            if (value === socket.id) {
                onlineUsers.delete(key);
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});
