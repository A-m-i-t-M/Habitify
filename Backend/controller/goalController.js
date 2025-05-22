import Goal from "../models/goalModel.js";
import User from "../models/userModel.js";
import cron from "node-cron"
export const createGoal=async(req,res)=>{
    try{
        const {description,days,duration}=req.body;
        if(!description||!days||!duration){
            return res.status(404).json({message:"Something is missing"});
        }
        const goal=new Goal({
                user:req.user._id,
                description,
                days,
                duration
        })
        await goal.save();
        res.status(200).json({message:"Goal created successfully"});
    }catch(error){
        res.status(500).json({ message: "Error creating goal", error: error.message });
    }
}
export const getFriendsProgress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("friends");

        if (!user || user.friends.length === 0) {
            return res.status(200).json({ message: "No friends found", friends: [] });
        }
        const friendsGoals = await Goal.find({ user: { $in: user.friends } });
        const progressData = user.friends.map(friend => {
            const friendGoals = friendsGoals.filter(goal => goal.user.toString() === friend._id.toString());
            const totalGoals = friendGoals.length;
            const completedGoals = friendGoals.filter(goal => goal.lastUpdated && new Date(goal.lastUpdated).toDateString() === new Date().toDateString()).length;
            return {
                friendId: friend._id,
                username: friend.username,
                avatar: friend.avatar,
                completedGoals,
                totalGoals
            };
        });
        res.status(200).json({ friends: progressData });
    } catch (error) {
        res.status(500).json({ message: "Error fetching friends' progress", error: error.message });
    }
};
export const getGoals=async(req,res)=>{
    try{
        const goals=await Goal.find({user:req.user._id});
        res.status(200).json({goals});
    }catch(error)
    {
        res.status(500).json({ message: "Error fetching goals", error: error.message });
    }
}
export const fetchDailyGoals = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const goals = await Goal.find({
            user: req.user._id,
            $or: [
                { lastUpdated: { $lt: today } }, 
                { lastUpdated: { $exists: false } }
            ]
        });
        res.status(200).json({ goals });
    } catch (error) {
        res.status(500).json({ message: "Error fetching daily goals", error: error.message });
    }
};

export const deleteGoal=async(req,res)=>{
    try{
        const {goalId}=req.body;
        if(!goalId){
            return res.status(400).json({
                success:false,
                message:"goal not found."
            })
        }
        await Goal.findByIdAndDelete(goalId);
        res.status(200).json({
            success: true,
            message: "Goal deleted successfully.",
        });
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error deleting goal.",
            error: error.message,
        });
    }
}
export const doneForDay = async (req, res) => {
    try {
        const { goalId } = req.body;
        if (!goalId) {
            return res.status(400).json({
                success: false,
                message: "goal not found."
            });
        }
        const goal = await Goal.findByIdAndUpdate(
            goalId, 
            { 
                $inc: { count: 1 },
                lastUpdated: new Date()  
            }, 
            { new: true }
        );
        
        if (goal.days === goal.count) {
            await Goal.findByIdAndDelete(goalId);
            return res.status(200).json({
                success: true,
                message: "Goal has been completed hence deleted.",
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Goal completed for the day.",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error updating goal.",
            error: error.message,
        });
    }
};
export const updateGoal = async (req, res) => {
    try {
        const { goalId, description, days, duration } = req.body;
        
        if (!goalId) {
            return res.status(400).json({
                success: false,
                message: "Goal ID is required"
            });
        }
        const goal = await Goal.findById(goalId);
        if (!goal) {
            return res.status(404).json({
                success: false,
                message: "Goal not found"
            });
        }
        if (goal.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this goal"
            });
        }
        const updateFields = {};
        if (description) updateFields.description = description;
        if (days) updateFields.days = days;
        if (duration) updateFields.duration = duration;
        const updatedGoal = await Goal.findByIdAndUpdate(
            goalId,
            updateFields,
            { new: true }
        );
        res.status(200).json({
            success: true,
            message: "Goal updated successfully",
            goal: updatedGoal
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error updating goal",
            error: error.message
        });
    }
};
export const getLeaderboard = async (req, res) => {
    try {
        const { goal } = req.body;
        if (!goal) {
            return res.status(400).json({ message: "Goal name is required in the request body" });
        }

        const matchedGoals = await Goal.find({ description: { $regex: goal, $options: "i" } })
            .populate("user", "username avatar");

        if (matchedGoals.length === 0) {
            return res.status(200).json({ message: "No users found for this goal", leaderboard: [] });
        }

        const leaderboard = matchedGoals.map(goal => ({
            userId: goal.user._id,
            username: goal.user.username,
            avatar: goal.user.avatar,
            goal: goal.description,
            daysCompleted: goal.count
        }));

        leaderboard.sort((a, b) => b.daysCompleted - a.daysCompleted);

        const updatedLeaderboard = leaderboard.map(user => ({
            ...user,
            username: user.userId.toString() === req.user._id.toString() ? "You" : user.username
        }));

        res.status(200).json({ leaderboard: updatedLeaderboard });

    } catch (error) {
        res.status(500).json({ message: "Error fetching leaderboard", error: error.message });
    }
};

const checkStream=async()=> {
    try{
        const users = await User.find();
        const today=new Date();
        today.setHours(0,0,0,0);
        for(const user of users)
        {
            const goals = await Goal.find({user:user._id})
            if(goals.length===0)
            {
                continue;
            }
            const allGoalsCompleted=goals.every(goal=> goal.lastUpdated && new Date(goal.lastUpdated).toDateString() === today.toDateString());
            if(allGoalsCompleted)
            {
                user.streak+=1;
            }
            else
            {
                user.streak=0;
            }
            user.lastChecked=today;
            await user.save();
        }
        console.log("Streak updated successfully");
    }catch(error)
    {
        console.error("Error updating streak",error)
    }
}
cron.schedule("0 0 * * *",checkStream);
export const getStreak = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            streak: user.streak,
            lastChecked: user.lastChecked
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching streak", error: error.message });
    }
};

export const forceStreakCheck = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const goals = await Goal.find({ user: user._id });
        if (goals.length === 0) {
            return res.status(200).json({
                message: "No goals to check streak",
                streak: user.streak
            });
        }
        
        const allGoalsCompleted = goals.every(
            goal => goal.lastUpdated && new Date(goal.lastUpdated).toDateString() === today.toDateString()
        );
        
        if (allGoalsCompleted) {
            user.streak += 1;
        } else {
            user.streak = 0;
        }
        
        user.lastChecked = today;
        await user.save();
        
        return res.status(200).json({
            message: allGoalsCompleted ? "Streak increased!" : "Streak reset to 0",
            streak: user.streak,
            lastChecked: user.lastChecked
        });
        
    } catch (error) {
        console.error("Force streak check error:", error);
        res.status(500).json({ message: "Error checking streak", error: error.message });
    }
};

export const getUserProgress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const goals = await Goal.find({ user: user._id });
        const totalGoals = goals.length;
        
        // Count how many goals have been completed today
        const today = new Date().toDateString();
        const completedGoals = goals.filter(
            goal => goal.lastUpdated && new Date(goal.lastUpdated).toDateString() === today
        ).length;
        
        res.status(200).json({
            completedGoals,
            totalGoals,
            progress: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
        });
    } catch (error) {
        console.error("Error fetching user progress:", error);
        res.status(500).json({ message: "Error fetching progress", error: error.message });
    }
};