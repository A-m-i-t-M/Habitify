import mongoose from "mongoose";

const goalSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    description:{
        type:String,
        required:true
    },
    days:{
        type:Number,
        required:true
    },
    duration: {
        hours: {
          type: Number,
          default: 0,
          min: 0
        },
        minutes: {
          type: Number,
          default: 0,
          min: 0,
          max: 59
        }
    },
    created:{
        type: Date,
        default:Date.now
    }
})
const Goal=mongoose.model("Goal",goalSchema)
export default Goal;