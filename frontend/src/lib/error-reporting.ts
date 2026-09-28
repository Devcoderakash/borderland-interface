/**
 * Generic client-side error reporter.
 *
 * Reports errors to the browser console. Extend this function to integrate
 * with your preferred error monitoring service (Sentry, Datadog, etc.).
 */
export function reportClientError(
  error: unknown,
  context: Record<string, unknown> = {},
) {
  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  console.error("[App Error]", message, context);
}
