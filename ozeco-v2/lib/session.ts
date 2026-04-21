import "server-only";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "ozeco_session";

/**
 * Read the session ID from the request cookie.
 * Throws if the middleware didn't get a chance to set one — this should
 * be unreachable in practice since middleware runs on every page request.
 */
export async function getSessionId(): Promise<string> {
  const jar = await cookies();
  const value = jar.get(SESSION_COOKIE)?.value;
  if (!value) {
    throw new Error(
      `Missing ${SESSION_COOKIE} cookie — middleware did not run before this handler.`
    );
  }
  return value;
}

/** Non-throwing variant — returns null if no session has been issued yet. */
export async function getOptionalSessionId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}
