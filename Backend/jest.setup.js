// This file is used to set up the test environment for Jest
// It's particularly useful for ESM modules
import { jest } from '@jest/globals';

// Mock mongoose to prevent actual database connections
jest.mock('mongoose', () => {
  const mmongoose = {
    connect: jest.fn().mockResolvedValue({}),
    model: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    }),
    Schema: jest.fn().mockReturnValue({})
  };
  
  // Add Schema.Types.ObjectId
  mmongoose.Schema.Types = {
    ObjectId: 'ObjectId',
    String: String,
    Number: Number,
    Boolean: Boolean,
    Date: Date
  };
  
  return mmongoose;
});

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test-password';
process.env.EMAIL = 'test@example.com';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ success: true }),
  }),
}));

// Silence console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

// Set longer timeout for tests
jest.setTimeout(10000);
