import GroupMessage from "../models/groupMessageModel.js";
import User from "../models/userModel.js";
import Group from "../models/groupModel.js";

export const createMessage=async(req,res)=>{
    const {msg,grpID}=req.body;
    if(!msg||!grpID){
        return res.status(404).json({ message: "Message or group is missing" });
    }
    const group=await Group.findById(grpID);
    if(!group){
        return res.status(404).json({message:"This group does not exist"});
    }
    const isMember = group.members.some(memberId => memberId.equals(req.user._id));
    if(!isMember)
    {
        return res.status(404).json({message:"You are not a member of this group"});
    }
    try{
        const message=new GroupMessage({
            sender:req.user._id,
            group,
            message:msg,  
        })
        await message.save();
        group.messages.push(message);
        res.status(200).json({message:"Message created successfully"});
    } catch (error) {
    console.error("Error creating message", error);
    res.status(500).json({ error: "Failed to create message" });
  }
}
export const getMessages=async(req,res)=>{
     const {grpID}=req.body;
     if(!grpID)
     {
        return res.status(404).json({ message: "Group is missing" });
     }
     const group=await Group.findById(grpID);
     if(!group)
     {
        return res.status(404).json({ message: "This group doesn't exist" });      
     }
     const isMember = group.members.some(memberId => memberId.equals(req.user._id));
     if(!isMember)
     {
        return res.status(404).json({message:"You are not a member of this group"});
     }
     const messages = await GroupMessage.find({ group: grpID })
            .populate("sender", "name email")
            .sort({ createdAt: 1 });
     res.status(200).json({messages});       
}
export const editMessage = async (req, res) => {
    const { msgID, newmsg } = req.body;

    if (!msgID || !newmsg) {
        return res.status(400).json({ message: "Message ID and new message are required." });
    }

    try {
        const groupMessage = await GroupMessage.findById(msgID);

        if (!groupMessage) {
            return res.status(404).json({ error: "Message not found." });
        }

        if (!groupMessage.sender.equals(req.user._id)) {
            return res.status(403).json({ error: "You are not the sender of this message." });
        }

        groupMessage.message = newmsg;
        await groupMessage.save();

        return res.status(200).json({ message: "Message updated successfully.", updatedMessage: groupMessage });
    } catch (error) {
        console.error("Error editing message:", error);
        return res.status(500).json({ error: "Server error while editing message." });
    }
};
export const deleteMessage = async (req, res) => {
    const { msgID } = req.body;

    if (!msgID) {
        return res.status(400).json({ message: "Message ID is required." });
    }

    try {
        const groupMessage = await GroupMessage.findById(msgID);

        if (!groupMessage) {
            return res.status(404).json({ error: "Message not found." });
        }

        if (!groupMessage.sender.equals(req.user._id)) {
            return res.status(403).json({ error: "You are not authorized to delete this message." });
        }

        await GroupMessage.findByIdAndDelete(msgID);

        return res.status(200).json({ message: "Message deleted successfully." });
    } catch (error) {
        console.error("Error deleting message:", error);
        return res.status(500).json({ error: "Server error while deleting message." });
    }
};