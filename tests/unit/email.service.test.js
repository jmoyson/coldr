import { describe, it, expect, vi, beforeEach } from 'vitest';
import { _internal, scheduleEmailBatch } from '../../src/services/email.service.js';

const { parseSender, processTemplate, resetResendService, setResendService } =
  _internal;

describe('Email Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetResendService();
  });

  describe('parseSender', () => {
    it('should parse valid sender format', () => {
      const sender = 'John Doe <john@example.com>';
      const result = parseSender(sender);

      expect(result).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    it('should handle extra whitespace', () => {
      const sender = '  Alice Smith  <alice@test.io>  ';
      const result = parseSender(sender);

      expect(result).toEqual({
        name: 'Alice Smith',
        email: 'alice@test.io',
      });
    });

    it('should reject invalid format', () => {
      expect(() => parseSender('invalid-email')).toThrow(
        'Invalid sender format'
      );
      expect(() => parseSender('john@example.com')).toThrow(
        'Invalid sender format'
      );
      expect(() => parseSender('John Doe')).toThrow('Invalid sender format');
    });

    it('should handle names with special characters', () => {
      const sender = "Dr. Jane O'Brien <jane@hospital.org>";
      const result = parseSender(sender);

      expect(result.name).toBe("Dr. Jane O'Brien");
      expect(result.email).toBe('jane@hospital.org');
    });
  });

  describe('processTemplate', () => {
    it('should replace single variable', () => {
      const template = 'Hello {{name}}!';
      const lead = { name: 'Alice' };

      const result = processTemplate(template, lead);
      expect(result).toBe('Hello Alice!');
    });

    it('should replace multiple variables', () => {
      const template =
        'Hi {{name}}, I noticed {{company}} is doing great work.';
      const lead = { name: 'Bob', company: 'Acme Corp' };

      const result = processTemplate(template, lead);
      expect(result).toBe('Hi Bob, I noticed Acme Corp is doing great work.');
    });

    it('should replace repeated variables', () => {
      const template = '{{name}}, {{name}}, {{name}}!';
      const lead = { name: 'Charlie' };

      const result = processTemplate(template, lead);
      expect(result).toBe('Charlie, Charlie, Charlie!');
    });

    it('should handle missing variables', () => {
      const template = 'Hello {{name}} from {{company}}!';
      const lead = { name: 'Alice' }; // Missing company

      const result = processTemplate(template, lead, {});
      expect(result).toBe('Hello Alice from !');
    });

    it('should not replace non-existent variables', () => {
      const template = 'Hello {{name}} and {{unknown}}!';
      const lead = { name: 'Alice' };

      const result = processTemplate(template, lead, {});
      expect(result).toBe('Hello Alice and !');
    });

    it('should handle HTML templates', () => {
      const template = '<p>Hi {{name}},</p><p>About {{company}}.</p>';
      const lead = { name: 'Alice', company: 'Example Corp' };

      const result = processTemplate(template, lead, {});
      expect(result).toBe('<p>Hi Alice,</p><p>About Example Corp.</p>');
    });
  });

  describe('scheduleEmailBatch', () => {
    it('should call ResendService.sendEmail with the correct parameters', async () => {
      const config = {
        sender: 'Test <test@example.com>',
        replyTo: 'reply@example.com',
        subject: 'Test Subject',
      };
      const scheduledLeads = [
        {
          lead: { email: 'lead1@example.com', name: 'Lead 1' },
          scheduledAt: new Date(),
        },
      ];
      const template = 'Hello {{name}}';
      const spinner = { text: '' };

      const mockSendEmail = vi.fn().mockResolvedValue({ id: 'email_123' });
      setResendService({
        sendEmail: mockSendEmail,
      });

      await scheduleEmailBatch(config, scheduledLeads, template, spinner, {
        delayMs: 0,
      });

      expect(mockSendEmail).toHaveBeenCalledWith({
        from: 'Test <test@example.com>',
        to: ['lead1@example.com'],
        subject: 'Test Subject',
        html: 'Hello Lead 1',
        scheduledAt: scheduledLeads[0].scheduledAt.toISOString(),
        replyTo: 'reply@example.com',
      });
    });
  });
});
