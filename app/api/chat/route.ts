import { GoogleGenAI, Type } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'
import { demoChatReply } from '@/lib/demo-chat'
import { parseChatRequest } from '@/lib/validation'

export const runtime = 'nodejs'

function geminiClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  return new GoogleGenAI({ apiKey })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = parseChatRequest(body)
    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const ai = geminiClient()
    if (!ai) {
      return NextResponse.json(demoChatReply(parsed))
    }

    const { messages, scenarioTitle, hostName, dialect, userLevel, voiceSpeed } = parsed

    const systemInstruction = `
You are an advanced live speech roleplay assistant for language learning.
You are playing the role of ${hostName}, the AI Host for the scenario: "${scenarioTitle}".
Current user proficiency level: ${userLevel}.
Target dialect: ${dialect}.
AI speech rate to simulate: ${voiceSpeed}.

ROLEPLAY RULES:
1. Speak naturally in Spanish, keeping your responses short (1 to 3 sentences maximum) to maintain conversational fluidity.
2. Adapt your vocabulary complexity and speed to match the user's level (${userLevel}).
3. Ensure your pronunciation key is in the correct International Phonetic Alphabet (IPA).

GRAMMAR FEEDBACK RULES:
1. Closely analyze the user's last message for any grammatical, conjugation, or gender agreement errors.
2. If an error is detected, populate the 'grammarCorrection' field. If no error is found, set 'grammarCorrection' to null.

VOCABULARY PARSING:
1. Identify 1 to 3 key Spanish vocabulary words mentioned in this turn, provide their English translation, and correct IPA phonetics.

You MUST respond strictly in the requested JSON format.
`

    const prompt =
      messages.length > 0
        ? `Conversation History:\n${messages
            .map((m) => `${m.sender === 'YOU' ? 'User' : hostName}: ${m.text}`)
            .join('\n')}\n\n${hostName}, respond to the user's last statement and analyze their grammar.`
        : `Start the conversation by welcoming the user to the scenario "${scenarioTitle}".`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hostResponse: {
              type: Type.STRING,
              description: "The host's natural spoken response in Spanish.",
            },
            ipaPhonetic: {
              type: Type.STRING,
              description: "IPA pronunciation key for the host's response.",
            },
            translation: {
              type: Type.STRING,
              description: "English translation of the host's response.",
            },
            grammarCorrection: {
              type: Type.OBJECT,
              description: 'Set if the user made a clear grammar mistake; otherwise null.',
              properties: {
                original: { type: Type.STRING },
                correction: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ['original', 'correction', 'explanation'],
            },
            detectedVocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  translation: { type: Type.STRING },
                  ipa: { type: Type.STRING },
                },
                required: ['word', 'translation', 'ipa'],
              },
            },
          },
          required: ['hostResponse', 'ipaPhonetic', 'translation', 'detectedVocabulary'],
        },
      },
    })

    const resultText = response.text || '{}'
    const parsedJson = JSON.parse(resultText)
    return NextResponse.json({ ...parsedJson, demo: false })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while generating content.'
    console.error('Error in /api/chat route:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
