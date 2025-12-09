// Rate Limiting Mock (In-Memory for MVP)
// In production, use Redis (e.g., Upstash)
const rateLimitMap = new Map<string, number[]>()

export function checkRateLimit(identifier: string, limit: number = 10, windowMs: number = 60000) {
    const now = Date.now()
    const timestamps = rateLimitMap.get(identifier) || []

    // Filter out old
    const windowStart = now - windowMs
    const active = timestamps.filter(t => t > windowStart)

    if (active.length >= limit) {
        throw new Error('Rate limit exceeded. Please try again later.')
    }

    active.push(now)
    rateLimitMap.set(identifier, active)
    return true
}

// Input Validation Helper
// Defining a simple schema validator since we might not have Zod installed
export function validateString(input: unknown, opts: { min?: number, max?: number, email?: boolean } = {}) {
    if (typeof input !== 'string') throw new Error('Invalid input type')

    if (opts.min && input.length < opts.min) throw new Error(`Input too short (min ${opts.min})`)
    if (opts.max && input.length > opts.max) throw new Error(`Input too long (max ${opts.max})`)

    if (opts.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(input)) throw new Error('Invalid email format')
    }

    // Sanitization against XSS (Basic)
    // React handles output escaping, but input should be clean
    if (input.includes('<script>')) throw new Error('Illegal characters detected')

    return input
}
