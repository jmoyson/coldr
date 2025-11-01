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
      const response = await this.resend.emails.send(params);
      return response;
    } catch (error) {
      throw new CampaignError(
        `Failed to schedule email: ${error.message}`,
        'EMAIL_SCHEDULE_FAILED'
      );
    }
  }
}
