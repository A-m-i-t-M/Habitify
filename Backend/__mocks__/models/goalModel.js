import { jest } from '@jest/globals';

const mockGoalModel = jest.fn().mockImplementation((goalData) => ({
  ...goalData,
  save: jest.fn().mockResolvedValue({
    _id: 'mock-goal-id',
    ...goalData
  })
}));

mockGoalModel.find = jest.fn().mockReturnValue({
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([])
});

mockGoalModel.findOne = jest.fn().mockReturnValue({
  populate: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(null)
});

mockGoalModel.findById = jest.fn().mockReturnValue({
  populate: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(null)
});

mockGoalModel.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: 'mock-goal-id' });
mockGoalModel.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 'mock-goal-id', updated: true });

export default mockGoalModel;
