import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the Google GenAI SDK with server-side API Key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const { 
      messages, 
      scenarioTitle, 
      hostName, 
      dialect, 
      userLevel,
      voiceSpeed 
    } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        error: "GEMINI_API_KEY is not configured in the workspace secrets. Please add it to Settings > Secrets."
      }, { status: 500 });
    }

    // Build the instruction based on scenario context
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
1. Closely analyze the user's last message for any grammatical, conjugation, or gender agreement errors (e.g., using "un copa" instead of "una copa", "tengo hambre" errors, wrong verb conjugations).
2. If an error is detected, populate the 'grammarCorrection' field. Do not be overly pedantic for advanced levels, but be helpful for beginners. If no error is found, set 'grammarCorrection' to null.

VOCABULARY PARSING:
1. Identify 1 to 3 key Spanish vocabulary words or food/drinks item names mentioned in this turn, provide their English translation, and correct IPA phonetics.

You MUST respond strictly in the requested JSON format.
`;

    // Map history to Gemini content parts
    // We send the system instruction inside the config block
    const prompt = messages && messages.length > 0 
      ? `Conversation History:\n${messages.map((m: any) => `${m.sender === 'MATEO' ? 'Mateo' : 'User'}: ${m.text}`).join('\n')}\n\nMateo, respond to the user's last statement and analyze their grammar.`
      : "Start the conversation by welcoming the user to 'El Sur' and asking what they would like to drink or eat.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hostResponse: {
              type: Type.STRING,
              description: "The host's natural spoken response in Spanish."
            },
            ipaPhonetic: {
              type: Type.STRING,
              description: "The correct IPA pronunciation key for the host's response, e.g. /ˈo.la/ /bjem.beˈni.dos/."
            },
            translation: {
              type: Type.STRING,
              description: "The exact English translation of the host's response."
            },
            grammarCorrection: {
              type: Type.OBJECT,
              description: "Optional. Set if the user made a clear grammatical/gender/conjugation mistake in their last message. If no mistake, set to null.",
              properties: {
                original: {
                  type: Type.STRING,
                  description: "The exact incorrect word or phrase used by the user, e.g., 'un copa'."
                },
                correction: {
                  type: Type.STRING,
                  description: "The correct word or phrase they should have used, e.g., 'una copa'."
                },
                explanation: {
                  type: Type.STRING,
                  description: "Brief, high-impact explanation of why it was wrong, e.g., 'una copa (feminine) instead of un copa'."
                }
              },
              required: ["original", "correction", "explanation"]
            },
            detectedVocabulary: {
              type: Type.ARRAY,
              description: "Array of key vocabulary terms detected in this turn.",
              items: {
                type: Type.OBJECT,
                properties: {
                  word: {
                    type: Type.STRING,
                    description: "Spanish word or phrase, e.g. 'Vino tinto'"
                  },
                  translation: {
                    type: Type.STRING,
                    description: "English translation, e.g. 'Red wine'"
                  },
                  ipa: {
                    type: Type.STRING,
                    description: "IPA phonetics, e.g. /ˈbi.no ˈtin.to/"
                  }
                },
                required: ["word", "translation", "ipa"]
              }
            }
          },
          required: ["hostResponse", "ipaPhonetic", "translation", "detectedVocabulary"]
        }
      }
    });

    const resultText = response.text || "{}";
    return NextResponse.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error in /api/chat route:", error);
    return NextResponse.json({
      error: error.message || "An error occurred while generating content."
    }, { status: 500 });
  }
}
