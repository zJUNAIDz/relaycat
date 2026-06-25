import { isAxiosError } from "axios";

/**
 * Shape of the error payloads our API returns. The server is inconsistent and
 * uses both `error` and `message`, so we read either.
 */
interface ApiErrorBody {
  error?: string;
  message?: string;
}

/**
 * Turn any thrown value into a single, human-readable sentence that is safe to
 * show to a user. Prefer a message the server sent us, then fall back to a
 * friendly message based on the HTTP status, then a generic catch-all.
 */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const body = error.response?.data as ApiErrorBody | undefined;
    const serverMessage = body?.error ?? body?.message;
    if (serverMessage) return serverMessage;

    if (error.code === "ERR_NETWORK") {
      return "Can't reach the server. Check your connection and try again.";
    }

    switch (status) {
      case 400:
        return "That request couldn't be processed. Please check your input.";
      case 401:
        return "Your session has expired. Please sign in again.";
      case 403:
        return "You don't have permission to do that.";
      case 404:
        return "We couldn't find what you were looking for.";
      case 429:
        return "You're doing that too quickly. Please slow down and try again.";
      default:
        if (status && status >= 500) {
          return "Something went wrong on our end. Please try again shortly.";
        }
        return "Something went wrong. Please try again.";
    }
  }

  if (error instanceof Error && error.message) return error.message;

  return "Something unexpected happened. Please try again.";
}

/**
 * Single place to log errors. Swap the body for Sentry/LogRocket/etc. later
 * without touching call sites.
 */
export function logError(scope: string, error: unknown): void {
  console.error(`[${scope}]`, error);
}
