/**
 * Structured logging utility
 *
 * - Respects NODE_ENV: no console.log in production
 * - JSON format for log aggregation (Vercel logs, Sentry, etc.)
 * - Log levels: debug, info, warn, error
 * - Never logs sensitive data (passwords, tokens, API keys)
 */

const SENSITIVE_KEYS = [
  "password",
  "token",
  "secret",
  "apiKey",
  "api_key",
  "authorization",
  "cookie",
  "session",
  "creditCard",
  "credit_card",
];

function maskSensitive(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") return obj;
  try {
    const cloned = JSON.parse(JSON.stringify(obj));
    const mask = (o: any) => {
      if (!o || typeof o !== "object") return;
      for (const key of Object.keys(o)) {
        if (SENSITIVE_KEYS.some((sk) => key.toLowerCase().includes(sk))) {
          o[key] = "[REDACTED]";
        } else if (typeof o[key] === "object") {
          mask(o[key]);
        }
      }
    };
    mask(cloned);
    return cloned;
  } catch {
    return obj;
  }
}

function format(level: string, message: string, meta?: unknown): string {
  const entry: Record<string, unknown> = {
    ts: new Date().toISOString(),
    level,
    msg: message,
  };
  if (meta) {
    entry.meta = maskSensitive(meta);
  }
  return JSON.stringify(entry);
}

const isProduction = typeof process !== "undefined" && process.env.NODE_ENV === "production";

export const logger = {
  debug: (message: string, meta?: unknown) => {
    if (!isProduction) {
      console.log(format("debug", message, meta));
    }
  },

  info: (message: string, meta?: unknown) => {
    if (!isProduction) {
      console.log(format("info", message, meta));
    }
  },

  warn: (message: string, meta?: unknown) => {
    console.warn(format("warn", message, meta));
  },

  error: (message: string, error?: unknown, meta?: unknown) => {
    const errInfo = error instanceof Error ? { name: error.name, message: error.message } : error;
    const metaObj: Record<string, unknown> = { error: errInfo };
    if (meta) {
      Object.assign(metaObj, meta);
    }
    console.error(format("error", message, metaObj));
  },
};
