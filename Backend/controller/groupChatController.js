import Group from "../models/groupModel.js";
import User from "../models/userModel.js";
import { errorHandler } from "../utils/error.js";

export const createGroup = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(404).json({ message: "Name is missing" });
  }
  try {
    const group = new Group({
      admin: req.user._id,
      name,
    });
    await group.save();
    group.members.push(req.user._id);
    await group.save();
    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating group", error: error.message });
  }
};

export const updateGroup = async (req, res) => {
  const { groupId, name, admin } = req.body;

  if (!name && !admin) {
    return res
      .status(400)
      .json({ error: "Please provide a new name, a new admin, or both." });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }
    if (req.user._id.toString() === group.admin.toString()) {
      if (name) {
        group.name = name;
      }
      if (admin) {
        group.admin = admin;
      }
      await group.save();
      res.json({ message: "Group updated successfully.", group });
    } else {
      res.json({
        message: "You can only update the group if you are the admin",
      });
    }
  } catch (error) {
    console.error("Error updating group:", error);
    res.status(500).json({ error: "Failed to update group." });
  }
};

export const addMember = async (req, res) => {
  const { groupId, userId } = req.body;
  if (!groupId || !userId) {
    return res.status(404).json({ message: "Something is missing" });
  }
  try {
    const group = await Group.findOne({_id:groupId,admin:req.user._id});
    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    if (group.members.includes(userId)) {
      return res
        .status(400)
        .json({ error: "User is already a member of the group." });
    }
    group.members.push(userId);
    await group.save();
    res.json({ message: "Member added successfully.", group });
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ error: "Failed to add member." });
  }
};

export const getUserGroups = async (req, res) => {
  const userId = req.user._id;
  try {
    const groups = await Group.find({ members: userId })
      .populate("admin", "name")
      .select("name admin members")
      .exec();
    res.json({ groups });
  } catch (error) {
    console.error("Error fetching user's groups:", error);
    res.status(500).json({ error: "Failed to fetch groups." });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    if (!groupId) {
      return res
        .status(400)
        .json({ success: false, message: "Post ID is required" });
    }
    const group = await Group.findOne({ _id: groupId, admin: req.user._id });
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found or you don't have access to it.",
      });
    }

    await Group.findByIdAndDelete(groupId);
    res.status(200).json({
      success: true,
      message: "Group deleted successfully.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting group", error: error.message });
  }
};

export const removeMemberFromGroup = async (req, res) => {
    const { groupId, memberId } = req.body;
    if (!groupId || !memberId) {
        return res.status(400).json({ error: "Group ID and Member ID are required." });
    }
    try {
        const group = await Group.findOne({_id:groupId,admin:req.user._id});
        if (!group) {
            return res.status(404).json({ error: "Group not found or you are not the admin." });
        }
        const isMember = group.members.includes(memberId);
        if (!isMember) {
            return res.status(400).json({ error: "User is not a member of this group." });
        }
        group.members = group.members.filter(id => id.toString() !== memberId);
        await group.save();
        res.json({ message: "Member removed successfully.", group });
    } catch (error) {
        console.error("Error removing member:", error);
        res.status(500).json({ error: "Failed to remove member." });
    }
};

export const getAllUsersInGroup = async (req, res) => {
    const { groupId } = req.body;

    if (!groupId) {
        return res.status(400).json({ error: "Group ID is required." });
    }
    try {
        const group = await Group.findById(groupId).populate("members", "username"); 
        if (!group) {
            return res.status(404).json({ error: "Group not found." });
        }
        res.json({ 
            groupName: group.name,
            members: group.members 
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users associated with the group." });
    }
};