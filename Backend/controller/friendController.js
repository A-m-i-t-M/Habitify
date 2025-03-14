import User from '../models/userModel.js';
import { errorHandler } from "../utils/error.js";
export const sendFriendRequest = async (req, res, next) => {
    try {
        const { username } = req.body; 
        const senderId = req.user._id; 

        const recipient = await User.findOne({ username });
        if (!recipient) {
            return next(errorHandler(404, "User not found"));
        }
        if (recipient._id.equals(senderId)) {
            return next(errorHandler(400, "You cannot send a request to yourself"));
        }

        // Check if already friends
        if (recipient.friends.includes(senderId)) {
            return next(errorHandler(400, "You are already friends"));
        }

        // Check if request already sent
        if (recipient.friendRequests.includes(senderId)) {
            return next(errorHandler(400, "Friend request already sent"));
        }

        // Add sender ID to recipient's friendRequests array
        recipient.friendRequests.push(senderId);
        await recipient.save();

        res.status(200).json({ message: `Friend request sent to ${username}` });

    } catch (error) {
        next(error);
    }
};
export const declineFriendRequest = async (req, res, next) => {
    try {
        const { senderUsername } = req.body; // Username of the person who sent the request
        const sender = await User.findOne({ username: senderUsername });

        if (!sender) {
            return next(errorHandler(404, "User not found"));
        }

        const user = await User.findById(req.user._id);

        // Check if request exists
        if (!user.friendRequests.includes(sender._id)) {
            return next(errorHandler(400, "No friend request from this user"));
        }

        // Remove the sender from the user's friendRequests array
        user.friendRequests = user.friendRequests.filter(reqId => reqId.toString() !== sender._id.toString());

        await user.save();

        res.status(200).json({ message: `Friend request from ${sender.username} declined.` });

    } catch (error) {
        next(error);
    }
};

export const getPendingRequests = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('friendRequests', 'username email');
        res.status(200).json(user.friendRequests);
    } catch (error) {
        next(error);
    }
};
export const getFriends = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('friends', 'username email');
        res.status(200).json(user.friends);
    } catch (error) {
        next(error);
    }
};
export const acceptFriendRequest = async (req, res, next) => {
    try {
        const { senderUsername } = req.body; // Username of the person who sent the request
        const sender = await User.findOne({ username: senderUsername });

        if (!sender) {
            return next(errorHandler(404, "User not found"));
        }

        const user = await User.findById(req.user._id);

        // Check if request exists
        if (!user.friendRequests.includes(sender._id)) {
            return next(errorHandler(400, "No friend request from this user"));
        }

        // Add to friends list for both users
        user.friends.push(sender._id);
        sender.friends.push(user._id);

        // Remove request from pending list
        user.friendRequests = user.friendRequests.filter(reqId => reqId.toString() !== sender._id.toString());

        await user.save();
        await sender.save();

        res.status(200).json({ message: `You are now friends with ${sender.username}` });

    } catch (error) {
        next(error);
    }
};
export const removeFriend = async (req, res, next) => {
    try {
        const { friendUsername } = req.body; // Username of the friend to remove
        const friend = await User.findOne({ username: friendUsername });

        if (!friend) {
            return next(errorHandler(404, "User not found"));
        }

        const user = await User.findById(req.user._id);

        // Check if they are actually friends
        if (!user.friends.includes(friend._id)) {
            return next(errorHandler(400, "This user is not your friend"));
        }

        // Remove from both users' friend lists
        user.friends = user.friends.filter(friendId => friendId.toString() !== friend._id.toString());
        friend.friends = friend.friends.filter(friendId => friendId.toString() !== user._id.toString());

        await user.save();
        await friend.save();

        res.status(200).json({ message: `You have removed ${friend.username} from your friends list.` });

    } catch (error) {
        next(error);
    }
};
