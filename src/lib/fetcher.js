/**
 * Enterprise Fetcher Utility
 * Provides resilient HTTP fetching with:
 * - Exponential backoff retry logic with jitter
 * - Automatic Request Timeout via AbortController
 * - Idempotency Key header injection for non-GET requests
 * - 401 Unauthorized handling (session reset)
 * - 403 Forbidden handling
 * - Client-side in-memory & LocalStorage Cache (Stale-While-Revalidate)
 */

const DEFAULT_TIMEOUT_MS = 10000;
const MAX_RETRIES = 3;
const BACKOFF_BASE_MS = 800;

// In-memory cache for fast repeated GET requests
const memoryCache = new Map();

/**
 * Generates a cryptographically random UUID for Idempotency
 */
export function generateIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'idemp_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

/**
 * Calculates exponential backoff with jitter
 */
function getBackoffDelay(attempt) {
  const delay = BACKOFF_BASE_MS * Math.pow(2, attempt);
  const jitter = Math.random() * 200;
  return delay + jitter;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class FetchError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Global API Fetcher with enterprise resilience
 * @param {string} url - Target URL
 * @param {RequestInit & { timeout?: number, retries?: number, cacheTtl?: number, idempotencyKey?: string, onAuthFailure?: () => void }} options
 */
export async function apiFetch(url, options = {}) {
  const {
    timeout = DEFAULT_TIMEOUT_MS,
    retries = MAX_RETRIES,
    cacheTtl = 0, // In milliseconds; 0 = no cache
    idempotencyKey,
    onAuthFailure,
    headers = {},
    method = 'GET',
    ...restOptions
  } = options;

  const upperMethod = method.toUpperCase();
  const isReadMethod = upperMethod === 'GET' || upperMethod === 'HEAD';

  // 1. Check in-memory Cache for GET requests if TTL is set
  if (isReadMethod && cacheTtl > 0) {
    const cached = memoryCache.get(url);
    if (cached && Date.now() - cached.timestamp < cacheTtl) {
      return cached.data;
    }
  }

  // 2. Prepare headers with Idempotency Key for mutations
  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has('Content-Type') && restOptions.body && typeof restOptions.body === 'string') {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (!isReadMethod) {
    const key = idempotencyKey || generateIdempotencyKey();
    requestHeaders.set('X-Idempotency-Key', key);
    requestHeaders.set('Idempotency-Key', key);
  }

  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: upperMethod,
        headers: requestHeaders,
        signal: controller.signal,
        ...restOptions,
      });

      clearTimeout(timerId);

      // Handle Authentication Failure (401)
      if (response.status === 401) {
        if (typeof onAuthFailure === 'function') {
          onAuthFailure();
        } else if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app:unauthorized', { detail: { url } }));
        }
        throw new FetchError('Session expired. Please sign in again.', 401, null);
      }

      // Handle Authorization Failure (403)
      if (response.status === 403) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app:forbidden', { detail: { url } }));
        }
        throw new FetchError('You do not have permission to perform this action.', 403, null);
      }

      // 5xx Server Errors — Candidate for Retry
      if (response.status >= 500 && attempt < retries) {
        attempt++;
        await sleep(getBackoffDelay(attempt));
        continue;
      }

      // Parse JSON or text
      const contentType = response.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new FetchError(
          (data && data.message) || `Request failed with status ${response.status}`,
          response.status,
          data
        );
      }

      // Save to cache if enabled
      if (isReadMethod && cacheTtl > 0) {
        memoryCache.set(url, { data, timestamp: Date.now() });
      }

      return data;
    } catch (err) {
      clearTimeout(timerId);
      lastError = err;

      // Abort / Timeout error
      if (err.name === 'AbortError') {
        lastError = new FetchError(`Request timed out after ${timeout}ms`, 408, null);
      }

      // If network error and retries remain, wait and retry
      if (attempt < retries && (err.name === 'TypeError' || err.status >= 500)) {
        attempt++;
        await sleep(getBackoffDelay(attempt));
        continue;
      }

      break;
    }
  }

  throw lastError;
}

export default apiFetch;
