// Mock for userModel.js
import { jest } from '@jest/globals';

const mockUserModel = function(userData) {
  return {
    ...userData,
    save: jest.fn().mockResolvedValue({
      _id: 'mock-user-id',
      ...userData,
      _doc: {
        _id: 'mock-user-id',
        ...userData,
      },
    }),
  };
};

// Add static methods
mockUserModel.findOne = jest.fn();
mockUserModel.findById = jest.fn();
mockUserModel.findByIdAndUpdate = jest.fn();
mockUserModel.find = jest.fn();

export default mockUserModel;
