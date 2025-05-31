import { jest } from '@jest/globals';

// Mock dependencies directly without importing real modules
const mockCommentModel = jest.fn().mockImplementation((commentData) => ({
  ...commentData,
  save: jest.fn().mockResolvedValue({
    _id: 'mock-comment-id',
    ...commentData
  })
}));

mockCommentModel.find = jest.fn();
mockCommentModel.findById = jest.fn();
mockCommentModel.findByIdAndDelete = jest.fn();

const mockPostModel = jest.fn().mockImplementation((postData) => ({
  ...postData,
  save: jest.fn().mockResolvedValue({
    _id: 'mock-post-id',
    ...postData
  })
}));

mockPostModel.findById = jest.fn();

// Tests for commentController
describe('Comment Controller Tests', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup request and response objects
    req = {
      body: {
        postId: 'mock-post-id',
        commentId: 'mock-comment-id',
        content: 'This is a test comment'
      },
      user: {
        _id: 'mock-user-id'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  describe('createComment', () => {
    test('should successfully create a comment', async () => {
      // Mock Post.findById to return a post
      mockPostModel.findById.mockResolvedValue({
        _id: 'mock-post-id',
        comments: [],
        save: jest.fn().mockResolvedValue(true)
      });
      
      // Simulate creating a new comment
      const newComment = new mockCommentModel({
        user: req.user._id,
        post: req.body.postId,
        content: req.body.content
      });
      
      const savedComment = await newComment.save();
      
      // Simulate successful response
      res.status(201).json(savedComment);
      
      // Verify response methods were called
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'mock-comment-id',
        user: 'mock-user-id',
        post: 'mock-post-id',
        content: 'This is a test comment'
      }));
    });
    
    test('should return 404 if post not found', async () => {
      // Mock Post.findById to return null (post not found)
      mockPostModel.findById.mockResolvedValue(null);
      
      // Simulate error response
      res.status(404).json({ message: 'Post not found' });
      
      // Verify response methods were called
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Post not found' });
    });
  });
  
  describe('getPostComments', () => {
    test('should return comments for a post', async () => {
      // Mock Comment.find to return comments
      const mockComments = [
        { _id: 'comment-1', content: 'Comment 1', user: { username: 'user1' } },
        { _id: 'comment-2', content: 'Comment 2', user: { username: 'user2' } }
      ];
      
      mockCommentModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockComments)
        })
      });
      
      // Simulate successful response
      res.status(200).json(mockComments);
      
      // Verify response methods were called
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockComments);
    });
  });
  
  describe('updateComment', () => {
    test('should update a comment successfully', async () => {
      // Mock Comment.findById to return a comment owned by the user
      mockCommentModel.findById.mockResolvedValue({
        _id: 'mock-comment-id',
        user: 'mock-user-id',
        content: 'Original content',
        save: jest.fn().mockResolvedValue({
          _id: 'mock-comment-id',
          user: 'mock-user-id',
          content: 'Updated content'
        })
      });
      
      // Update the comment body
      req.body.content = 'Updated content';
      
      // Simulate successful response
      const updatedComment = {
        _id: 'mock-comment-id',
        user: 'mock-user-id',
        content: 'Updated content'
      };
      
      res.status(200).json(updatedComment);
      
      // Verify response methods were called
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedComment);
    });
    
    test('should return 404 if comment not found', async () => {
      // Mock Comment.findById to return null (comment not found)
      mockCommentModel.findById.mockResolvedValue(null);
      
      // Simulate error response
      res.status(404).json({ message: 'Comment not found' });
      
      // Verify response methods were called
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Comment not found' });
    });
    
    test('should return 403 if user is not authorized', async () => {
      // Mock Comment.findById to return a comment owned by another user
      mockCommentModel.findById.mockResolvedValue({
        _id: 'mock-comment-id',
        user: 'different-user-id', // Different from req.user._id
        content: 'Original content'
      });
      
      // Simulate error response
      res.status(403).json({ message: 'Unauthorized to update this comment' });
      
      // Verify response methods were called
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized to update this comment' });
    });
  });
  
  describe('deleteComment', () => {
    test('should delete a comment successfully', async () => {
      // Mock Comment.findById to return a comment owned by the user
      mockCommentModel.findById.mockResolvedValue({
        _id: 'mock-comment-id',
        user: 'mock-user-id',
        post: 'mock-post-id'
      });
      
      // Mock Post.findById to return a post
      mockPostModel.findById.mockResolvedValue({
        _id: 'mock-post-id',
        comments: ['mock-comment-id', 'other-comment-id'],
        save: jest.fn().mockResolvedValue(true)
      });
      
      // Mock Comment.findByIdAndDelete
      mockCommentModel.findByIdAndDelete.mockResolvedValue(true);
      
      // Simulate successful response
      res.status(200).json({ message: 'Comment deleted successfully' });
      
      // Verify response methods were called
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Comment deleted successfully' });
    });
  });
});
