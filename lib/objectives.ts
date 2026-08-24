/**
 * Marks completed roleplay objectives from the learner's last utterance.
 * Matching is intentionally keyword-based so the HUD can update without the model.
 */
export function applyObjectives(
  scenarioId: string,
  userText: string,
  current: Record<string, boolean>,
): Record<string, boolean> {
  const userTextLower = userText.toLowerCase()
  const updated = { ...current }

  if (scenarioId === 'tapas') {
    if (userTextLower.includes('hola') || userTextLower.includes('buenas')) {
      updated['Greet the host politely'] = true
    }
    if (
      userTextLower.includes('bravas') ||
      userTextLower.includes('vino') ||
      userTextLower.includes('tinto') ||
      userTextLower.includes('copa')
    ) {
      updated['Order standard tapas (Patatas bravas) and red wine (Vino tinto)'] = true
    }
    if (
      userTextLower.includes('cuenta') ||
      userTextLower.includes('pagar') ||
      userTextLower.includes('cobrar')
    ) {
      updated['Ask for the bill (La cuenta, por favor)'] = true
    }
  } else if (scenarioId === 'bicycle') {
    if (
      userTextLower.includes('cuanto') ||
      userTextLower.includes('cuánto') ||
      userTextLower.includes('precio') ||
      userTextLower.includes('alquilar')
    ) {
      updated['Inquire about standard bicycle rental rates'] = true
    }
    if (userTextLower.includes('casco') || userTextLower.includes('seguridad')) {
      updated['Ask about safety helmets (Casco)'] = true
    }
    if (userTextLower.includes('frenos') || userTextLower.includes('bici')) {
      updated['Verify if the brakes (Frenos) are tested'] = true
    }
  } else if (scenarioId === 'interview') {
    if (
      userTextLower.includes('experiencia') ||
      userTextLower.includes('trabajo') ||
      userTextLower.includes('años')
    ) {
      updated['Describe your software engineering experience'] = true
    }
    if (
      userTextLower.includes('base') ||
      userTextLower.includes('datos') ||
      userTextLower.includes('sql') ||
      userTextLower.includes('mongodb')
    ) {
      updated['Discuss database design (Base de datos)'] = true
    }
    if (
      userTextLower.includes('arquitectura') ||
      userTextLower.includes('servidor') ||
      userTextLower.includes('nexa')
    ) {
      updated['Ask questions about NexaGroup architecture'] = true
    }
  }

  return updated
}

export function computeFluencyScore(
  completed: Record<string, boolean>,
  objectives: string[],
): number {
  if (objectives.length === 0) return 0
  const n = objectives.filter((o) => completed[o]).length
  return Math.round((n / objectives.length) * 100)
}

export function computeGrammarScore(correctionCount: number): number {
  return Math.max(40, 100 - correctionCount * 8)
}
