export type ScenarioLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export interface VocabItem {
  word: string
  ipa: string
  meaning: string
}

export interface Scenario {
  id: string
  title: string
  goal: string
  level: ScenarioLevel
  duration: string
  hostName: string
  hostRole: string
  hostImage: string
  bgGradientClass: string
  objectives: string[]
  keyVocab: VocabItem[]
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'tapas',
    title: 'Ordering Tapas at El Sol',
    goal: 'Order food & drinks',
    level: 'Beginner',
    duration: '5m',
    hostName: 'Mateo',
    hostRole: 'Host at El Sol, Madrid',
    hostImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
    bgGradientClass: 'scenario-card-gradient-1',
    objectives: [
      'Greet the host politely',
      'Order standard tapas (Patatas bravas) and red wine (Vino tinto)',
      'Ask for the bill (La cuenta, por favor)',
    ],
    keyVocab: [
      { word: 'Me gustaría...', ipa: '/me ɣus.ta.ˈri.a/', meaning: 'I would like...' },
      { word: 'La cuenta, por favor', ipa: '/la ˈkwen.ta poɾ fa.ˈβoɾ/', meaning: 'The bill, please' },
      { word: 'Patatas bravas', ipa: '/pa.ˈta.tas ˈbɾa.βas/', meaning: 'Spicy fried potatoes' },
      { word: 'Vino tinto', ipa: '/ˈbi.no ˈtin.to/', meaning: 'Red wine' },
    ],
  },
  {
    id: 'bicycle',
    title: 'Renting a Bicycle in Barcelona',
    goal: 'Inquire about rates & equipment',
    level: 'Intermediate',
    duration: '10m',
    hostName: 'Elena',
    hostRole: 'Rental Manager, Barcelona',
    hostImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=80',
    bgGradientClass: 'scenario-card-gradient-2',
    objectives: [
      'Inquire about standard bicycle rental rates',
      'Ask about safety helmets (Casco)',
      'Verify if the brakes (Frenos) are tested',
    ],
    keyVocab: [
      { word: '¿Cuánto cuesta alquilar...?', ipa: '/ˈkwan.to ˈkwes.ta al.ki.ˈlaɾ/', meaning: 'How much does it cost to rent...?' },
      { word: 'Casco', ipa: '/ˈkas.ko/', meaning: 'Helmet' },
      { word: 'Frenos', ipa: '/ˈfɾe.nos/', meaning: 'Brakes' },
    ],
  },
  {
    id: 'interview',
    title: 'Tech Interview in Tokyo',
    goal: 'Discuss technical background',
    level: 'Advanced',
    duration: '15m',
    hostName: 'Kenji',
    hostRole: 'Tech Lead at NexaGroup',
    hostImage: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=400&h=400&fit=crop&q=80',
    bgGradientClass: 'scenario-card-gradient-3',
    objectives: [
      'Describe your software engineering experience',
      'Discuss database design (Base de datos)',
      'Ask questions about NexaGroup architecture',
    ],
    keyVocab: [
      { word: 'Experiencia laboral', ipa: '/eks.pe.ˈɾjen.θja la.βo.ˈɾal/', meaning: 'Work experience' },
      { word: 'Desarrollador', ipa: '/de.sa.ro.ja.ˈðoɾ/', meaning: 'Developer' },
      { word: 'Base de datos', ipa: '/ˈba.se ðe ˈda.tos/', meaning: 'Database' },
    ],
  },
]

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id)
}
