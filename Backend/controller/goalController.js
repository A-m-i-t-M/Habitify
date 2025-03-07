import Goal from "../models/goalModel.js";
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
export const getGoals=async(req,res)=>{
    try{
        const goals=await Goal.find({user:req.user._id});
        res.status(200).json({goals});
    }catch(error)
    {
        res.status(500).json({ message: "Error fetching goals", error: error.message });
    }
}
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
export const doneForDay=async(req,res)=>{
    try{
        const {goalId}=req.body;
        if(!goalId){
            return res.status(400).json({
                success:false,
                message:"goal not found."
            })
        }
        const goal = await Goal.findByIdAndUpdate(goalId, { $inc: { count: 1 } }, { new: true });
        if(goal.days===goal.count)
        {
            await Goal.findByIdAndDelete(goalId);
            res.status(200).json({
                success: true,
                message: "Goal has been completed hence deleted.",
            });
        }
        res.status(200).json({
            success: true,
            message: "Goal completed for the day.",
        });
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error deleting darshan.",
            error: error.message,
        });
    }
}

