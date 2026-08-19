export async function fetchWithRetry(
  input: string,
  init: RequestInit,
  attempts = 3,
  baseDelayMs = 500,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(input, {
        ...init,
        signal: init?.signal ?? AbortSignal.timeout(30000),
      });

      if (response.ok) return response;

      lastError = new Error(`HTTP ${response.status}`);
      if (response.status < 500 || attempt === attempts) {
        throw lastError;
      }
    } catch (error) {
      lastError = error as Error;
      if (attempt === attempts || (lastError.message && lastError.message.startsWith('HTTP ') && !['HTTP 500', 'HTTP 502', 'HTTP 503', 'HTTP 504'].includes(lastError.message))) {
        throw lastError;
      }
    }

    const waitMs = baseDelayMs * 2 ** (attempt - 1);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  throw lastError ?? new Error(`fetchWithRetry failed for ${input}`);
}
