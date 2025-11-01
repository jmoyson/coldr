import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import init from '../../src/commands/init.js';
import preview from '../../src/commands/preview.js';
import { _internal as emailInternal } from '../../src/services/email.service.js';

describe('E2E: Preview Command', () => {
  const campaignName = 'test-preview-command';
  const campaignPath = path.join(process.cwd(), campaignName);

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process.stderr, 'write').mockImplementation(() => {});

    init(campaignName);
  });

  afterEach(() => {
    if (fs.existsSync(campaignPath)) {
      fs.rmSync(campaignPath, { recursive: true, force: true });
    }
    emailInternal.resetResendService();
    delete process.env.RESEND_API_KEY;
    vi.restoreAllMocks();
  });

  it('should preview the first lead locally by default', async () => {
    const result = await preview(campaignName);

    expect(result.sent).toBe(false);
    expect(result.lead).toBe('alice@example.com');
    expect(result.subject).toContain('Example Corp');
    expect(result.html).toContain('Example Corp');
  });

  it('should preview a specific lead when --lead is provided', async () => {
    const result = await preview(campaignName, {
      lead: 'bob@sample.io',
    });

    expect(result.sent).toBe(false);
    expect(result.lead).toBe('bob@sample.io');
    expect(result.subject).toContain('Sample Inc');
  });

  it('should send a preview email when --to is provided', async () => {
    const mockSendEmail = vi.fn().mockResolvedValue({ id: 'email_123' });
    emailInternal.setResendService({
      sendEmail: mockSendEmail,
    });
    process.env.RESEND_API_KEY = 're_test_key';

    const result = await preview(campaignName, {
      to: 'preview@example.com',
      lead: 'charlie@demo.co',
    });

    expect(result.sent).toBe(true);
    expect(result.lead).toBe('charlie@demo.co');
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Your Name <hello@sending.yourdomain.com>',
        to: ['preview@example.com'],
        subject: expect.stringContaining('Demo Co'),
        html: expect.stringContaining('Demo Co'),
        replyTo: 'hello@yourdomain.com',
      })
    );
  });

  it('should throw when sending without RESEND_API_KEY', async () => {
    delete process.env.RESEND_API_KEY;

    await expect(
      preview(campaignName, {
        to: 'preview@example.com',
      })
    ).rejects.toThrow('RESEND_API_KEY is required to send preview emails');
  });
});
