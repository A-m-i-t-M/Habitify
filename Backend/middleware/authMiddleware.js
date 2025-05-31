import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'; 
import { errorHandler } from '../utils/error.js';

export const verifyUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        console.log("in the token verify---", token)
        // console.log("req data----", req.headers)
        if (!token) {
            return next(errorHandler(401, 'Authentication token missing.'));
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return next(errorHandler(401, 'Invalid or expired token.'));
        }

        const user = await User.findById(decoded._id).select('-password'); 

        if (!user) {
            return next(errorHandler(404, 'User not found.'));
        }
        req.user = user;
        next();
    } catch (error) {
        next(errorHandler(500, 'Authentication failed.'));
    }
};
