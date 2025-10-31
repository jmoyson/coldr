import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import init from '../../src/commands/init.js';

describe('Unit: Scaffold Output', () => {
  const testCampaignName = 'test-scaffold-campaign';
  const testCampaignPath = path.join(process.cwd(), testCampaignName);

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

  it('should match the scaffold snapshot', () => {
    init(testCampaignName);

    const config = fs.readFileSync(path.join(testCampaignPath, 'config.json'), 'utf-8');
    const leads = fs.readFileSync(path.join(testCampaignPath, 'leads.csv'), 'utf-8');
    const template = fs.readFileSync(path.join(testCampaignPath, 'template.html'), 'utf-8');
    const suppressions = fs.readFileSync(path.join(testCampaignPath, 'suppressions.json'), 'utf-8');

    expect(config).toMatchSnapshot();
    expect(leads).toMatchSnapshot();
    expect(template).toMatchSnapshot();
    expect(suppressions).toMatchSnapshot();
  });
});
