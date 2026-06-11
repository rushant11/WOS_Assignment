export function isNetworkError(message?: string): boolean {
  if (!message) {
    return false;
  }
  const lower = message.toLowerCase();
  return (
    lower.includes('network') ||
    lower.includes('offline') ||
    lower.includes('connection') ||
    lower.includes('timed out')
  );
}
