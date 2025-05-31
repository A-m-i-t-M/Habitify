// Mock for sendOTP.js
export const sendOTP = jest.fn().mockResolvedValue({
  success: true,
  otp: '123456'
});
