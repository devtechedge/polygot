import { describe, expect, it } from 'vitest'
import { demoChatReply } from './demo-chat'
import type { ChatRequest } from './validation'

function req(partial: Partial<ChatRequest> & { text: string }): ChatRequest {
  return {
    messages: [{ sender: 'YOU', text: partial.text }],
    scenarioTitle: partial.scenarioTitle ?? 'Ordering Tapas at El Sol',
    hostName: partial.hostName ?? 'Mateo',
    dialect: partial.dialect ?? 'Spanish (Spain - Madrid)',
    userLevel: partial.userLevel ?? 'Beginner',
    voiceSpeed: partial.voiceSpeed ?? '1.0x',
  }
}

describe('demoChatReply', () => {
  it('always flags demo mode', () => {
    expect(demoChatReply(req({ text: 'hola' })).demo).toBe(true)
  })

  it('returns a bill line for la cuenta', () => {
    const reply = demoChatReply(req({ text: 'La cuenta, por favor' }))
    expect(reply.hostResponse.toLowerCase()).toContain('cuenta')
    expect(reply.translation.toLowerCase()).toContain('bill')
  })

  it('corrects un copa', () => {
    const reply = demoChatReply(req({ text: 'quiero un copa de vino tinto' }))
    expect(reply.grammarCorrection?.correction).toBe('una copa')
    expect(reply.hostResponse.toLowerCase()).toContain('vino tinto')
  })

  it('routes bicycle helmet talk to Elena', () => {
    const reply = demoChatReply(
      req({ text: 'necesito un casco', scenarioTitle: 'Renting a Bicycle in Barcelona' }),
    )
    expect(reply.hostResponse.toLowerCase()).toContain('casco')
    expect(reply.detectedVocabulary[0].word).toBe('Casco')
  })

  it('routes interview SQL talk to Kenji', () => {
    const reply = demoChatReply(
      req({ text: 'trabajo con base de datos SQL', scenarioTitle: 'Tech Interview in Tokyo' }),
    )
    expect(reply.hostResponse).toMatch(/Postgres|esquema/i)
  })
})
