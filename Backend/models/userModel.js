import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    age: {
        type: Number,
    },
    gender: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
    avatar: {
        type: String,
        default: "",
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    verified: { type: Boolean, default: false },
    streak: {type : Number, default:0},
    lastchecked:{
        type:Date,
        default:null
    },
    confirmed: {
        type: Boolean,
        default: false,
    },
    emailNotifications: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });
const User = mongoose.model("User", userSchema);
export default User;
