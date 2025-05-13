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