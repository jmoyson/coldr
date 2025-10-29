import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import init from '../../src/commands/init.js';

describe('E2E: Init Command', () => {
  const testCampaignName = 'test-e2e-campaign';
  const testCampaignPath = path.join(process.cwd(), testCampaignName);

  // Mock console methods to avoid cluttering test output
  beforeEach(() => {
    // Mock console to avoid cluttering test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock process.stderr.write for ora spinners
    vi.spyOn(process.stderr, 'write').mockImplementation(() => {});
  });

  afterEach(() => {
    // Cleanup: remove test campaign if it exists
    if (fs.existsSync(testCampaignPath)) {
      fs.rmSync(testCampaignPath, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  it('should create a new campaign with all required files', () => {
    const result = init(testCampaignName);

    // Verify campaign directory was created
    expect(fs.existsSync(testCampaignPath)).toBe(true);
    expect(result).toBe(testCampaignPath);

    // Verify all required files exist
    expect(fs.existsSync(path.join(testCampaignPath, 'config.json'))).toBe(true);
    expect(fs.existsSync(path.join(testCampaignPath, 'leads.csv'))).toBe(true);
    expect(fs.existsSync(path.join(testCampaignPath, 'template.html'))).toBe(true);
    expect(fs.existsSync(path.join(testCampaignPath, 'suppressions.json'))).toBe(true);

    // Verify config.json has valid structure
    const configContent = fs.readFileSync(path.join(testCampaignPath, 'config.json'), 'utf-8');
    const config = JSON.parse(configContent);
    expect(config).toHaveProperty('sender');
    expect(config).toHaveProperty('subject');
    expect(config).toHaveProperty('perDay');
    expect(config).toHaveProperty('startDate');
    expect(config).toHaveProperty('workDays');
    expect(config).toHaveProperty('workHours');
  });

  it('should fail when campaign already exists', () => {
    // Create campaign first time
    init(testCampaignName);

    // Try to create again - should throw
    expect(() => init(testCampaignName)).toThrow('already exists');
  });
});
