import { describe, it, expect } from 'vitest';
import { calculateSchedule, getScheduleSummary, _internal } from '../../src/services/scheduler.service.js';

const { isWorkDay, getNextWorkDay, randomizeTimeInWorkHours } = _internal;

describe('Scheduler Service', () => {
  describe('isWorkDay', () => {
    it('should return true for work days', () => {
      const monday = new Date('2025-10-27'); // Monday
      const workDays = [1, 2, 3, 4, 5]; // Mon-Fri
      expect(isWorkDay(monday, workDays)).toBe(true);
    });

    it('should return false for non-work days', () => {
      const saturday = new Date('2025-11-01'); // Saturday
      const workDays = [1, 2, 3, 4, 5]; // Mon-Fri
      expect(isWorkDay(saturday, workDays)).toBe(false);
    });
  });

  describe('getNextWorkDay', () => {
    it('should skip weekend to next Monday', () => {
      const friday = new Date('2025-10-31'); // Friday
      const workDays = [1, 2, 3, 4, 5]; // Mon-Fri
      const nextWorkDay = getNextWorkDay(friday, workDays);
      
      expect(nextWorkDay.getDay()).toBe(1); // Monday
      expect(nextWorkDay.getDate()).toBe(3); // Nov 3
    });

    it('should return next day if it is a work day', () => {
      const monday = new Date('2025-10-27'); // Monday
      const workDays = [1, 2, 3, 4, 5]; // Mon-Fri
      const nextWorkDay = getNextWorkDay(monday, workDays);
      
      expect(nextWorkDay.getDay()).toBe(2); // Tuesday
    });
  });

  describe('randomizeTimeInWorkHours', () => {
    it('should return time within work hours', () => {
      const date = new Date('2025-10-27');
      const workHours = [9, 17];
      
      const result = randomizeTimeInWorkHours(date, workHours);
      
      expect(result.getHours()).toBeGreaterThanOrEqual(9);
      expect(result.getHours()).toBeLessThan(17);
    });

    it('should preserve the date', () => {
      const date = new Date('2025-10-27');
      const workHours = [9, 17];
      
      const result = randomizeTimeInWorkHours(date, workHours);
      
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(9); // October (0-indexed)
      expect(result.getDate()).toBe(27);
    });
  });

  describe('calculateSchedule', () => {
    const config = {
      startDate: '2025-10-27T09:00:00Z', // Monday
      perDay: 2,
      workDays: [1, 2, 3, 4, 5], // Mon-Fri
      workHours: [9, 17]
    };

    it('should return empty array for empty leads', () => {
      const schedule = calculateSchedule(config, []);
      expect(schedule).toEqual([]);
    });

    it('should schedule leads respecting perDay limit', () => {
      const leads = [
        { email: 'test1@example.com' },
        { email: 'test2@example.com' },
        { email: 'test3@example.com' }
      ];

      const schedule = calculateSchedule(config, leads);
      
      expect(schedule).toHaveLength(3);
      
      // First two should be on same day
      const day1 = new Date(schedule[0].scheduledAt).toDateString();
      const day2 = new Date(schedule[1].scheduledAt).toDateString();
      const day3 = new Date(schedule[2].scheduledAt).toDateString();
      
      expect(day1).toBe(day2);
      expect(day1).not.toBe(day3);
    });

    it('should skip weekends', () => {
      const configFriday = {
        ...config,
        startDate: '2025-10-31T09:00:00Z', // Friday
        perDay: 1
      };

      const leads = [
        { email: 'test1@example.com' },
        { email: 'test2@example.com' }
      ];

      const schedule = calculateSchedule(configFriday, leads);
      
      const firstDate = new Date(schedule[0].scheduledAt);
      const secondDate = new Date(schedule[1].scheduledAt);
      
      expect(firstDate.getDay()).toBe(5); // Friday
      expect(secondDate.getDay()).toBe(1); // Monday (skipped weekend)
    });

    it('should schedule within work hours', () => {
      const leads = [{ email: 'test@example.com' }];
      const schedule = calculateSchedule(config, leads);
      
      const scheduledDate = new Date(schedule[0].scheduledAt);
      expect(scheduledDate.getHours()).toBeGreaterThanOrEqual(9);
      expect(scheduledDate.getHours()).toBeLessThan(17);
    });
  });

  describe('getScheduleSummary', () => {
    it('should return empty summary for empty schedule', () => {
      const summary = getScheduleSummary([]);
      
      expect(summary.totalEmails).toBe(0);
      expect(summary.startDate).toBeNull();
      expect(summary.endDate).toBeNull();
      expect(summary.totalDays).toBe(0);
    });

    it('should calculate correct summary', () => {
      const schedule = [
        { lead: { email: 'test1@example.com' }, scheduledAt: '2025-10-27T10:00:00Z' },
        { lead: { email: 'test2@example.com' }, scheduledAt: '2025-10-28T11:00:00Z' },
        { lead: { email: 'test3@example.com' }, scheduledAt: '2025-10-29T12:00:00Z' }
      ];

      const summary = getScheduleSummary(schedule);
      
      expect(summary.totalEmails).toBe(3);
      expect(summary.startDate).toBe('2025-10-27T10:00:00.000Z');
      expect(summary.endDate).toBe('2025-10-29T12:00:00.000Z');
      expect(summary.totalDays).toBe(3);
    });
  });
});
