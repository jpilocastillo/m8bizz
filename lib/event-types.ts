/**
 * Canonical event types for the single-event dashboard and forms.
 * Used to branch form sections and dashboard views.
 */
export const EVENT_TYPES = [
  "Seminar",
  "Current Clients / Cultivation",
  "Referrals",
  "Other",
] as const

export type EventType = (typeof EVENT_TYPES)[number]

/** marketing_type values we treat as Seminar */
const SEMINAR_LABELS = ["Seminar", "Workshop", "Webinar", "Community Event", "Networking"]

/** marketing_type values we treat as Cultivation */
const CULTIVATION_LABELS = ["Current Clients / Cultivation", "Cultivation", "Current Clients", "Client Cultivation"]

/** marketing_type values we treat as Referrals */
const REFERRAL_LABELS = ["Referrals", "Referral", "Referral Program", "Client Referral"]

/**
 * Map stored marketing_type (free text) to a canonical EventType for UI branching.
 */
export function getCanonicalEventType(marketingType: string | null | undefined): EventType {
  if (!marketingType || !marketingType.trim()) return "Other"
  const normalized = marketingType.trim()
  if (SEMINAR_LABELS.some((l) => l.toLowerCase() === normalized.toLowerCase())) return "Seminar"
  if (CULTIVATION_LABELS.some((l) => l.toLowerCase() === normalized.toLowerCase())) return "Current Clients / Cultivation"
  if (REFERRAL_LABELS.some((l) => l.toLowerCase() === normalized.toLowerCase())) return "Referrals"
  return "Other"
}

/**
 * For form submission: get the value to store in marketing_type from the selected EventType.
 * "Other" keeps a custom value; other types use the canonical label.
 */
export function getMarketingTypeForStorage(
  eventType: EventType,
  customMarketingType: string
): string {
  if (eventType === "Other" && customMarketingType?.trim()) return customMarketingType.trim()
  if (eventType === "Seminar") return "Seminar"
  if (eventType === "Current Clients / Cultivation") return "Current Clients / Cultivation"
  if (eventType === "Referrals") return "Referrals"
  return customMarketingType?.trim() || "Other"
}
