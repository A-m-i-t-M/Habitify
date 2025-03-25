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
    avatar : {
            type : String,
            default : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",        
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    verified: { type: Boolean, default: false },
    streak: {type : Number, default:0},
    lastchecked:{
        type:Date,
        default:null
    }
}, { timestamps: true });
const User = mongoose.model("User", userSchema);
export default User;
