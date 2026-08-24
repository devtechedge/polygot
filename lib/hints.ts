export interface Hint {
  spanish: string
  english: string
  ipa: string
}

const HINTS: Record<string, Hint[]> = {
  tapas: [
    {
      spanish: 'Me gustaría una copa de vino tinto, por favor.',
      english: 'I would like a glass of red wine, please.',
      ipa: "/me ɣus.ta.'ri.a 'u.na 'ko.pa ðe 'βi.no 'tin.to por fa.'βor/",
    },
    {
      spanish: 'Hola, buenas noches. ¿Me puede traer unas patatas bravas?',
      english: 'Hello, good evening. Can you bring me some spicy fried potatoes?',
      ipa: '/ˈo.la, ˈbwen.as ˈno.t͡ʃes. me ˈpwe.ðe tɾa.ˈeɾ ˈu.nas pa.ˈta.tas ˈbɾa.βas/',
    },
    {
      spanish: 'La cuenta, por favor, cuando pueda.',
      english: 'The bill, please, when you can.',
      ipa: '/la ˈkwen.ta poɾ fa.ˈβoɾ, ˈkwan.ðo ˈpwe.ða/',
    },
  ],
  bicycle: [
    {
      spanish: '¿Cuánto cuesta alquilar una bicicleta por día?',
      english: 'How much does it cost to rent a bicycle per day?',
      ipa: '/ˈkwan.to ˈkwes.ta al.ki.ˈlaɾ ˈu.na βi.θi.ˈkle.ta poɾ ˈði.a/',
    },
    {
      spanish: 'Necesito un casco de seguridad también, por favor.',
      english: 'I need a safety helmet as well, please.',
      ipa: '/ne.θe.ˈsi.to un ˈkas.ko ðe se.ɣu.ˈɾi.ðað tam.ˈbjen, poɾ fa.ˈβoɾ/',
    },
  ],
  interview: [
    {
      spanish: 'Tengo cinco años de experiencia laboral como desarrollador.',
      english: 'I have five years of work experience as a developer.',
      ipa: '/ˈteŋ.ɡo ˈθiŋ.ko ˈa.ɲos ðe eks.pe.ˈɾjen.θja la.βo.ˈɾal ˈko.mo ðe.sa.ro.ja.ˈðoɾ/',
    },
    {
      spanish: 'Tengo experiencia en el diseño de base de datos relacionales.',
      english: 'I have experience in relational database design.',
      ipa: '/ˈteŋ.ɡo eks.pe.ˈɾjen.θja en el ði.ˈse.ɲo ðe ˈba.se ðe ˈda.tos/',
    },
  ],
}

export function getHints(scenarioId: string): Hint[] {
  return HINTS[scenarioId] ?? HINTS.tapas
}

export function pickHint(scenarioId: string, index = 0): Hint {
  const list = getHints(scenarioId)
  const safe = ((index % list.length) + list.length) % list.length
  return list[safe]
}
