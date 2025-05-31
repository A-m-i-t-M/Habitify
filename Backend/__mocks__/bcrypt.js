import { jest } from '@jest/globals';

const bcrypt = {
  hashSync: jest.fn().mockReturnValue('hashed-password'),
  compareSync: jest.fn().mockReturnValue(true),
  genSaltSync: jest.fn().mockReturnValue('mock-salt'),
};

export default bcrypt;
