/**
 * Email sending service.
 * Uses Resend API when RESEND_API_KEY is set.
 * Falls back to logging when no email provider is configured.
 *
 * To enable:
 *   1. Sign up at resend.com
 *   2. Set RESEND_API_KEY env var
 *   3. Set EMAIL_FROM (e.g., "IICA Chile <noreply@iica.cl>")
 */

import { getLogger } from "@/lib/utils/logger";

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
 * Send an email using the configured provider.
 * Returns success:true if sent, or logs a warning if no provider is configured.
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "IICA Chile <noreply@iica.cl>";

  if (!apiKey) {
    logger.warn("Email not sent: RESEND_API_KEY not configured", {
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
    });
    return { success: false, error: "Email provider not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        text: options.text,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      logger.error("Email send failed", new Error(errorData), {
        status: response.status,
        to: options.to,
      });
      return { success: false, error: `HTTP ${response.status}: ${errorData}` };
    }

    const data = (await response.json()) as { id: string };
    logger.info("Email sent successfully", { id: data.id, to: options.to });
    return { success: true, id: data.id };
  } catch (err) {
    logger.error("Email send error", err as Error);
    return { success: false, error: (err as Error).message };
  }
}
