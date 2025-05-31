import { jest } from '@jest/globals';

const mockPostModel = jest.fn().mockImplementation((postData) => ({
  ...postData,
  save: jest.fn().mockResolvedValue({
    _id: 'mock-post-id',
    ...postData
  })
}));

mockPostModel.find = jest.fn().mockReturnValue({
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([])
});

mockPostModel.findOne = jest.fn().mockReturnValue({
  populate: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(null)
});

mockPostModel.findById = jest.fn().mockReturnValue({
  populate: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(null)
});

mockPostModel.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: 'mock-post-id' });
mockPostModel.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 'mock-post-id', updated: true });

export default mockPostModel;
