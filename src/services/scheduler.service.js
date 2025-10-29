import { CampaignError } from '../utils/error.utils.js';

/**
 * Scheduler service to calculate email send times
 * Respects work days, work hours, and daily limits
 */

/**
 * Check if a date falls on a work day
 * @param {Date} date - Date to check
 * @param {number[]} workDays - Array of work days (0=Sunday, 6=Saturday)
 * @returns {boolean}
 */
function isWorkDay(date, workDays) {
  return workDays.includes(date.getDay());
}

/**
 * Get next work day from a given date
 * @param {Date} date - Starting date
 * @param {number[]} workDays - Array of work days
 * @returns {Date} Next work day
 */
function getNextWorkDay(date, workDays) {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  
  while (!isWorkDay(next, workDays)) {
    next.setDate(next.getDate() + 1);
  }
  
  return next;
}

/**
 * Generate random time within work hours
 * @param {Date} date - Base date
 * @param {number[]} workHours - [startHour, endHour]
 * @returns {Date} Date with random time in work hours
 */
function randomizeTimeInWorkHours(date, workHours) {
  const [startHour, endHour] = workHours;
  const result = new Date(date);
  
  // Random hour between start and end
  const randomHour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
  // Random minute
  const randomMinute = Math.floor(Math.random() * 60);
  
  result.setHours(randomHour, randomMinute, 0, 0);
  return result;
}

/**
 * Calculate schedule for all leads
 * @param {Object} config - Campaign configuration
 * @param {Array<Object>} leads - Array of lead objects
 * @returns {Array<Object>} Array of { lead, scheduledAt } sorted by scheduledAt
 */
export function calculateSchedule(config, leads) {
  if (!leads || leads.length === 0) {
    return [];
  }
  
  const { startDate, perDay, workDays, workHours } = config;
  const schedule = [];
  
  // Parse start date
  let currentDate = new Date(startDate);
  
  // Ensure start date is a work day
  if (!isWorkDay(currentDate, workDays)) {
    currentDate = getNextWorkDay(currentDate, workDays);
  }
  
  let emailsScheduledToday = 0;
  
  for (const lead of leads) {
    // If we've hit the daily limit, move to next work day
    if (emailsScheduledToday >= perDay) {
      currentDate = getNextWorkDay(currentDate, workDays);
      emailsScheduledToday = 0;
    }
    
    // Generate random time within work hours for this email
    const scheduledAt = randomizeTimeInWorkHours(currentDate, workHours);
    
    schedule.push({
      lead,
      scheduledAt: scheduledAt.toISOString()
    });
    
    emailsScheduledToday++;
  }
  
  // Sort by scheduled time (should already be sorted, but ensures it)
  schedule.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  
  return schedule;
}

/**
 * Get schedule summary statistics
 * @param {Array<Object>} schedule - Schedule array from calculateSchedule
 * @returns {Object} Summary with totalEmails, startDate, endDate, totalDays
 */
export function getScheduleSummary(schedule) {
  if (!schedule || schedule.length === 0) {
    return {
      totalEmails: 0,
      startDate: null,
      endDate: null,
      totalDays: 0
    };
  }
  
  const startDate = new Date(schedule[0].scheduledAt);
  const endDate = new Date(schedule[schedule.length - 1].scheduledAt);
  
  // Calculate days difference (inclusive)
  // Set both dates to midnight for accurate day counting
  const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const diffTime = endDay - startDay;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return {
    totalEmails: schedule.length,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    totalDays: diffDays
  };
}

/**
 * Export for testing
 */
export const _internal = {
  isWorkDay,
  getNextWorkDay,
  randomizeTimeInWorkHours
};
