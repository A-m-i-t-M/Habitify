import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
       
    },
    email: {
        type: String,
        required: true,
      
    },
    age: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
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
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });
const User = mongoose.model("User", userSchema);
export default User;
