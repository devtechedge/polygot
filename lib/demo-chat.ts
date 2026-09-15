import type { ChatRequest } from './validation'

export interface GrammarCorrection {
  original: string
  correction: string
  explanation: string
}

export interface DetectedVocab {
  word: string
  translation: string
  ipa: string
}

export interface ChatReply {
  hostResponse: string
  ipaPhonetic: string
  translation: string
  grammarCorrection: GrammarCorrection | null
  detectedVocabulary: DetectedVocab[]
  demo: boolean
}

function lastUserText(req: ChatRequest): string {
  for (let i = req.messages.length - 1; i >= 0; i--) {
    if (req.messages[i].sender === 'YOU') return req.messages[i].text
  }
  return ''
}

function genderCopa(text: string): GrammarCorrection | null {
  if (/\bun copa\b/i.test(text) || /\bun vino\b/i.test(text) && /\bcopa\b/i.test(text)) {
    return {
      original: 'un copa',
      correction: 'una copa',
      explanation: 'copa is feminine - una copa, not un copa.',
    }
  }
  return null
}

export function demoChatReply(req: ChatRequest): ChatReply {
  const spoken = lastUserText(req)
  const lower = spoken.toLowerCase()
  const title = req.scenarioTitle.toLowerCase()

  if (title.includes('bicycle') || title.includes('barcelona')) {
    if (lower.includes('casco')) {
      return {
        hostResponse: 'Claro, el casco está incluido. ¿Quieres también revisar los frenos?',
        ipaPhonetic: '/ˈkla.ɾo el ˈkas.ko esˈta in.kluˈi.ðo/',
        translation: 'Of course, the helmet is included. Do you also want to check the brakes?',
        grammarCorrection: null,
        detectedVocabulary: [{ word: 'Casco', translation: 'Helmet', ipa: '/ˈkas.ko/' }],
        demo: true,
      }
    }
    if (lower.includes('frenos') || lower.includes('bici')) {
      return {
        hostResponse: 'Los frenos están revisados esta mañana. Puedes salir cuando quieras.',
        ipaPhonetic: '/los ˈfɾe.nos esˈtan re.βiˈsa.ðos/',
        translation: 'The brakes were checked this morning. You can head out whenever you like.',
        grammarCorrection: null,
        detectedVocabulary: [{ word: 'Frenos', translation: 'Brakes', ipa: '/ˈfɾe.nos/' }],
        demo: true,
      }
    }
    return {
      hostResponse: 'Son doce euros por día, casco incluido. ¿Para cuántas horas la necesitas?',
      ipaPhonetic: '/son ˈðo.θe ˈew.ɾos poɾ ˈði.a/',
      translation: 'It is twelve euros per day, helmet included. How many hours do you need it?',
      grammarCorrection: null,
      detectedVocabulary: [
        { word: '¿Cuánto cuesta alquilar...?', translation: 'How much does it cost to rent...?', ipa: '/ˈkwan.to ˈkwes.ta al.ki.ˈlaɾ/' },
      ],
      demo: true,
    }
  }

  if (title.includes('interview') || title.includes('tokyo') || title.includes('nexa')) {
    if (lower.includes('base') || lower.includes('datos') || lower.includes('sql')) {
      return {
        hostResponse: 'Bien. En NexaGroup usamos Postgres. ¿Cómo modelarías un esquema de usuarios?',
        ipaPhonetic: '/bjen en ˈnek.sa ɡɾup ˈu.sa.mos posˈtɾes/',
        translation: 'Good. At NexaGroup we use Postgres. How would you model a users schema?',
        grammarCorrection: null,
        detectedVocabulary: [{ word: 'Base de datos', translation: 'Database', ipa: '/ˈba.se ðe ˈda.tos/' }],
        demo: true,
      }
    }
    if (lower.includes('arquitectura') || lower.includes('nexa') || lower.includes('servidor')) {
      return {
        hostResponse: 'Nuestra arquitectura es de servicios. ¿Tienes preguntas sobre el equipo?',
        ipaPhonetic: '/ˈnwes.tɾa aɾ.ki.tekˈtu.ɾa es ðe seɾˈβi.θjos/',
        translation: 'Our architecture is service-based. Do you have questions about the team?',
        grammarCorrection: null,
        detectedVocabulary: [{ word: 'Arquitectura', translation: 'Architecture', ipa: '/aɾ.ki.tekˈtu.ɾa/' }],
        demo: true,
      }
    }
    return {
      hostResponse: 'Gracias. Cuéntame un proyecto reciente como desarrollador.',
      ipaPhonetic: '/ˈɡɾa.θjas ˈkwen.ta.me un pɾoˈjek.to reˈθjen.te/',
      translation: 'Thank you. Tell me about a recent project as a developer.',
      grammarCorrection: null,
      detectedVocabulary: [{ word: 'Desarrollador', translation: 'Developer', ipa: '/de.sa.ro.ja.ˈðoɾ/' }],
      demo: true,
    }
  }

  // Default: El Sol tapas bar
  if (lower.includes('cuenta') || lower.includes('pagar')) {
    return {
      hostResponse: 'Por supuesto. Ahora mismo te traigo la cuenta.',
      ipaPhonetic: '/poɾ suˈpwes.to aˈo.ɾa ˈmis.mo te tɾai̯.ɣo la ˈkwen.ta/',
      translation: 'Of course. I will bring you the bill right now.',
      grammarCorrection: null,
      detectedVocabulary: [{ word: 'La cuenta, por favor', translation: 'The bill, please', ipa: '/la ˈkwen.ta poɾ fa.ˈβoɾ/' }],
      demo: true,
    }
  }

  if (lower.includes('bravas') || lower.includes('vino') || lower.includes('tinto') || lower.includes('copa')) {
    return {
      hostResponse: 'Perfecto. Unas patatas bravas y una copa de vino tinto. ¿Algo más?',
      ipaPhonetic: '/peɾˈfek.to ˈu.nas paˈta.tas ˈbɾa.βas i ˈu.na ˈko.pa ðe ˈβi.no ˈtin.to/',
      translation: 'Perfect. Some patatas bravas and a glass of red wine. Anything else?',
      grammarCorrection: genderCopa(spoken),
      detectedVocabulary: [
        { word: 'Patatas bravas', translation: 'Spicy fried potatoes', ipa: '/pa.ˈta.tas ˈbɾa.βas/' },
        { word: 'Vino tinto', translation: 'Red wine', ipa: '/ˈbi.no ˈtin.to/' },
      ],
      demo: true,
    }
  }

  return {
    hostResponse: '¡Hola! Bienvenido a El Sol. ¿Quieres unas tapas o algo para beber?',
    ipaPhonetic: '/ˈo.la bjem.beˈni.ðo a el sol/',
    translation: 'Hello! Welcome to El Sol. Would you like some tapas or something to drink?',
    grammarCorrection: genderCopa(spoken),
    detectedVocabulary: [{ word: 'Me gustaría...', translation: 'I would like...', ipa: '/me ɣus.ta.ˈri.a/' }],
    demo: true,
  }
}
