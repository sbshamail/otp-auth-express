export function validateUtcOrDmyDate(dateStr: string): boolean {
  if (typeof dateStr !== "string") return false;

  const isoUtcRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
  const dmyRegex = /^\d{2}-\d{2}-\d{4}$/;

  return isoUtcRegex.test(dateStr) || dmyRegex.test(dateStr);
}

export function parseToUtcDate(dateStr: string): Date | null {
  if (!validateUtcOrDmyDate(dateStr)) return null;

  if (dateStr.endsWith("Z")) {
    return new Date(dateStr); // ISO string, safe to parse directly
  }

  // Handle dd-mm-yyyy manually, force UTC midnight
  const [day, month, year] = dateStr.split("-").map(Number);
  if (!day || !month || !year) return null;

  // Construct UTC Date at midnight
  const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  return utcDate;
}
