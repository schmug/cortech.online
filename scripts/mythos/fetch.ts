export class FetchError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

const DEFAULT_TIMEOUT_MS = 30_000;

export async function fetchPayload(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  } catch (err) {
    throw new FetchError(`fetch failed for ${url}`, err);
  }
  if (!response.ok) {
    throw new FetchError(`fetch ${url} returned HTTP ${response.status}`);
  }
  try {
    return (await response.json()) as unknown;
  } catch (err) {
    throw new FetchError(`fetch ${url} returned malformed JSON`, err);
  }
}
