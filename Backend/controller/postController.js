import Post from "../models/postModel";

export const createPost=async(req,res)=>{
    try{
        const {content}=req.body;
        if(!content)
        {
            return res.status(404).json({message:"Content is missing"});
        }
    }catch(error){
        res.status(500).json({ message: "Error creating post", error: error.message });
    }
}