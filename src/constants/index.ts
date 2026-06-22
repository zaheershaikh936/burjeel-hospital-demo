export const COLLECTIONS = {
  ROOMS: "rooms",
  BRANDING: "branding",
  AUDIT_LOGS: "auditLogs",
} as const;

export const BRANDING_DOC_ID = "config";

export const PATTERN_LOCK_CODE = "1-2-3-4-5-6-7-8-9"; // Default pattern: all dots in sequence

export const AUTO_LOCK_TIMEOUT_MS = 60_000;

export const QUERY_KEYS = {
  ROOMS: ["rooms"] as const,
  ROOM: (id: string) => ["rooms", id] as const,
  BRANDING: ["branding"] as const,
  AUDIT_LOGS: ["auditLogs"] as const,
} as const;

export const DEPARTMENTS = [
  "ICU",
  "Emergency",
  "Cardiology",
  "Orthopedics",
  "Neurology",
  "Pediatrics",
  "Obstetrics",
  "Oncology",
  "General Surgery",
  "Internal Medicine",
  "Day Care",
  "Operation",
] as const;

export const FLOORS = ["Ground", "1st", "2nd", "3rd", "4th", "5th", "6th"] as const;

export const BUILDINGS = ["Main", "Annex A", "Annex B", "Tower"] as const;
