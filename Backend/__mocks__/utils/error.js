// Mock for error.js
import { jest } from '@jest/globals';

export const errorHandler = jest.fn().mockImplementation((code, message) => {
  const error = new Error(message);
  error.status = code;
  return error;
});
