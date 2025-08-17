// Constants for rate limiting
export const MAX_REQUESTS = 100 // Maximum requests per window
export const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds
export const RETRY_ATTEMPTS = 3
export const RETRY_DELAY = 1000 // 1 second

// Store for rate limiting
interface RequestCount {
  count: number
  timestamp: number
}

const requestCounts = new Map<string, RequestCount>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now()
  const requestData = requestCounts.get(identifier) || { count: 0, timestamp: now }

  // Reset count if window has passed
  if (now - requestData.timestamp > windowMs) {
    requestData.count = 1
    requestData.timestamp = now
    requestCounts.set(identifier, requestData)
    return true
  }

  // Increment count and check against limit
  requestData.count++
  requestCounts.set(identifier, requestData)
  return requestData.count <= maxRequests
}

// Retry operation with exponential backoff
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxAttempts: number = RETRY_ATTEMPTS,
  initialDelay: number = RETRY_DELAY
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      if (attempt === maxAttempts) break

      // Exponential backoff
      const delay = initialDelay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error('Operation failed after multiple attempts')
}
