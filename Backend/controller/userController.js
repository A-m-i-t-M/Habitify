import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { errorHandler } from "../utils/error.js";
import { sendOTP } from "../utils/sendOTP.js";
import nodemailer from 'nodemailer';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const signUP = async (req, res, next) => {
    const { username, email, age, gender, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return next(errorHandler(401, 'User Already Exists!'));
        }

        
        const newUser = new User({ username, email, age, gender, password: hashedPassword, otp, otpExpires });
        await newUser.save();

        
        await sendOTP(email, otp);

        res.status(200).json({ message: "OTP sent to your email. Please verify to complete registration." });

    } catch (error) {
        next(error);
    }
};

export const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.otp !== otp || Date.now() > user.otpExpires) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // OTP is correct, remove it from DB
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        // Send Welcome Email with Username
        sendWelcomeEmail(user.email, user.username);

        res.status(200).json({ message: `OTP verified successfully! Welcome email sent to ${user.email}.` });

    } catch (error) {
        console.error("OTP Verification Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const sendWelcomeEmail = async (email, username) => {
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Your Gmail address
                pass: process.env.EMAIL_PASS, // App password
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: `Welcome to Habitify, ${username}! 🚀`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Hello ${username}, Welcome to Habitify! 🎉</h2>
                    <p>
                        We're thrilled to have you on board! <strong>Habitify</strong> is a collaborative habit-building platform designed 
                        to help you build, track, and maintain habits effectively.
                    </p>
                    <p>
                        ✨ Stay motivated, team up with friends, and achieve your goals together!  
                        Start your journey today and make habit-building fun and rewarding.
                    </p>
                    <p>Happy habit-building, ${username}! 😊</p>
                    <p><strong>- The Habitify Team</strong></p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
};


export const signIN = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const validUser = await User.findOne({ email });
        if (!validUser) {
            return next(errorHandler(401, 'Invalid Username'));
        }

        // Check if OTP is verified
        if (validUser.otp) {
            return next(errorHandler(401, 'Please verify your OTP before logging in.'));
        }

        const validPassword = bcrypt.compareSync(password, validUser.password);
        if (!validPassword) {
            return next(errorHandler(401, 'Invalid Password'));
        }

        const token = jwt.sign({ _id: validUser.id }, process.env.JWT_SECRET);
        const { password: pass, ...remaining } = validUser._doc;

        res.cookie('access_token', token, { httpOnly: true })
            .status(200)
            .json(remaining);

    } catch (error) {
        next(error);
    }
};

export const signOut = async (req, res, next) => {
    try {
        res.clearCookie("access_token");
        res.status(200).json("User has been logged out");
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
      const userId = req.user._id; 
      const updateData = req.body;
  
      const user = await User.findById(userId);
      if (!user) {
        return next(errorHandler(404, 'User not found'));
      }
  
      if (Object.keys(updateData).length === 0) {
        const { password, otp, otpExpires, ...userData } = user._doc;
        return res.status(200).json(userData);
      }

      if (updateData.password) {
        updateData.password = bcrypt.hashSync(updateData.password, 10);
      }
  
      if (updateData.email && updateData.email !== user.email) {
        const emailExists = await User.findOne({ email: updateData.email });
        if (emailExists) {
          return next(errorHandler(400, 'Email already in use'));
        }
        
        const otp = generateOtp();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        
        updateData.otp = otp;
        updateData.otpExpires = otpExpires;
        updateData.previousEmail = user.email; 
  
        await sendOTP(updateData.email, otp);
        
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $set: updateData },
          { new: true }
        );
        
        const { password, otp: userOtp, otpExpires: userOtpExpires, ...userData } = updatedUser._doc;
        
        return res.status(200).json({ 
          message: 'OTP sent to your new email. Please verify to complete update.',
          user: userData
        });
      }
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      );
  
      const { password, otp, otpExpires, ...userData } = updatedUser._doc;
      
      res.status(200).json({
        message: 'User updated successfully',
        user: userData
      });
      
    } catch (error) {
      console.error('Error updating user:', error);
      next(error);
    }
  };