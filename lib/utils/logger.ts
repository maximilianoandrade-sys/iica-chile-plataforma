/**
 * Structured logger for production code.
 * Replaces console.* with leveled, contextual logging.
 *
 * Usage:
 *   import { getLogger } from '@/lib/utils/logger';
 *   const logger = getLogger('ModuleName');
 *   logger.info('Operation started', { userId, param1 });
 *   logger.error('Operation failed', error, { context });
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getMinLevel(): LogLevel {
  if (process.env.NODE_ENV === "production") return "info";
  if (process.env.LOG_LEVEL) return process.env.LOG_LEVEL as LogLevel;
  return "debug";
}

interface LogEntry {
  level: LogLevel;
  module: string;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: { name: string; message: string; stack?: string };
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[getMinLevel()];
}

function formatEntry(entry: LogEntry): string {
  const { level, module, message, timestamp, context, error } = entry;
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${module}]`;

  if (process.env.NODE_ENV === "production") {
    // Structured JSON for production log aggregators
    return JSON.stringify(entry);
  }

  // Human-readable for development
  let output = `${prefix} ${message}`;
  if (context && Object.keys(context).length > 0) {
    output += ` ${JSON.stringify(context)}`;
  }
  if (error) {
    output += `\n  Error: ${error.name}: ${error.message}`;
    if (error.stack) output += `\n  ${error.stack}`;
  }
  return output;
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void;
}

function createLogger(module: string): Logger {
  function log(level: LogLevel, message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    if (!shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      module,
      message,
      timestamp: new Date().toISOString(),
    };

    if (context) entry.context = context;
    if (error) {
      if (error instanceof Error) {
        entry.error = { name: error.name, message: error.message, stack: error.stack };
      } else {
        entry.error = { name: "Unknown", message: String(error) };
      }
    }

    const formatted = formatEntry(entry);

    switch (level) {
      case "error":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  return {
    debug: (message, context) => log("debug", message, undefined, context),
    info: (message, context) => log("info", message, undefined, context),
    warn: (message, context) => log("warn", message, undefined, context),
    error: (message, error, context) => log("error", message, error, context),
  };
}

const loggers = new Map<string, Logger>();

/**
 * Get or create a logger instance for the given module name.
 * Module name should match the component/file purpose, not the file path.
 */
export function getLogger(module: string): Logger {
  if (!loggers.has(module)) {
    loggers.set(module, createLogger(module));
  }
  return loggers.get(module)!;
}
