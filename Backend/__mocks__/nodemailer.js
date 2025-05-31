import { jest } from '@jest/globals';

const nodemailer = {
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockImplementation((mailOptions, callback) => {
      if (callback) {
        callback(null, { messageId: 'mock-message-id' });
      }
      return Promise.resolve({ messageId: 'mock-message-id' });
    }),
  }),
};

export default nodemailer;
