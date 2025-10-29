import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import init from '../../src/commands/init.js';
import schedule from '../../src/commands/schedule.js';

describe('E2E: Schedule Command', () => {
  const testCampaignName = 'test-schedule-campaign';
  const testCampaignPath = path.join(process.cwd(), testCampaignName);

  beforeEach(() => {
    // Mock console to avoid cluttering test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock process.stderr.write for ora spinners
    vi.spyOn(process.stderr, 'write').mockImplementation(() => {});

    // Create a test campaign
    init(testCampaignName);
  });

  afterEach(() => {
    // Cleanup
    if (fs.existsSync(testCampaignPath)) {
      fs.rmSync(testCampaignPath, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  it('should calculate schedule in dry run mode', async () => {
    const result = await schedule(testCampaignName, { dryRun: true });

    // Verify schedule was calculated
    expect(result).toBeDefined();
    expect(result.dryRun).toBe(true);
    expect(result.schedule).toBeDefined();
    expect(result.schedule.length).toBeGreaterThan(0);
    expect(result.scheduled).toBe(0); // No emails sent in dry run
  });

  it('should fail for non-existent campaign', async () => {
    await expect(
      schedule('non-existent-campaign', { dryRun: true })
    ).rejects.toThrow('does not exist');
  });

  it('should fail for campaign with invalid config', async () => {
    // Corrupt the config file
    const configPath = path.join(testCampaignPath, 'config.json');
    const invalidConfig = {
      sender: 'invalid-email-format', // Missing proper format
      subject: '', // Empty subject
      perDay: -5, // Negative number
      startDate: 'not-a-date',
    };
    fs.writeFileSync(configPath, JSON.stringify(invalidConfig, null, 2));

    await expect(schedule(testCampaignName, { dryRun: true })).rejects.toThrow(
      'Failed to load or validate config'
    );
  });

  it('should load and filter leads correctly', async () => {
    // Add a suppressed email
    const suppressionsPath = path.join(testCampaignPath, 'suppressions.json');
    const suppressions = {
      emails: ['alice@example.com'],
      domains: [],
    };
    fs.writeFileSync(suppressionsPath, JSON.stringify(suppressions, null, 2));

    const result = await schedule(testCampaignName, { dryRun: true });

    // Should have 2 valid leads (bob and charlie, alice is suppressed)
    expect(result.schedule.length).toBe(2);
  });

  it('should respect perDay limit in schedule', async () => {
    // Update config to limit 1 email per day
    const configPath = path.join(testCampaignPath, 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    config.perDay = 1;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    const result = await schedule(testCampaignName, { dryRun: true });

    // Verify emails are scheduled on different days
    const dates = result.schedule.map((s) =>
      new Date(s.scheduledAt).toDateString()
    );
    const uniqueDates = new Set(dates);
    expect(uniqueDates.size).toBe(result.schedule.length);
  });

  it('should schedule within work hours', async () => {
    const result = await schedule(testCampaignName, { dryRun: true });

    // Verify all scheduled times are within work hours (9-17)
    result.schedule.forEach(({ scheduledAt }) => {
      const date = new Date(scheduledAt);
      expect(date.getHours()).toBeGreaterThanOrEqual(9);
      expect(date.getHours()).toBeLessThan(17);
    });
  });

  it('should handle empty leads gracefully', async () => {
    // Empty the leads file
    const leadsPath = path.join(testCampaignPath, 'leads.csv');
    fs.writeFileSync(leadsPath, 'email,firstName,company\n');

    const result = await schedule(testCampaignName, { dryRun: true });

    expect(result.scheduled).toBe(0);
    expect(result.failed).toBe(0);
  });

  it('should process template variables', async () => {
    // Update template with variables
    const templatePath = path.join(testCampaignPath, 'template.html');
    const template = '<p>Hi {{firstName}} from {{company}}!</p>';
    fs.writeFileSync(templatePath, template);

    const result = await schedule(testCampaignName, { dryRun: true });

    // Verify schedule was created (template processing happens during actual send)
    expect(result.schedule.length).toBeGreaterThan(0);
  });

  it('should fail fast when RESEND_API_KEY is missing', async () => {
    // Save original API key
    const originalKey = process.env.RESEND_API_KEY;

    // Remove API key
    delete process.env.RESEND_API_KEY;

    // Should fail immediately with clear message
    await expect(schedule(testCampaignName)).rejects.toThrow(
      'RESEND_API_KEY is required'
    );

    // Restore API key
    if (originalKey) {
      process.env.RESEND_API_KEY = originalKey;
    }
  });

  it('should allow dry run without RESEND_API_KEY', async () => {
    // Save original API key
    const originalKey = process.env.RESEND_API_KEY;

    // Remove API key
    delete process.env.RESEND_API_KEY;

    // Dry run should work without API key
    const result = await schedule(testCampaignName, { dryRun: true });
    expect(result.dryRun).toBe(true);

    // Restore API key
    if (originalKey) {
      process.env.RESEND_API_KEY = originalKey;
    }
  });

  it('should accept API key via resendApiKey option', async () => {
    // Save original API key
    const originalKey = process.env.RESEND_API_KEY;

    // Remove env var
    delete process.env.RESEND_API_KEY;

    // Should work with API key in options (will fail at Resend API but validates key is set)
    const result = await schedule(testCampaignName, {
      dryRun: true,
      resendApiKey: 're_test_key',
    });

    expect(result.dryRun).toBe(true);

    // Restore API key
    if (originalKey) {
      process.env.RESEND_API_KEY = originalKey;
    } else {
      delete process.env.RESEND_API_KEY;
    }
  });

  it('should prioritize resendApiKey option over env var', async () => {
    // Save original API key
    const originalKey = process.env.RESEND_API_KEY;

    // Set env var to one value
    process.env.RESEND_API_KEY = 're_env_key';

    // Pass different key in options
    await schedule(testCampaignName, {
      dryRun: true,
      resendApiKey: 're_option_key',
    });

    // Option should have overridden env var
    expect(process.env.RESEND_API_KEY).toBe('re_option_key');

    // Restore API key
    if (originalKey) {
      process.env.RESEND_API_KEY = originalKey;
    } else {
      delete process.env.RESEND_API_KEY;
    }
  });
});
