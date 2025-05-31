// Mock for sendOTP.js
import { jest } from '@jest/globals';

export const sendOTP = jest.fn().mockResolvedValue({
  success: true,
  otp: '123456'
});
