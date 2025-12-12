// Convert Nostr event IDs to short post numbers for display

/**
 * Convert a 64-character hex event ID to a short numeric post number.
 * Uses the first 8 hex characters (32 bits) to create a human-readable number.
 */
export function eventIdToPostNumber(eventId: string): string {
  if (!eventId || eventId.length < 8) {
    return '00000000';
  }
  // Take first 8 hex chars (32 bits) and convert to decimal
  const num = parseInt(eventId.slice(0, 8), 16);
  // Mod to 8 digits max, pad with zeros
  const shortNum = num % 100000000;
  return shortNum.toString().padStart(8, '0');
}

/**
 * Format a post number for display (e.g., "No.12345678")
 */
export function formatPostNumber(eventId: string): string {
  return `No.${eventIdToPostNumber(eventId)}`;
}

/**
 * Create a short reference for quoting (e.g., ">>12345678")
 */
export function formatQuoteRef(eventId: string): string {
  return `>>${eventIdToPostNumber(eventId)}`;
}

/**
 * Extract post numbers from text content (matches >>12345678 patterns)
 */
export function extractQuoteRefs(content: string): string[] {
  const matches = content.match(/>>(\d{6,8})/g);
  if (!matches) return [];
  return matches.map((m) => m.slice(2)); // Remove >> prefix
}

/**
 * Create a lookup map from post numbers to event IDs.
 * Used to resolve >>postnum references to actual events.
 */
export function createPostNumberMap(
  eventIds: string[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const eventId of eventIds) {
    const postNum = eventIdToPostNumber(eventId);
    map.set(postNum, eventId);
  }
  return map;
}
