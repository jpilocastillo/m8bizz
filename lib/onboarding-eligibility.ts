/**
 * Spotlight tours are only offered to recently created accounts so returning users are not prompted.
 * Adjust window if product needs a longer onboarding period.
 */
export const BRAND_NEW_ACCOUNT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

/** Uses Supabase auth user.created_at (ISO string). */
export function isBrandNewUser(user: { created_at?: string } | null | undefined): boolean {
  if (!user?.created_at) return false
  const created = new Date(user.created_at).getTime()
  if (Number.isNaN(created)) return false
  return Date.now() - created <= BRAND_NEW_ACCOUNT_MAX_AGE_MS
}
