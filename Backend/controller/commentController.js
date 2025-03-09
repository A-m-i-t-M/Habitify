import Post from '../models/postModel.js';
import Comment from '../models/commentModel.js';

export const createComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    const userId = req.user._id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const newComment = new Comment({
      user: userId,
      post: postId,
      content
    });
    const savedComment = await newComment.save();
    post.comments.push(savedComment._id);
    await post.save();
    res.status(201).json(savedComment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating comment', error: error.message });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.body;
    const comments = await Comment.find({ post: postId })
      .populate('user', 'username profilePicture')
      .sort({ created: -1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
};
export const updateComment = async (req, res) => {
  try {
    const { commentId,content } = req.body;
    const userId = req.user._id;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this comment' });
    }
    comment.content = content;
    const updatedComment = await comment.save();
    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment', error: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.body;
    const userId = req.user._id;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this comment' });
    }
    const post = await Post.findById(comment.post);
    if (post) {
      post.comments = post.comments.filter(
        id => id.toString() !== commentId.toString()
      );
      await post.save();
    }
    await Comment.findByIdAndDelete(commentId);   
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
};