import { jest } from '@jest/globals';

// Import the controller directly
import * as userController from './userController.js';

// Mock implementations
jest.mock('../models/userModel.js', () => {
  const mockSave = jest.fn().mockResolvedValue({
    _id: 'mock-user-id',
    username: 'testuser',
    email: 'test@example.com'
  });
  
  const mockUserModel = jest.fn().mockImplementation(() => ({
    save: mockSave,
    _doc: {
      _id: 'mock-user-id',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed-password'
    }
  }));
  
  mockUserModel.findOne = jest.fn();
  mockUserModel.findById = jest.fn();
  mockUserModel.findByIdAndUpdate = jest.fn();
  
  return {
    default: mockUserModel
  };
});

jest.mock('bcrypt', () => ({
  hashSync: jest.fn().mockReturnValue('hashed-password'),
  compareSync: jest.fn().mockReturnValue(true)
}));

jest.mock('../utils/sendOTP.js', () => ({
  sendOTP: jest.fn().mockResolvedValue({ success: true, otp: '123456' })
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-token')
}));

jest.mock('../utils/error.js', () => ({
  errorHandler: jest.fn().mockImplementation((code, message) => ({ code, message }))
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ success: true })
  })
}));

// Get the mocked modules
const User = jest.requireMock('../models/userModel.js').default;
const bcrypt = jest.requireMock('bcrypt');
const { sendOTP } = jest.requireMock('../utils/sendOTP.js');
const jwt = jest.requireMock('jsonwebtoken');
const { signUP, signIN } = userController;

describe('User Controller Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        username: 'testuser',
        email: 'test@example.com',
        age: 25,
        gender: 'male',
        password: 'password123',
      },
      file: null,
      cookies: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    };
    next = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  test('signUP should create a new user and send OTP', async () => {
    // Mock User.findOne to return null (user doesn't exist)
    User.findOne.mockResolvedValue(null);
    
    // Mock User save method
    const mockUser = new User();
    
    // Call the signUP function
    await signUP(req, res, next);
    
    // Verify bcrypt was called to hash the password
    expect(bcrypt.hashSync).toHaveBeenCalledWith('password123', 10);
    
    // Verify User constructor was called with expected data
    expect(User).toHaveBeenCalledWith(expect.objectContaining({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed-password'
    }));
    
    // Verify sendOTP was called
    expect(sendOTP).toHaveBeenCalled();
    
    // Verify response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('OTP sent')
    }));
  });
  
  test('signIN should authenticate user and return token', async () => {
    // Mock User.findOne to return a user
    User.findOne.mockResolvedValue({
      _id: 'mock-user-id',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed-password',
      verified: true,
      id: 'mock-user-id',
      _doc: {
        _id: 'mock-user-id',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed-password'
      }
    });
    
    // Set login credentials
    req.body = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    // Call the signIN function
    await signIN(req, res, next);
    
    // Verify password was compared
    expect(bcrypt.compareSync).toHaveBeenCalledWith('password123', 'hashed-password');
    
    // Verify JWT token was generated
    expect(jwt.sign).toHaveBeenCalled();
    
    // Verify response
    expect(res.cookie).toHaveBeenCalledWith(
      'access_token',
      'mock-token',
      expect.objectContaining({ httpOnly: true })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  describe('signUP', () => {
    test('should return error when username already exists', async () => {
      // Mock User.findOne to return an existing user
      User.findOne.mockResolvedValue({ username: 'testuser' });
      
      // Mock errorHandler
      const { errorHandler } = jest.requireMock('../utils/error.js');
      errorHandler.mockReturnValue(new Error('User Already Exists!'));
      
      await signUP(req, res, next);
      
      // Verify error handler was called
      expect(next).toHaveBeenCalled();
      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(User).not.toHaveBeenCalledWith(expect.objectContaining({
        username: 'testuser',
        email: 'test@example.com'
      }));
    });
  });

  // Add more tests for other controller functions as needed
});
