// Using jest.mock with manual imports for ESM compatibility
const goalController = jest.requireActual('./goalController.js');

// Mock implementations
jest.mock('../models/goalModel.js', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('../models/userModel.js', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Get the mocked modules
const Goal = jest.requireMock('../models/goalModel.js').default;
const User = jest.requireMock('../models/userModel.js').default;

// Get the controller functions
const { createGoal, getFriendsProgress, getGoals } = goalController;

describe('Goal Controller Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        _id: 'user123',
      },
      body: {
        description: 'Test Goal',
        days: ['Monday', 'Wednesday', 'Friday'],
        duration: 30,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('createGoal', () => {
    test('should create a new goal successfully', async () => {
      // Mock Goal save method
      const saveMock = jest.fn();
      Goal.mockImplementation(() => ({
        save: saveMock,
      }));
      
      await createGoal(req, res);
      
      // Assertions
      expect(Goal).toHaveBeenCalledWith({
        user: 'user123',
        description: 'Test Goal',
        days: ['Monday', 'Wednesday', 'Friday'],
        duration: 30,
      });
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Goal created successfully' });
    });

    test('should return error when required fields are missing', async () => {
      // Missing required fields
      req.body = { description: 'Test Goal' };
      
      await createGoal(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Something is missing' });
    });
  });

  describe('getGoals', () => {
    test('should return user goals', async () => {
      const mockGoals = [
        { _id: 'goal1', description: 'Goal 1' },
        { _id: 'goal2', description: 'Goal 2' },
      ];
      
      // Mock Goal.find
      Goal.find.mockResolvedValue(mockGoals);
      
      await getGoals(req, res);
      
      // Assertions
      expect(Goal.find).toHaveBeenCalledWith({ user: 'user123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ goals: mockGoals });
    });
  });

  describe('getFriendsProgress', () => {
    test('should return friends progress data', async () => {
      const mockFriends = [
        { _id: 'friend1', username: 'friend1', avatar: 'avatar1.jpg' },
        { _id: 'friend2', username: 'friend2', avatar: 'avatar2.jpg' },
      ];
      
      const mockUser = {
        _id: 'user123',
        friends: mockFriends,
      };
      
      const mockGoals = [
        { _id: 'goal1', user: 'friend1', lastUpdated: new Date() },
        { _id: 'goal2', user: 'friend1', lastUpdated: new Date(Date.now() - 86400000) }, // Yesterday
        { _id: 'goal3', user: 'friend2', lastUpdated: new Date() },
      ];
      
      // Mock User.findById
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser),
      });
      
      // Mock Goal.find
      Goal.find.mockResolvedValue(mockGoals);
      
      await getFriendsProgress(req, res);
      
      // Assertions
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(Goal.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        friends: expect.any(Array),
      }));
    });

    test('should handle case with no friends', async () => {
      // Mock User.findById with no friends
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: 'user123', friends: [] }),
      });
      
      await getFriendsProgress(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'No friends found', friends: [] });
    });
  });
});
