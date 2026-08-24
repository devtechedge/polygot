import { describe, expect, it } from 'vitest'
import { applyObjectives, computeFluencyScore, computeGrammarScore } from './objectives'

describe('applyObjectives', () => {
  it('marks the tapas greeting on hola', () => {
    const next = applyObjectives('tapas', 'Hola, buenas noches', {})
    expect(next['Greet the host politely']).toBe(true)
    expect(next['Ask for the bill (La cuenta, por favor)']).toBeUndefined()
  })

  it('marks tapas food and bill from one utterance', () => {
    const next = applyObjectives('tapas', 'unas patatas bravas y la cuenta por favor', {})
    expect(next['Order standard tapas (Patatas bravas) and red wine (Vino tinto)']).toBe(true)
    expect(next['Ask for the bill (La cuenta, por favor)']).toBe(true)
  })

  it('marks bicycle helmet + brakes', () => {
    const next = applyObjectives('bicycle', 'necesito un casco y revisar los frenos', {})
    expect(next['Ask about safety helmets (Casco)']).toBe(true)
    expect(next['Verify if the brakes (Frenos) are tested']).toBe(true)
  })

  it('accepts cuánto with accent for rental rates', () => {
    const next = applyObjectives('bicycle', '¿Cuánto cuesta alquilar?', {})
    expect(next['Inquire about standard bicycle rental rates']).toBe(true)
  })

  it('marks interview database talk', () => {
    const next = applyObjectives('interview', 'tengo experiencia en base de datos SQL', {})
    expect(next['Describe your software engineering experience']).toBe(true)
    expect(next['Discuss database design (Base de datos)']).toBe(true)
  })

  it('does not invent keys for unknown scenarios', () => {
    expect(applyObjectives('unknown', 'hola', {})).toEqual({})
  })
})

describe('computeFluencyScore', () => {
  const objs = ['a', 'b', 'c']

  it('returns 0 with no objectives', () => {
    expect(computeFluencyScore({}, [])).toBe(0)
  })

  it('returns 0 when none complete', () => {
    expect(computeFluencyScore({}, objs)).toBe(0)
  })

  it('returns 67 when two of three complete', () => {
    expect(computeFluencyScore({ a: true, b: true }, objs)).toBe(67)
  })

  it('returns 100 when all complete', () => {
    expect(computeFluencyScore({ a: true, b: true, c: true }, objs)).toBe(100)
  })
})

describe('computeGrammarScore', () => {
  it('starts at 100 and floors at 40', () => {
    expect(computeGrammarScore(0)).toBe(100)
    expect(computeGrammarScore(1)).toBe(92)
    expect(computeGrammarScore(20)).toBe(40)
  })
})
