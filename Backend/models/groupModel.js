import mongoose from "mongoose";

const groupSchema=new mongoose.Schema({
    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    name:{
        type:String,
        required:true
    },
    members:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    messages:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"GroupMessage"
    }]
})

const Group=mongoose.model("Group",groupSchema);
export default Group;