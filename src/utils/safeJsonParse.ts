export function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}
