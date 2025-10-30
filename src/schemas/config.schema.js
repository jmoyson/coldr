import { z } from 'zod';

/**
 * Zod schema for campaign configuration validation
 * Validates the structure and types of config.json
 */
export const configSchema = z.object({
  sender: z
    .string()
    .regex(
      /^.+\s*<[^@]+@[^@]+\.[^@]+>$/,
      'Sender must be in format "Name <email@domain.com>"'
    ),
  replyTo: z.email().optional(),
  subject: z.string().min(1, 'Subject is required'),
  perDay: z.number().int().positive('perDay must be a positive integer'),
  startDate: z
    .string()
    .datetime('startDate must be a valid ISO 8601 datetime string'),
  workDays: z
    .array(
      z
        .number()
        .int()
        .min(0, 'Work day must be 0-6')
        .max(6, 'Work day must be 0-6')
    )
    .min(1, 'At least one work day is required'),
  workHours: z
    .tuple([z.number().int().min(0).max(23), z.number().int().min(0).max(23)])
    .refine(
      ([start, end]) => start < end,
      'Work hours start must be before end'
    ),
  unsubscribeMailto: z.string().url('unsubscribeMailto must be a valid URL'),
});

/**
 * Type inference from schema
 * @typedef {z.infer<typeof configSchema>} CampaignConfig
 */
