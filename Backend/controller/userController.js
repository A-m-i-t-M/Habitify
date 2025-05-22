import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { errorHandler } from "../utils/error.js";
import { sendOTP } from "../utils/sendOTP.js";
import nodemailer from 'nodemailer';
import { cloudinary } from '../utils/cloudinery.js';
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

        // Handle profile picture if uploaded
        let avatarUrl = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
        
        if (req.file) {
            avatarUrl = req.file.path; // Cloudinary automatically returns the URL in req.file.path
        }

        const newUser = new User({ 
            username, 
            email, 
            age, 
            gender, 
            password: hashedPassword, 
            otp, 
            otpExpires,
            avatar: avatarUrl
        });
        
        await newUser.save();
        await sendOTP(email, otp);

        res.status(200).json({ message: "OTP sent to your email. Please verify to complete registration." });

    } catch (error) {
        console.log(error);
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

        user.otp = undefined;
        user.otpExpires = undefined;
        user.verified = true; 
        await user.save();

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
        // console.log("1");
        
        const validUser = await User.findOne({ email });
        if (!validUser) {
            return next(errorHandler(401, 'Invalid Username'));
        }
        // console.log("2");
        
        if (!validUser.verified) {
            return next(errorHandler(401, 'Please verify your OTP before logging in.'));
        }
        // console.log("3");
        
        const validPassword = bcrypt.compareSync(password, validUser.password);
        if (!validPassword) {
            return next(errorHandler(401, 'Invalid Password'));
        }
        // console.log("4");
        
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
        res.clearCookie('access_token').status(200).json("User has been logged out!");
    } catch (error) {
        next(error);
    }
};

export const requestPasswordChangeOTP = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }
        
        // Generate new OTP
        const otp = generateOtp();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
        
        // Save OTP to user
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();
        
        // Send OTP to user's email
        await sendOTP(user.email, otp);
        
        res.status(200).json({ message: "OTP sent to your email. It will expire in 5 minutes." });
    } catch (error) {
        console.error("Request Password Change OTP Error:", error);
        next(error);
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const { newPassword, otp } = req.body;
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }
        
        // Verify OTP
        if (user.otp !== otp || Date.now() > user.otpExpires) {
            return next(errorHandler(400, 'Invalid or expired OTP'));
        }
        
        // Update password
        user.password = bcrypt.hashSync(newPassword, 10);
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        
        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Change Password Error:", error);
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
    
        if (Object.keys(updateData).length === 0 && !req.file) {
            const { password, otp, otpExpires, ...userData } = user._doc;
            return res.status(200).json(userData);
        }

        // Handle profile picture update if a file was uploaded
        if (req.file) {
            updateData.avatar = req.file.path;
        }

        if (updateData.password) {
            updateData.password = bcrypt.hashSync(updateData.password, 10);
        }
    
        // Your existing email update logic...
    
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

export const updateProfilePicture = async (req, res, next) => {
    try {
        const userId = req.user._id;
        
        if (!req.file) {
            return next(errorHandler(400, 'No image file provided'));
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }
        
        // If user already has a custom avatar (not the default), delete the old one
        if (user.avatar && !user.avatar.includes('blank-profile-picture')) {
            // Extract public_id from the Cloudinary URL
            const publicId = user.avatar.split('/').pop().split('.')[0];
            if (publicId) {
                await cloudinary.uploader.destroy(`habitify_profile_pics/${publicId}`);
            }
        }
        
        // Update with new image URL
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { avatar: req.file.path } },
            { new: true }
        );
        
        const { password, otp, otpExpires, ...userData } = updatedUser._doc;
        
        res.status(200).json({
            message: 'Profile picture updated successfully',
            user: userData
        });
        
    } catch (error) {
        console.error('Error updating profile picture:', error);
        next(error);
    }
};

export const requestDeleteAccountOTP = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }
        
        // Generate new OTP
        const otp = generateOtp();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
        
        // Save OTP to user
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();
        
        // Send OTP to user's email
        await sendOTP(user.email, otp);
        
        res.status(200).json({ message: "OTP sent to your email. It will expire in 5 minutes." });
    } catch (error) {
        console.error("Request Delete Account OTP Error:", error);
        next(error);
    }
};

export const deleteAccount = async (req, res, next) => {
    try {
        const { otp } = req.body;
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }
        
        // Verify OTP
        if (user.otp !== otp || Date.now() > user.otpExpires) {
            return next(errorHandler(400, 'Invalid or expired OTP'));
        }
        
        // Delete the user
        await User.findByIdAndDelete(userId);
        
        // Clear cookies
        res.clearCookie('access_token');
        
        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Delete Account Error:", error);
        next(error);
    }
};

export const updateEmailNotifications = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { enabled } = req.body;
        
        if (typeof enabled !== 'boolean') {
            return next(errorHandler(400, 'Invalid parameter: enabled must be a boolean'));
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }
        
        user.emailNotifications = enabled;
        await user.save();
        
        res.status(200).json({ 
            message: `Email notifications ${enabled ? 'enabled' : 'disabled'} successfully`,
            emailNotifications: enabled
        });
    } catch (error) {
        console.error("Update Email Notifications Error:", error);
        next(error);
    }
};