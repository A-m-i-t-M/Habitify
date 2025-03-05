import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routes/userRoutes.js';
import friendRouter from './routes/friendRoutes.js'
dotenv.config();

const app = express();

mongoose
  .connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to the Database...'))
  .catch((err) => console.log('DB Connection Error:', err));

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, 
}));
app.use(express.json()); 
app.use(cookieParser());  

// Routes
app.use('/backend/auth', userRouter);
app.use('/backend/friend',friendRouter);
// Error handling middleware
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
