import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  campaignExists,
  createCampaign,
  loadCampaignConfig,
  validateCampaignStructure,
} from '../../src/services/campaign.service.js';
import { CampaignError } from '../../src/utils/error.utils.js';
import * as fileUtils from '../../src/utils/file.utils.js';
import * as validationUtils from '../../src/utils/validation.utils.js';

vi.mock('../../src/utils/file.utils.js', () => ({
  directoryExists: vi.fn(),
  createDirectory: vi.fn(),
  copyDirectory: vi.fn(),
  validateRequiredFiles: vi.fn(),
  getCampaignPath: vi.fn((name) => `/test/path/${name}`),
  getCampaignFilePath: vi.fn((path, file) => `${path}/${file}`),
  readJsonFile: vi.fn(),
  writeJsonFile: vi.fn(),
}));

vi.mock('../../src/utils/validation.utils.js', () => ({
  validateSchema: vi.fn((schema, data) => data),
}));

describe('Campaign Service - Domain Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCampaign', () => {

    it('should reject duplicate campaign name', () => {
      fileUtils.directoryExists.mockReturnValue(true);

      expect(() => createCampaign('existing')).toThrow(CampaignError);
      expect(() => createCampaign('existing')).toThrow('already exists');
    });

    it('should create campaign with valid name', () => {
      fileUtils.directoryExists.mockReturnValue(false);
      fileUtils.validateRequiredFiles.mockReturnValue({
        valid: true,
        missingFiles: [],
      });

      const result = createCampaign('new-campaign');

      expect(fileUtils.createDirectory).toHaveBeenCalledWith(
        '/test/path/new-campaign'
      );
      expect(fileUtils.copyDirectory).toHaveBeenCalled();
      expect(result).toBe('/test/path/new-campaign');
    });

    it('should validate scaffold files after creation', () => {
      fileUtils.directoryExists.mockReturnValue(false);
      fileUtils.validateRequiredFiles.mockReturnValue({
        valid: false,
        missingFiles: ['config.json', 'leads.csv'],
      });

      expect(() => createCampaign('new-campaign')).toThrow(CampaignError);
      expect(() => createCampaign('new-campaign')).toThrow(
        'Missing required files'
      );
    });
  });

  describe('loadCampaignConfig', () => {
    it('should reject non-existent campaign', () => {
      fileUtils.directoryExists.mockReturnValue(false);

      expect(() => loadCampaignConfig('missing')).toThrow(CampaignError);
      expect(() => loadCampaignConfig('missing')).toThrow('does not exist');
    });

    it('should load and validate config for existing campaign', () => {
      const mockConfig = {
        sender: 'Test <test@example.com>',
        subject: 'Test Campaign',
        perDay: 50,
      };
      fileUtils.directoryExists.mockReturnValue(true);
      fileUtils.readJsonFile.mockReturnValue(mockConfig);
      validationUtils.validateSchema.mockReturnValue(mockConfig);

      const result = loadCampaignConfig('test-campaign');

      expect(fileUtils.readJsonFile).toHaveBeenCalled();
      expect(validationUtils.validateSchema).toHaveBeenCalled();
      expect(result).toEqual(mockConfig);
    });

    it('should handle invalid config gracefully', () => {
      fileUtils.directoryExists.mockReturnValue(true);
      fileUtils.readJsonFile.mockReturnValue({});
      validationUtils.validateSchema.mockImplementation(() => {
        throw new Error('Invalid sender format');
      });

      expect(() => loadCampaignConfig('test-campaign')).toThrow(CampaignError);
      expect(() => loadCampaignConfig('test-campaign')).toThrow(
        'Failed to load or validate config'
      );
    });
  });

  describe('campaignExists', () => {
    it('should return true for existing campaign', () => {
      fileUtils.directoryExists.mockReturnValue(true);
      expect(campaignExists('test-campaign')).toBe(true);
    });

    it('should return false for non-existent campaign', () => {
      fileUtils.directoryExists.mockReturnValue(false);
      expect(campaignExists('test-campaign')).toBe(false);
    });
  });

  describe('validateCampaignStructure', () => {
    it('should delegate to file validation', () => {
      const mockResult = { valid: true, missingFiles: [] };
      fileUtils.validateRequiredFiles.mockReturnValue(mockResult);

      const result = validateCampaignStructure('test-campaign');

      expect(result).toEqual(mockResult);
      expect(fileUtils.validateRequiredFiles).toHaveBeenCalled();
    });
  });
});
