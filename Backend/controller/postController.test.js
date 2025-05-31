// Using jest.mock with manual imports for ESM compatibility
const postController = jest.requireActual('./postController.js');

// Mock implementations
jest.mock('../models/postModel.js', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('../models/userModel.js', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Get the mocked modules
const Post = jest.requireMock('../models/postModel.js').default;

// Get the controller functions
const { createPost, getUserPosts, updatePost, deletePost } = postController;

describe('Post Controller Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        _id: 'user123',
      },
      body: {
        content: 'Test post content',
        postId: 'post123',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    test('should create a new post successfully', async () => {
      // Mock Post save method
      const saveMock = jest.fn();
      const mockPost = {
        _id: 'post123',
        user: 'user123',
        content: 'Test post content',
        save: saveMock,
      };
      
      Post.mockImplementation(() => mockPost);
      
      await createPost(req, res);
      
      // Assertions
      expect(Post).toHaveBeenCalledWith({
        user: 'user123',
        content: 'Test post content',
      });
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Post created successfully',
        post: mockPost,
      }));
    });

    test('should return error when content is missing', async () => {
      // Missing content
      req.body = {};
      
      await createPost(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Content is missing' });
    });
  });

  describe('getUserPosts', () => {
    test('should return user posts', async () => {
      const mockPosts = [
        { _id: 'post1', content: 'Post 1' },
        { _id: 'post2', content: 'Post 2' },
      ];
      
      // Mock Post.find
      Post.find.mockResolvedValue(mockPosts);
      
      await getUserPosts(req, res);
      
      // Assertions
      expect(Post.find).toHaveBeenCalledWith({ user: 'user123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ posts: mockPosts });
    });
  });

  describe('updatePost', () => {
    test('should update a post successfully', async () => {
      const mockPost = {
        _id: 'post123',
        user: 'user123',
        content: 'Original content',
        save: jest.fn().mockResolvedValue({
          _id: 'post123',
          user: 'user123',
          content: 'Test post content',
        }),
      };
      
      // Mock Post.findOne
      Post.findOne.mockResolvedValue(mockPost);
      
      await updatePost(req, res);
      
      // Assertions
      expect(Post.findOne).toHaveBeenCalledWith({ _id: 'post123', user: 'user123' });
      expect(mockPost.content).toBe('Test post content');
      expect(mockPost.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should return error when post is not found', async () => {
      // Post not found
      Post.findOne.mockResolvedValue(null);
      
      await updatePost(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Post not found' });
    });
  });
});
