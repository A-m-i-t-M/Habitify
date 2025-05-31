import { jest } from '@jest/globals';

const jwt = {
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: jest.fn().mockImplementation((token, secret, callback) => {
    if (token === 'valid-token') {
      return callback(null, { id: 'mock-user-id' });
    }
    return callback(new Error('Invalid token'), null);
  }),
};

export default jwt;
