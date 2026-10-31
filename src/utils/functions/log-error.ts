// single entry point for server-side failures so a monitoring service can be attached in one place
export function logError(context: string, error: unknown) {
  // eslint-disable-next-line no-console
  console.error(`[${context}]`, error);
}
