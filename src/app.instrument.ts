import { Logger } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

const logger = new Logger('Sentry');

/**
 * Initializes Sentry for error monitoring and performance tracking.
 *
 * Features:
 * - Error and exception capturing
 * - Performance monitoring with traces
 * - Node.js profiling for deeper insights
 *
 * @param environment - The environment to initialize Sentry for.
 */
export function initSentry(environment: string): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    logger.warn('Sentry DSN not provided, skipping initialization');
    return;
  }

  const tracesSampleRate = Math.min(
    Math.max(Number(process.env.SENTRY_TRACES_SAMPLE_RATE) || 1.0, 0.0),
    1.0,
  );

  const integrations = [nodeProfilingIntegration()];
  const debug = process.env.SENTRY_DEBUG === 'true';

  Sentry.init({
    dsn,
    environment,
    integrations,
    tracesSampleRate,
    debug,
  });

  logger.log(
    `Sentry initialized (env: ${environment}, tracesSampleRate: ${tracesSampleRate}), debug: ${debug})`,
  );
}
