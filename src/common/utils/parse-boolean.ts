/**
 * Converts a value to a boolean using common truthy patterns
 * @param value The value to convert
 * @returns The boolean value
 */
export function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    return ['true', '1', 'yes', 'on'].includes(normalized);
  }

  return false;
}
