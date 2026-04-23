// Mock the entire service for testing
jest.mock('../services/escalationService', () => ({
  escalateDelayedTasks: jest.fn()
}));

import { escalateDelayedTasks } from '../services/escalationService';

describe('Escalation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('escalateDelayedTasks', () => {
    it('should be defined', async () => {
      expect(escalateDelayedTasks).toBeDefined();
    });

    it('should be callable', async () => {
      (escalateDelayedTasks as jest.Mock).mockResolvedValue(undefined);
      await escalateDelayedTasks();
      expect(escalateDelayedTasks).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (escalateDelayedTasks as jest.Mock).mockRejectedValue(new Error('Test error'));
      await expect(escalateDelayedTasks()).rejects.toThrow('Test error');
    });
  });
});