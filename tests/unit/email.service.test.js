import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { _internal } from '../../src/services/email.service.js';

const { parseSender, processTemplate } = _internal;

describe('Email Service', () => {
  describe('parseSender', () => {
    it('should parse valid sender format', () => {
      const sender = 'John Doe <john@example.com>';
      const result = parseSender(sender);
      
      expect(result).toEqual({
        name: 'John Doe',
        email: 'john@example.com'
      });
    });

    it('should handle extra whitespace', () => {
      const sender = '  Alice Smith  <alice@test.io>  ';
      const result = parseSender(sender);
      
      expect(result).toEqual({
        name: 'Alice Smith',
        email: 'alice@test.io'
      });
    });

    it('should reject invalid format', () => {
      expect(() => parseSender('invalid-email')).toThrow('Invalid sender format');
      expect(() => parseSender('john@example.com')).toThrow('Invalid sender format');
      expect(() => parseSender('John Doe')).toThrow('Invalid sender format');
    });

    it('should handle names with special characters', () => {
      const sender = 'Dr. Jane O\'Brien <jane@hospital.org>';
      const result = parseSender(sender);
      
      expect(result.name).toBe('Dr. Jane O\'Brien');
      expect(result.email).toBe('jane@hospital.org');
    });
  });

  describe('processTemplate', () => {
    it('should replace single variable', () => {
      const template = 'Hello {{firstName}}!';
      const lead = { firstName: 'Alice' };
      
      const result = processTemplate(template, lead);
      expect(result).toBe('Hello Alice!');
    });

    it('should replace multiple variables', () => {
      const template = 'Hi {{firstName}}, I noticed {{company}} is doing great work.';
      const lead = { firstName: 'Bob', company: 'Acme Corp' };
      
      const result = processTemplate(template, lead);
      expect(result).toBe('Hi Bob, I noticed Acme Corp is doing great work.');
    });

    it('should replace repeated variables', () => {
      const template = '{{firstName}}, {{firstName}}, {{firstName}}!';
      const lead = { firstName: 'Charlie' };
      
      const result = processTemplate(template, lead);
      expect(result).toBe('Charlie, Charlie, Charlie!');
    });

    it('should handle missing variables', () => {
      const template = 'Hello {{firstName}} from {{company}}!';
      const lead = { firstName: 'Alice' }; // Missing company
      
      const result = processTemplate(template, lead);
      expect(result).toBe('Hello Alice from !');
    });

    it('should not replace non-existent variables', () => {
      const template = 'Hello {{firstName}} and {{unknown}}!';
      const lead = { firstName: 'Alice' };
      
      const result = processTemplate(template, lead);
      expect(result).toBe('Hello Alice and !');
    });

    it('should handle HTML templates', () => {
      const template = '<p>Hi {{firstName}},</p><p>About {{company}}.</p>';
      const lead = { firstName: 'Alice', company: 'Example Corp' };
      
      const result = processTemplate(template, lead);
      expect(result).toBe('<p>Hi Alice,</p><p>About Example Corp.</p>');
    });
  });
});
