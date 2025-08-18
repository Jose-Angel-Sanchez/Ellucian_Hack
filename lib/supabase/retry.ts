// Función para esperar un tiempo determinado
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Función para intentar una operación con reintentos
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError;
  let delay = initialDelay;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Si no es un error de rate limit, no reintentamos
      if (!error?.message?.includes("rate limit")) {
        throw error;
      }

      // Esperar antes del siguiente intento (exponential backoff)
      if (i < maxRetries - 1) {
        await wait(delay);
        delay *= 2; // Duplicar el tiempo de espera para el siguiente intento
      }
    }
  }

  throw lastError;
}

// Función para comprobar rate limit
export function checkRateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Limpiar solicitudes antiguas
  const timestamps = (requests.get(identifier) || []).filter(timestamp => timestamp > windowStart);
  
  // Actualizar timestamps
  requests.set(identifier, timestamps);
  
  // Verificar límite
  if (timestamps.length >= limit) {
    return false;
  }
  
  // Agregar nueva solicitud
  timestamps.push(now);
  requests.set(identifier, timestamps);
  
  return true;
}
