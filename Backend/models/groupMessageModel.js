import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "", required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }, 
}, { timestamps: true });

const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);
export default GroupMessage;