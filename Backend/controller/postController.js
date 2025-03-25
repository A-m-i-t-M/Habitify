import Post from "../models/postModel.js";
import User from "../models/userModel.js";

export const createPost = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(404).json({ message: "Content is missing" });
        }
        const post = new Post({
            user: req.user._id,
            content
        });
        await post.save();
        res.status(201).json({ message: "Post created successfully", post });
    } catch (error) {
        res.status(500).json({ message: "Error creating post", error: error.message });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user._id });
        res.status(200).json({ posts });
    } catch (error) {
        res.status(500).json({ message: "Error fetching posts", error: error.message });
    }
};

export const updatePost =async (req,res)=>{
    try{
        const {postId,content}=req.body;
        const post=await Post.findOne({_id:postId,user:req.user._id});
        const userId = req.user._id;
        if(!post){
            return res.status(404).json({ message: 'Post not found' });
        }
        if (post.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized to update this comment' });
        }
        post.content = content;
        const updatedPost = await post.save();
        res.status(200).json(updatedPost);
    }catch(error){
        res.status(500).json({ message: "Error updating post", error: error.message });
    }
}

export const deletePost = async (req, res) => {
    try {
        const { postId } = req.body;
        if (!postId) {
            return res.status(400).json({
                success: false,
                message: "Post ID is required",
            });
        }

        const post = await Post.findOne({ _id: postId, user: req.user._id });
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found or you don't have access to it.",
            });
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({
            success: true,
            message: "Post deleted successfully.",
        });
    } catch (error) {
        res.status(500).json({ message: "Error deleting post", error: error.message });
    }
};

export const getFriendsPosts = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const friendIds = user.friends;
        const posts = await Post.find({ user: { $in: friendIds } })
            .populate("user", "username avatar")
            .sort({ created: -1 });
        res.status(200).json({ posts });
    } catch (error) {
        res.status(500).json({ message: "Error fetching friends' posts", error: error.message });
    }
};

// export const upvote=async (req,res)=>{
//     try{
//         const { postId } = req.body;
//         if (!postId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Post ID is required",
//             });
//         }
//         const post=await Post.findByIdAndUpdate(postId,{$inc:{upvotes:1}},{new:true});
//         if(!post)
//         {
//             return res.status(404).json({message:"Post not found"});
//         }
//         res.status(200).json({
//             success: true,
//             message: "Upvoted successfully.",
//         });
//     }catch(error)
//     {
//         res.status(500).json({ message: "Error upvoting", error: error.message });
//     }
// }

export const upvote = async (req, res) => {
    try {
        const { postId } = req.body;
        const userId = req.user.id;  

        if (!postId) {
            return res.status(400).json({ success: false, message: "Post ID is required" });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const hasUpvoted = post.upvotedBy.includes(userId);

        if (hasUpvoted) {
            post.upvotes -= 1;
            post.upvotedBy = post.upvotedBy.filter(id => id.toString() !== userId);
        } else {
            post.upvotes += 1;
            post.upvotedBy.push(userId);
        }

        await post.save();

        res.status(200).json({
            success: true,
            message: hasUpvoted ? "Upvote removed" : "Upvoted successfully",
            upvotes: post.upvotes
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error upvoting", error: error.message });
    }
};