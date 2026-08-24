export const MAX_MESSAGES = 40
export const MAX_MESSAGE_CHARS = 500
export const ALLOWED_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const

export interface ChatMessageIn {
  sender?: unknown
  text?: unknown
}

export interface ChatRequest {
  messages: Array<{ sender: 'MATEO' | 'YOU'; text: string }>
  scenarioTitle: string
  hostName: string
  dialect: string
  userLevel: string
  voiceSpeed: string
}

function asString(value: unknown, fallback = '', max = 120): string {
  if (typeof value !== 'string') return fallback
  return value.slice(0, max).trim()
}

export function parseChatRequest(body: unknown): ChatRequest | { error: string } {
  if (!body || typeof body !== 'object') {
    return { error: 'Request body must be a JSON object.' }
  }

  const raw = body as Record<string, unknown>
  const incoming = Array.isArray(raw.messages) ? (raw.messages as ChatMessageIn[]) : []

  if (incoming.length > MAX_MESSAGES) {
    return { error: `Conversation is capped at ${MAX_MESSAGES} turns.` }
  }

  const messages: ChatRequest['messages'] = []
  for (const item of incoming) {
    const text = asString(item?.text, '', MAX_MESSAGE_CHARS)
    if (!text) continue
    const sender = item?.sender === 'YOU' ? 'YOU' : 'MATEO'
    messages.push({ sender, text })
  }

  const userLevel = asString(raw.userLevel, 'Beginner', 24)
  if (userLevel && !ALLOWED_LEVELS.includes(userLevel as (typeof ALLOWED_LEVELS)[number])) {
    return { error: 'userLevel must be Beginner, Intermediate, or Advanced.' }
  }

  return {
    messages,
    scenarioTitle: asString(raw.scenarioTitle, 'Ordering Tapas at El Sol', 80),
    hostName: asString(raw.hostName, 'Mateo', 40),
    dialect: asString(raw.dialect, 'Spanish (Spain - Madrid)', 80),
    userLevel: userLevel || 'Beginner',
    voiceSpeed: asString(raw.voiceSpeed, '1.0x', 8),
  }
}
