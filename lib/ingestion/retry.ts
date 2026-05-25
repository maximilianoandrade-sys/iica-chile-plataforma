export async function fetchWithRetry(
  input: string,
  init: RequestInit,
  attempts = 3,
  baseDelayMs = 500,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) return response;

      if (response.status < 500 || attempt === attempts) {
        throw new Error(`HTTP ${response.status}`);
      }

      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error as Error;
      if (attempt === attempts) break;
    }

    const waitMs = baseDelayMs * 2 ** (attempt - 1);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  throw lastError ?? new Error("fetchWithRetry failed");
}
