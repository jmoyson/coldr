import { Resend } from 'resend';
import { CampaignError } from '../utils/error.utils.js';

export class ResendService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new CampaignError(
        'Resend API key is required',
        'MISSING_API_KEY'
      );
    }
    this.resend = new Resend(apiKey);
  }

  async sendEmail(params) {
    try {
      const { data, error } = await this.resend.emails.send(params);

      if (error) {
        const details =
          error.statusCode !== undefined && error.statusCode !== null
            ? `${error.statusCode}`
            : 'unknown status';
        throw new CampaignError(
          `Resend API error (${details}): ${error.message}`,
          'EMAIL_SCHEDULE_FAILED'
        );
      }

      return data;
    } catch (error) {
      if (error instanceof CampaignError) {
        throw error;
      }

      throw new CampaignError(
        `Failed to schedule email: ${error.message}`,
        'EMAIL_SCHEDULE_FAILED'
      );
    }
  }
}
