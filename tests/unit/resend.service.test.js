import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResendService } from '../../src/services/resend.service.js';

const sendMock = vi.fn();

vi.mock('resend', () => {
  class MockResend {
    constructor() {
      this.emails = {
        send: sendMock,
      };
    }
  }

  return {
    Resend: MockResend,
  };
});

describe('ResendService', () => {
  const apiKey = 're_test_key';

  beforeEach(() => {
    sendMock.mockReset();
  });

  it('should return data when the API responds without errors', async () => {
    const payload = { to: ['test@example.com'] };
    sendMock.mockResolvedValue({ data: { id: 'email_123' }, error: null });

    const service = new ResendService(apiKey);
    const result = await service.sendEmail(payload);

    expect(result).toEqual({ id: 'email_123' });
    expect(sendMock).toHaveBeenCalledWith(payload);
  });

  it('should throw CampaignError when the API returns an error payload', async () => {
    const payload = { to: ['test@example.com'] };
    sendMock.mockResolvedValue({
      data: null,
      error: {
        statusCode: 422,
        message: 'The `scheduled_at` field must be a future date',
      },
    });

    const service = new ResendService(apiKey);

    await expect(service.sendEmail(payload)).rejects.toMatchObject({
      message:
        'Resend API error (422): The `scheduled_at` field must be a future date',
      code: 'EMAIL_SCHEDULE_FAILED',
    });
  });

  it('should wrap unexpected errors from the SDK', async () => {
    const payload = { to: ['test@example.com'] };
    sendMock.mockRejectedValue(new Error('Request timeout'));

    const service = new ResendService(apiKey);

    await expect(service.sendEmail(payload)).rejects.toThrow(
      /Failed to schedule email: Request timeout/
    );
  });
});
