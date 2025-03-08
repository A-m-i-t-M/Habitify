import Post from "../models/postModel.js";

export const createPost=async(req,res)=>{
    try{
        const {content}=req.body;
        if(!content)
        {
            return res.status(404).json({message:"Content is missing"});
        }
        const post=new Post({
            user:req.user._id,
            content
        })
        await post.save();
        res.status(201).json({ message: "Post created successfully", post });
    }catch(error){
        res.status(500).json({ message: "Error creating post", error: error.message });
    }
}

export const getUserPosts=async(req,res)=>{
    try{
        const posts = await Post.find({ user: req.user._id });
        res.status(200).json({posts})
    }catch(error){
        res.status(500).json({ message: "Error fetching posts", error: error.message });
    }
}

export const deletePost=async(req,res)=>{
    try{
       const {postId}=req.body;
       console.log("gokgokgok1")
       if(!postId){
        console.log("gokgokgok2")
        return res.status(400).json({
            success:false,
            message:"post id is required"
        })
       
       }
       console.log("gokgokgok3")
       const post=await Post.findOne({_id:postId,user: req.user._id})
       if(!post)
        {
            console.log("gokgokgok4")
            return res.status(404).json({
                success: false,
                message: "post not found or you don't have access to it.",
            });
        } 
        await Post.findByIdAndDelete(postId);

        res.status(200).json({
            success: true,
            message: "post deleted successfully.",
        });
    }catch(error){
        res.status(500).json({message:"Error deleting post",error:error.message});
}
}