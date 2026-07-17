/**
 * Production-safe logger utility.
 *
 * In development (import.meta.env.DEV === true):
 *   - All log methods work normally.
 *
 * In production (import.meta.env.PROD === true):
 *   - All methods are no-ops — no output reaches the browser console.
 *   - Additionally, the Vite build config drops all console.* calls via
 *     esbuild's `drop: ['console', 'debugger']`, so this file's calls are
 *     also removed at bundle time as a second layer of protection.
 *
 * Usage:
 *   import { logger } from "@/lib/logger"
 *   logger.log("hello")        // dev only
 *   logger.error("oops", err)  // dev only
 */

const isDev = import.meta.env.DEV;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyArgs = any[];

const noop = (): void => { /* silenced in production */ };

export const logger = {
  log:   isDev ? (...args: AnyArgs) => console.log(...args)   : noop,
  warn:  isDev ? (...args: AnyArgs) => console.warn(...args)  : noop,
  error: isDev ? (...args: AnyArgs) => console.error(...args) : noop,
  info:  isDev ? (...args: AnyArgs) => console.info(...args)  : noop,
  debug: isDev ? (...args: AnyArgs) => console.debug(...args) : noop,
  group: isDev ? (...args: AnyArgs) => console.group(...args) : noop,
  groupEnd: isDev ? () => console.groupEnd() : noop,
  table: isDev ? (...args: AnyArgs) => console.table(...args) : noop,
};
