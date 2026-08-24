import { describe, expect, it } from 'vitest'
import { SCENARIOS, getScenario } from './scenarios'
import { getWelcome } from './welcome'
import { getHints, pickHint } from './hints'

describe('scenarios catalog', () => {
  it('ships three roleplays with hosts and vocab', () => {
    expect(SCENARIOS.map((s) => s.id)).toEqual(['tapas', 'bicycle', 'interview'])
    for (const scenario of SCENARIOS) {
      expect(scenario.objectives.length).toBeGreaterThanOrEqual(3)
      expect(scenario.keyVocab.length).toBeGreaterThanOrEqual(3)
      expect(scenario.hostName.length).toBeGreaterThan(0)
    }
  })

  it('looks up by id and misses unknown ids', () => {
    expect(getScenario('tapas')?.hostName).toBe('Mateo')
    expect(getScenario('missing')).toBeUndefined()
  })
})

describe('welcome + hints', () => {
  it('returns a Spanish welcome for each scenario', () => {
    expect(getWelcome('tapas').text).toContain('El Sol')
    expect(getWelcome('bicycle').text).toContain('Barcelona')
    expect(getWelcome('interview').text).toContain('Kenji')
    expect(getWelcome('nope').text).toContain('El Sol')
  })

  it('wraps hint index instead of throwing', () => {
    const first = pickHint('tapas', 0)
    expect(pickHint('tapas', getHints('tapas').length).spanish).toBe(first.spanish)
    expect(getHints('missing').length).toBeGreaterThan(0)
  })
})
