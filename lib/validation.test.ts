import { describe, expect, it } from 'vitest'
import { MAX_MESSAGES, parseChatRequest } from './validation'

describe('parseChatRequest', () => {
  it('rejects non-objects', () => {
    expect(parseChatRequest(null)).toEqual({ error: 'Request body must be a JSON object.' })
    expect(parseChatRequest('nope')).toEqual({ error: 'Request body must be a JSON object.' })
  })

  it('fills defaults and drops empty turns', () => {
    const parsed = parseChatRequest({
      messages: [{ sender: 'YOU', text: '  Hola  ' }, { sender: 'YOU', text: '   ' }],
    })
    expect('error' in parsed).toBe(false)
    if ('error' in parsed) return
    expect(parsed.messages).toEqual([{ sender: 'YOU', text: 'Hola' }])
    expect(parsed.hostName).toBe('Mateo')
    expect(parsed.userLevel).toBe('Beginner')
    expect(parsed.scenarioTitle).toBe('Ordering Tapas at El Sol')
  })

  it('caps message text at 500 chars', () => {
    const parsed = parseChatRequest({
      messages: [{ sender: 'YOU', text: 'x'.repeat(800) }],
    })
    if ('error' in parsed) throw new Error(parsed.error)
    expect(parsed.messages[0].text).toHaveLength(500)
  })

  it('rejects oversized conversations', () => {
    const messages = Array.from({ length: MAX_MESSAGES + 1 }, () => ({
      sender: 'YOU',
      text: 'hola',
    }))
    expect(parseChatRequest({ messages })).toEqual({
      error: `Conversation is capped at ${MAX_MESSAGES} turns.`,
    })
  })

  it('rejects unknown proficiency levels', () => {
    expect(parseChatRequest({ userLevel: 'Native' })).toEqual({
      error: 'userLevel must be Beginner, Intermediate, or Advanced.',
    })
  })

  it('coerces unknown senders to MATEO', () => {
    const parsed = parseChatRequest({
      messages: [{ sender: 'BOT', text: 'hola' }],
      userLevel: 'Advanced',
    })
    if ('error' in parsed) throw new Error(parsed.error)
    expect(parsed.messages[0].sender).toBe('MATEO')
    expect(parsed.userLevel).toBe('Advanced')
  })
})
