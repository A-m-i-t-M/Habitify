import mongoose from "mongoose";

const postSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    content:{
        type:String,
        required:true
    },
    created:{
        type:Date,
        default:Date.now
    },
    upvotes:{
        type:Number,
        default:0
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }]
})

const Post=mongoose.model("Post",postSchema);
export default Post;