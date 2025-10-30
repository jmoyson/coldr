import { describe, it, expect } from 'vitest';
import { filterLeads, _internal } from '../../src/services/leads.service.js';

const { parseCSV, isSuppressed } = _internal;

describe('Leads Service', () => {
  describe('parseCSV', () => {
    it('should parse valid CSV', () => {
      const csv =
        'email,name,company\nalice@example.com,Alice,Example Corp\nbob@sample.io,Bob,Sample Inc';
      const leads = parseCSV(csv);

      expect(leads).toHaveLength(2);
      expect(leads[0]).toEqual({
        email: 'alice@example.com',
        name: 'Alice',
        company: 'Example Corp',
      });
    });

    it('should reject CSV without email column', () => {
      const csv = 'name,company\nAlice,Example Corp';
      expect(() => parseCSV(csv)).toThrow('must have an "email" column');
    });

    it('should return empty array for CSV with no data rows', () => {
      const csv = 'email,name,company';
      const leads = parseCSV(csv);
      expect(leads).toHaveLength(0);
    });

    it('should reject CSV with mismatched columns', () => {
      const csv = 'email,name,company\nalice@example.com,Alice';
      expect(() => parseCSV(csv)).toThrow('Failed to parse CSV: Too few fields: expected 3 fields but parsed 2');
    });

    it('should skip empty lines', () => {
      const csv = 'email,name\nalice@example.com,Alice\n\nbob@sample.io,Bob';
      const leads = parseCSV(csv);

      expect(leads).toHaveLength(2);
    });
  });

  describe('isSuppressed', () => {
    const suppressions = {
      emails: ['blocked@example.com', 'spam@test.com'],
      domains: ['blocked-domain.com', 'spam-domain.io'],
    };

    it('should return true for suppressed email', () => {
      expect(isSuppressed('blocked@example.com', suppressions)).toBe(true);
    });

    it('should return true for suppressed domain', () => {
      expect(isSuppressed('anyone@blocked-domain.com', suppressions)).toBe(
        true
      );
    });

    it('should be case insensitive', () => {
      expect(isSuppressed('BLOCKED@EXAMPLE.COM', suppressions)).toBe(true);
      expect(isSuppressed('test@BLOCKED-DOMAIN.COM', suppressions)).toBe(true);
    });

    it('should return false for valid email', () => {
      expect(isSuppressed('valid@example.com', suppressions)).toBe(false);
    });

    it('should handle whitespace', () => {
      expect(isSuppressed('  blocked@example.com  ', suppressions)).toBe(true);
    });
  });

  describe('filterLeads', () => {
    const suppressions = {
      emails: ['blocked@example.com'],
      domains: ['spam.com'],
    };

    it('should filter out suppressed emails', () => {
      const leads = [
        { email: 'valid@example.com', name: 'Alice' },
        { email: 'blocked@example.com', name: 'Bob' },
        { email: 'test@spam.com', name: 'Charlie' },
      ];

      const { validLeads, suppressedLeads } = filterLeads(leads, suppressions);

      expect(validLeads).toHaveLength(1);
      expect(validLeads[0].email).toBe('valid@example.com');
      expect(suppressedLeads).toHaveLength(2);
    });

    it('should filter out leads with missing email', () => {
      const leads = [
        { email: 'valid@example.com', name: 'Alice' },
        { name: 'Bob' }, // Missing email
        { email: '', name: 'Charlie' }, // Empty email
      ];

      const { validLeads, suppressedLeads } = filterLeads(leads, suppressions);

      expect(validLeads).toHaveLength(1);
      expect(suppressedLeads).toHaveLength(2);
      expect(suppressedLeads[0].reason).toBe('Missing email');
    });

    it('should add suppression reason', () => {
      const leads = [{ email: 'blocked@example.com', name: 'Bob' }];

      const { suppressedLeads } = filterLeads(leads, suppressions);

      expect(suppressedLeads[0].reason).toBe('Suppressed');
    });

    it('should handle empty leads array', () => {
      const { validLeads, suppressedLeads } = filterLeads([], suppressions);

      expect(validLeads).toHaveLength(0);
      expect(suppressedLeads).toHaveLength(0);
    });
  });
});
