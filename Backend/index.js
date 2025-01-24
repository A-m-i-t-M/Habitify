import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log('Connected to the Database...');
  })
  .catch((e) => {
    console.log(e);
  });

  const app = express();

  // Middleware
  app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from your frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true, // Allow cookies and other credentials
  }));
  app.use(express.json());
  app.use(cookieParser());
  
  // Start server
  app.listen(3000, () => {
    console.log('Server is up & running...');
  });
  