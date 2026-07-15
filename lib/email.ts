import { getEnv } from '@/lib/utils/env';
import { getLogger } from "@/lib/utils/logger";
import { Resend } from 'resend';

const logger = getLogger("EmailService");

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email using the Resend SDK.
 * Returns success:true if sent, or logs a warning if no provider is configured.
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const apiKey = getEnv().RESEND_API_KEY;
  const from = getEnv().EMAIL_FROM || "IICA Chile <noreply@iica.cl>";

  if (!apiKey) {
    logger.warn("Email not sent: RESEND_API_KEY not configured", {
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
    });
    return { success: false, error: "Email provider not configured" };
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      text: options.text || '',
      html: options.html,
    });

    if (error) {
      logger.error("Email send failed", new Error(error.message), {
        status: error.name,
        to: options.to,
      });
      return { success: false, error: error.message };
    }

    logger.info("Email sent successfully", { id: data?.id, to: options.to });
    return { success: true, id: data?.id };
  } catch (err) {
    logger.error("Email send error", err as Error);
    return { success: false, error: (err as Error).message };
  }
}
