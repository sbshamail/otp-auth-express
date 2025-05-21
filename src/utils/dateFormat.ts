// Validate ISO or "dd-mm-yyyy HH:mm"
export function validateUtcOrDmyDate(dateStr: string): boolean {
  if (typeof dateStr !== "string") return false;

  const isoUtcRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?Z$/;
  const dmyWithTimeRegex = /^\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2}$/;

  return isoUtcRegex.test(dateStr) || dmyWithTimeRegex.test(dateStr);
}
// Parse to UTC Date from ISO or "dd-mm-yyyy HH:mm"
export function parseToUtcDate(dateStr: string): Date | null {
  if (!validateUtcOrDmyDate(dateStr)) return null;

  // ISO format
  if (dateStr.endsWith("Z")) {
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  // "dd-mm-yyyy HH:mm" format
  const dmyMatch = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!dmyMatch) return null;

  const [, dd, mm, yyyy, HH, MM] = dmyMatch.map(Number);
  const date = new Date(Date.UTC(yyyy, mm - 1, dd, HH, MM));
  return isNaN(date.getTime()) ? null : date;
}

export const hasHourMin = (dateString: string): boolean => {
  // Check for ISO UTC format with time
  const isoMatch = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateString);

  // Check for dd-mm-yyyy HH:mm format
  const dmyWithTime = /^\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2}/.test(dateString);

  return isoMatch || dmyWithTime;
};
