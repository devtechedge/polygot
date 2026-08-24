export interface WelcomeLine {
  text: string
  ipa: string
  translation: string
}

const WELCOME: Record<string, WelcomeLine> = {
  tapas: {
    text: '¡Hola! Bienvenido a El Sol. ¿Qué te gustaría tomar para empezar?',
    ipa: '/ˈo.la/ /bjem.beˈni.dos/',
    translation: 'Hello! Welcome to El Sol. What would you like to drink to start?',
  },
  bicycle: {
    text: '¡Hola! Buenas tardes. Bienvenido a Rent-A-Bike Barcelona. ¿En qué puedo ayudarte hoy?',
    ipa: '/ˈo.la/ /bwen.as ˈtaɾ.ðes/',
    translation: 'Hello! Good afternoon. Welcome to Rent-A-Bike Barcelona. How can I help you today?',
  },
  interview: {
    text: '¡Hola! Bienvenidos. Soy Kenji, Tech Lead. Cuéntame sobre tu experiencia en programación.',
    ipa: '/ˈo.la/ /bjem.beˈni.dos/',
    translation: 'Hello! Welcome. I am Kenji, Tech Lead. Tell me about your experience in programming.',
  },
}

export function getWelcome(scenarioId: string): WelcomeLine {
  return WELCOME[scenarioId] ?? WELCOME.tapas
}
