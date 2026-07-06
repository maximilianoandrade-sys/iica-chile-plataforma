/**
 * Analytics Event Collection Endpoint
 *
 * Receives analytics events from the frontend and stores them.
 * Uses Prisma to persist to DB when analytics table exists,
 * otherwise logs the events for external collection.
 *
 * POST /api/analytics
 * Body: { event: string, properties?: Record<string, unknown>, sessionId?: string }
 */

import { NextRequest } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getLogger } from "@/lib/utils/logger";
import { createSuccessResponse, createErrorResponse } from "@/lib/utils/api-response";

const logger = getLogger("Analytics");

const ANALYTICS_RATE_LIMIT = { maxRequests: 60, windowSizeSeconds: 60 };

// Allowed event names to prevent arbitrary data injection
const ALLOWED_EVENTS = new Set([
  "page_view",
  "search",
  "project_click",
  "project_view",
  "filter_change",
  "ai_search",
  "proposal_generated",
  "link_click",
  "share",
  "pwa_install",
]);

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  sessionId?: string;
  timestamp?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`analytics:${clientIp}`, ANALYTICS_RATE_LIMIT);
    if (!rateCheck.allowed) {
      return createErrorResponse("Demasiadas solicitudes", 429);
    }

    let body: AnalyticsEvent;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse("Invalid JSON body", 400);
    }

    // Validate event name
    if (!body.event || typeof body.event !== "string") {
      return createErrorResponse("Field 'event' is required and must be a string", 400);
    }

    if (!ALLOWED_EVENTS.has(body.event)) {
      return createErrorResponse(`Unknown event type: ${body.event}`, 400);
    }

    // Sanitize properties - limit size
    const properties = body.properties || {};
    const propsJson = JSON.stringify(properties);
    if (propsJson.length > 2048) {
      return createErrorResponse("Properties too large (max 2KB)", 400);
    }

    // Log the analytics event (structured logging for collection by external services)
    logger.info("Analytics event received", {
      event: body.event,
      properties,
      sessionId: body.sessionId,
      clientIp,
      timestamp: body.timestamp || new Date().toISOString(),
    });

    return createSuccessResponse(null);
  } catch (error) {
    logger.error("Analytics endpoint error", error as Error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function GET() {
  return createSuccessResponse({
    route: "/api/analytics",
    method: "POST",
    description: "Collect frontend analytics events",
    allowedEvents: Array.from(ALLOWED_EVENTS),
  });
}
