/**
 * Input Sanitization Utility — XSS Prevention & Data Cleansing
 * Central sanitizer for all text inputs before Firestore writes.
 * Strips HTML tags, script injections, and dangerous characters.
 */

// Regex to match HTML/XML tags including script, style, event handlers
const HTML_TAG_REGEX = /<\/?[^>]+(>|$)/gi;

// Regex to match javascript: protocol URIs
const JS_PROTOCOL_REGEX = /javascript\s*:/gi;

// Regex to match on* event handler attributes (onclick, onerror, etc.)
const EVENT_HANDLER_REGEX = /on\w+\s*=/gi;

// Regex to match data: URIs that could contain executable content
const DATA_URI_REGEX = /data\s*:[^,]*;base64/gi;

/**
 * Sanitize a single text input string.
 * - Strips all HTML/XML tags
 * - Removes javascript: protocol references
 * - Removes event handler patterns (onclick=, onerror=, etc.)
 * - Removes data: URIs with base64 content
 * - Trims whitespace
 * - Returns empty string for null/undefined
 */
export function sanitizeText(input: string | null | undefined): string {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') return String(input);

  let cleaned = input
    .replace(HTML_TAG_REGEX, '')       // Strip HTML tags
    .replace(JS_PROTOCOL_REGEX, '')    // Remove javascript: URIs
    .replace(EVENT_HANDLER_REGEX, '')  // Remove event handlers
    .replace(DATA_URI_REGEX, '')       // Remove data: URIs
    .trim();

  return cleaned;
}

/**
 * Sanitize all string fields in an object (shallow, one level deep).
 * Non-string fields are left untouched.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    const value = result[key];
    if (typeof value === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeText(value);
    }
  }
  return result;
}

/**
 * Sanitize specific known text fields in a daily report row.
 * Call this before any Firestore write for user-supplied data.
 */
export function sanitizeDailyReportInput(row: Record<string, unknown>): Record<string, unknown> {
  const textFields = ['notes', 'mealTypeName', 'ramtalAdjustmentReason', 'attachmentFileName'];
  const result = { ...row };
  for (const field of textFields) {
    if (typeof result[field] === 'string') {
      result[field] = sanitizeText(result[field] as string);
    }
  }
  return result;
}

/**
 * Sanitize revision/rejection reason text.
 */
export function sanitizeReason(reason: string): string {
  return sanitizeText(reason);
}
