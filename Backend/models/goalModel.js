import mongoose from "mongoose";

const goalSchema=new mongoose.Schema({
    user:{
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
    },
    count:{
        type:Number,
        default:0
    }
})
const Goal=mongoose.model("Goal",goalSchema)
export default Goal;