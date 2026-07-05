type Bucket = {
  tokens: number;
  lastRefill: number;
};

type LimitConfig = {
  /** Máximo de requests en la ventana. */
  capacity: number;
  /** Ventana de recarga completa, en ms. */
  windowMs: number;
};

// Límites por endpoint. Los de IA son caros (OpenAI/ElevenLabs): estrictos.
const LIMITS = {
  chat: { capacity: 20, windowMs: 60_000 },
  audit: { capacity: 6, windowMs: 60_000 },
  tts: { capacity: 15, windowMs: 60_000 },
  auth: { capacity: 10, windowMs: 60_000 },
  api: { capacity: 120, windowMs: 60_000 },
} satisfies Record<string, LimitConfig>;

const buckets = new Map<string, Bucket>();

// Poda periódica para que el Map no crezca sin límite.
const SWEEP_INTERVAL_MS = 10 * 60_000;
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (now - bucket.lastRefill > SWEEP_INTERVAL_MS) {
      buckets.delete(key);
    }
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;
  return request.headers.get("x-real-ip") ?? "unknown";
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

/**
 * Token bucket en memoria por clave (IP + endpoint). Suficiente para un solo
 * proceso `next start`; si algún día hay múltiples instancias, mover a Redis.
 */
export function checkRateLimit(kind: keyof typeof LIMITS, id: string): RateLimitResult {
  const config = LIMITS[kind];
  const now = Date.now();
  sweep(now);

  const key = `${kind}:${id}`;
  const refillPerMs = config.capacity / config.windowMs;
  const bucket = buckets.get(key) ?? { tokens: config.capacity, lastRefill: now };

  bucket.tokens = Math.min(config.capacity, bucket.tokens + (now - bucket.lastRefill) * refillPerMs);
  bucket.lastRefill = now;

  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    return { ok: false, retryAfterSeconds: Math.ceil((1 - bucket.tokens) / refillPerMs / 1000) };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { ok: true };
}

/** Respuesta 429 estándar para endpoints limitados. */
export function rateLimitResponse(result: Extract<RateLimitResult, { ok: false }>): Response {
  return Response.json(
    { error: "Demasiadas solicitudes. Esperá un momento." },
    {
      status: 429,
      headers: { "Retry-After": String(result.retryAfterSeconds) },
    },
  );
}

/** Aplica límite por IP; null si pasa, Response 429 si no. */
export function enforceRateLimit(kind: keyof typeof LIMITS, request: Request): Response | null {
  const result = checkRateLimit(kind, getClientIp(request));
  if (result.ok) return null;
  return rateLimitResponse(result);
}
