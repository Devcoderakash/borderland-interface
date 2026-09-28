/**
 * Returns the standard localStorage for Supabase auth session persistence.
 */
export function brokeredPreviewStorage() {
  if (typeof window === "undefined") return undefined;
  return localStorage;
}
