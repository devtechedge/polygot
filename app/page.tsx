'use client';

import * as React from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  ChevronRight, 
  Volume2, 
  ArrowLeft, 
  Check, 
  RefreshCw, 
  Settings, 
  HelpCircle, 
  User, 
  Sparkles, 
  BookOpen, 
  AlertTriangle, 
  Flame, 
  Globe, 
  ArrowRight,
  PhoneOff,
  Lightbulb,
  CheckCircle2,
  Lock,
  Play,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Define Scenarios Schema
interface Scenario {
  id: string;
  title: string;
  goal: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  hostName: string;
  hostRole: string;
  hostImage: string;
  bgGradientClass: string;
  objectives: string[];
  keyVocab: {
    word: string;
    ipa: string;
    meaning: string;
  }[];
}

const SCENARIOS: Scenario[] = [
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
      'Ask for the bill (La cuenta, por favor)'
    ],
    keyVocab: [
      { word: 'Me gustaría...', ipa: '/me ɣus.ta.ˈri.a/', meaning: 'I would like...' },
      { word: 'La cuenta, por favor', ipa: '/la ˈkwen.ta poɾ fa.ˈβoɾ/', meaning: 'The bill, please' },
      { word: 'Patatas bravas', ipa: '/pa.ˈta.tas ˈbɾa.βas/', meaning: 'Spicy fried potatoes' },
      { word: 'Vino tinto', ipa: '/ˈbi.no ˈtin.to/', meaning: 'Red wine' }
    ]
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
      'Verify if the brakes (Frenos) are tested'
    ],
    keyVocab: [
      { word: '¿Cuánto cuesta alquilar...?', ipa: '/ˈkwan.to ˈkwes.ta al.ki.ˈlaɾ/', meaning: 'How much does it cost to rent...?' },
      { word: 'Casco', ipa: '/ˈkas.ko/', meaning: 'Helmet' },
      { word: 'Frenos', ipa: '/ˈfɾe.nos/', meaning: 'Brakes' }
    ]
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
      'Ask questions about NexaGroup architecture'
    ],
    keyVocab: [
      { word: 'Experiencia laboral', ipa: '/eks.pe.ˈɾjen.θja la.βo.ˈɾal/', meaning: 'Work experience' },
      { word: 'Desarrollador', ipa: '/de.sa.ro.ja.ˈðoɾ/', meaning: 'Developer' },
      { word: 'Base de datos', ipa: '/ˈba.se ðe ˈda.tos/', meaning: 'Database' }
    ]
  }
];

export default function PolyGlotLive() {
  // Device & Layout toggles (User can switch between seeing standard desktop landing vs mobile app views)
  const [deviceMode, setDeviceMode] = React.useState<'MOBILE' | 'DESKTOP'>('MOBILE');

  // Core App Views Router
  const [currentView, setCurrentView] = React.useState<
    'HUB' | 'BRIEFING' | 'HUD' | 'HINT' | 'SCORECARD' | 'VOCAB_PRACTICE' | 'SETTINGS' | 'RECONNECTING' | 'WEB_LANDING' | 'WEB_STUDIO'
  >('HUB');

  // Shared Global States
  const [selectedScenario, setSelectedScenario] = React.useState<Scenario>(SCENARIOS[0]);
  const [streak, setStreak] = React.useState<number>(12);
  const [passportLevel, setPassportLevel] = React.useState<number>(14);

  // Voice engine configurations
  const [dialect, setDialect] = React.useState<string>('Spanish (Spain - Madrid)');
  const [voiceSpeed, setVoiceSpeed] = React.useState<number>(1.0); // Multiplier
  const [speechRateLabel, setSpeechRateLabel] = React.useState<'0.8x' | '1.0x' | '1.2x'>('1.0x');
  const [isMuted, setIsMuted] = React.useState<boolean>(false);

  // In-Call Session State
  const [messages, setMessages] = React.useState<Array<{
    sender: 'MATEO' | 'YOU';
    text: string;
    translation?: string;
    ipa?: string;
  }>>([]);
  
  const [grammarToasts, setGrammarToasts] = React.useState<Array<{
    original: string;
    correction: string;
    explanation: string;
  }>>([]);
  
  const [detectedVocabList, setDetectedVocabList] = React.useState<Array<{
    word: string;
    translation: string;
    ipa: string;
  }>>([]);

  const [objectivesCompleted, setObjectivesCompleted] = React.useState<Record<string, boolean>>({});

  // Hint overlay states
  const [currentHint, setCurrentHint] = React.useState<{
    spanish: string;
    english: string;
    ipa: string;
  } | null>(null);

  // Study states
  const [vocabIndex, setVocabIndex] = React.useState<number>(0);
  const [masteredCount, setMasteredCount] = React.useState<number>(3);

  // Connection & WebAudio states
  const [isListening, setIsListening] = React.useState<boolean>(false);
  const [isAISpeaking, setIsAISpeaking] = React.useState<boolean>(false);
  const [userSpeechDraft, setUserSpeechDraft] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isTypingInputMode, setIsTypingInputMode] = React.useState<boolean>(false);
  const [typedInputText, setTypedInputText] = React.useState<string>('');

  // Web Speech references
  const recognitionRef = React.useRef<any>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);

  // Keep a stable ref to state-dependent handler to avoid useEffect dependency churn
  const handleUserSpeechRef = React.useRef<(speechText: string) => Promise<void> | void>(null as any);
  React.useEffect(() => {
    handleUserSpeechRef.current = handleUserSpeech;
  });

  // Set up Speech Recognition on mount if in browser
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'es-ES'; // Spanish default for the voice engine

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        rec.onresult = (event: any) => {
          const speechToText = event.results[0][0].transcript;
          if (speechToText) {
            handleUserSpeechRef.current(speechToText);
          }
        };

        rec.onerror = (err: any) => {
          console.error("Speech Recognition Error:", err);
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, [selectedScenario, dialect]);

  // Voice synthesis text-to-speech output
  const speakAIResponse = (text: string) => {
    if (isMuted) return;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = dialect.includes('Latin') ? 'es-MX' : 'es-ES';
      utterance.rate = voiceSpeed;

      utterance.onstart = () => {
        setIsAISpeaking(true);
      };

      utterance.onend = () => {
        setIsAISpeaking(false);
      };

      utterance.onerror = () => {
        setIsAISpeaking(false);
      };

      // Find an appropriate Spanish voice
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => v.lang.startsWith('es'));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  // Connect & welcome trigger on starting scenario
  const startScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setObjectivesCompleted({});
    
    // Set initial greeting
    const welcomeText = scenario.id === 'tapas'
      ? `¡Hola! Bienvenido a El Sol. ¿Qué te gustaría tomar para empezar?`
      : scenario.id === 'bicycle'
      ? `¡Hola! Buenas tardes. Bienvenido a Rent-A-Bike Barcelona. ¿En qué puedo ayudarte hoy?`
      : `¡Hola! Bienvenidos. Soy Kenji, Tech Lead. Cuéntame sobre tu experiencia en programación.`;

    const welcomeIpa = scenario.id === 'tapas'
      ? `/ˈo.la/ /bjem.beˈni.dos/`
      : `/ˈo.la/ /bwen.as ˈtaɾ.ðes/`;

    const welcomeTranslation = scenario.id === 'tapas'
      ? 'Hello! Welcome to El Sol. What would you like to drink to start?'
      : scenario.id === 'bicycle'
      ? 'Hello! Good afternoon. Welcome to Rent-A-Bike Barcelona. How can I help you today?'
      : 'Hello! Welcome. I am Kenji, Tech Lead. Tell me about your experience in programming.';

    setMessages([
      { sender: 'MATEO', text: welcomeText, ipa: welcomeIpa, translation: welcomeTranslation }
    ]);

    setGrammarToasts([]);
    setDetectedVocabList(scenario.keyVocab.map(v => ({
      word: v.word,
      translation: v.meaning,
      ipa: v.ipa
    })));

    setCurrentView('HUD');

    // Speak initial welcome
    setTimeout(() => {
      speakAIResponse(welcomeText);
    }, 400);
  };

  // Triggers when user transmits a speech segment
  const handleUserSpeech = async (speechText: string) => {
    if (!speechText.trim()) return;

    // Append user message
    const updatedMessages = [
      ...messages,
      { sender: 'YOU' as const, text: speechText }
    ];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: updatedMessages,
          scenarioTitle: selectedScenario.title,
          hostName: selectedScenario.hostName,
          dialect: dialect,
          userLevel: selectedScenario.level,
          voiceSpeed: speechRateLabel
        })
      });

      const data = await response.json();

      if (data.error) {
        // Fallback to Reconnecting Overlay on server/API issues
        setCurrentView('RECONNECTING');
        setIsLoading(false);
        return;
      }

      // 1. Append host response
      setMessages(prev => [
        ...prev,
        {
          sender: 'MATEO',
          text: data.hostResponse,
          ipa: data.ipaPhonetic,
          translation: data.translation
        }
      ]);

      // Speak host response
      speakAIResponse(data.hostResponse);

      // 2. Process grammar correction if any
      if (data.grammarCorrection) {
        const newToast = {
          original: data.grammarCorrection.original,
          correction: data.grammarCorrection.correction,
          explanation: data.grammarCorrection.explanation
        };
        setGrammarToasts(prev => [newToast, ...prev]);
      }

      // 3. Update objectives completion if target words are matching
      const userTextLower = speechText.toLowerCase();
      const updatedObjectives = { ...objectivesCompleted };

      if (selectedScenario.id === 'tapas') {
        if (userTextLower.includes('hola') || userTextLower.includes('buenas')) {
          updatedObjectives['Greet the host politely'] = true;
        }
        if (userTextLower.includes('bravas') || userTextLower.includes('vino') || userTextLower.includes('tinto') || userTextLower.includes('copa')) {
          updatedObjectives['Order standard tapas (Patatas bravas) and red wine (Vino tinto)'] = true;
        }
        if (userTextLower.includes('cuenta') || userTextLower.includes('pagar') || userTextLower.includes('cobrar')) {
          updatedObjectives['Ask for the bill (La cuenta, por favor)'] = true;
        }
      } else if (selectedScenario.id === 'bicycle') {
        if (userTextLower.includes('cuanto') || userTextLower.includes('precio') || userTextLower.includes('alquilar')) {
          updatedObjectives['Inquire about standard bicycle rental rates'] = true;
        }
        if (userTextLower.includes('casco') || userTextLower.includes('seguridad')) {
          updatedObjectives['Ask about safety helmets (Casco)'] = true;
        }
        if (userTextLower.includes('frenos') || userTextLower.includes('bici')) {
          updatedObjectives['Verify if the brakes (Frenos) are tested'] = true;
        }
      } else {
        if (userTextLower.includes('experiencia') || userTextLower.includes('trabajo') || userTextLower.includes('años')) {
          updatedObjectives['Describe your software engineering experience'] = true;
        }
        if (userTextLower.includes('base') || userTextLower.includes('datos') || userTextLower.includes('sql') || userTextLower.includes('mongodb')) {
          updatedObjectives['Discuss database design (Base de datos)'] = true;
        }
        if (userTextLower.includes('arquitectura') || userTextLower.includes('servidor') || userTextLower.includes('nexa')) {
          updatedObjectives['Ask questions about NexaGroup architecture'] = true;
        }
      }
      setObjectivesCompleted(updatedObjectives);

      // 4. Update detected vocabulary chips dynamically
      if (data.detectedVocabulary && data.detectedVocabulary.length > 0) {
        setDetectedVocabList(prev => {
          const existingWords = prev.map(v => v.word.toLowerCase());
          const newItems = data.detectedVocabulary.filter((v: any) => !existingWords.includes(v.word.toLowerCase()));
          return [...prev, ...newItems];
        });
      }

    } catch (err) {
      console.error("Roleplay transmission error:", err);
      setCurrentView('RECONNECTING');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger microphone speech capture
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        // Trigger web-audio context activation for browser policies
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        recognitionRef.current.start();
      } else {
        // Fallback alert or activate typing input mode directly if browser speech isn't supported
        setIsTypingInputMode(true);
      }
    }
  };

  // Hint suggestion generation based on current conversation objectives
  const requestHint = () => {
    const scenarioHints = selectedScenario.id === 'tapas'
      ? [
          { spanish: "Me gustaría una copa de vino tinto, por favor.", english: "I would like a glass of red wine, please.", ipa: "/me ɣus.ta.'ri.a 'u.na 'ko.pa ðe 'βi.no 'tin.to por fa.'βor/" },
          { spanish: "Hola, buenas noches. ¿Me puede traer unas patatas bravas?", english: "Hello, good evening. Can you bring me some spicy fried potatoes?", ipa: "/ˈo.la, ˈbwen.as ˈno.t͡ʃes. me ˈpwe.ðe tɾa.ˈeɾ ˈu.nas pa.ˈta.tas ˈbɾa.βas/" },
          { spanish: "La cuenta, por favor, cuando pueda.", english: "The bill, please, when you can.", ipa: "/la ˈkwen.ta poɾ fa.ˈβoɾ, ˈkwan.ðo ˈpwe.ða/" }
        ]
      : selectedScenario.id === 'bicycle'
      ? [
          { spanish: "¿Cuánto cuesta alquilar una bicicleta por día?", english: "How much does it cost to rent a bicycle per day?", ipa: "/ˈkwan.to ˈkwes.ta al.ki.ˈlaɾ ˈu.na βi.θi.ˈkle.ta poɾ ˈði.a/" },
          { spanish: "Necesito un casco de seguridad también, por favor.", english: "I need a safety helmet as well, please.", ipa: "/ne.θe.ˈsi.to un ˈkas.ko ðe se.ɣu.ˈɾi.ðað tam.ˈbjen, poɾ fa.ˈβoɾ/" }
        ]
      : [
          { spanish: "Tengo cinco años de experiencia laboral como desarrollador.", english: "I have five years of work experience as a developer.", ipa: "/ˈteŋ.ɡo ˈθiŋ.ko ˈa.ɲos ðe eks.pe.ˈɾjen.θja la.βo.ˈɾal ˈko.mo ðe.sa.ro.ja.ˈðoɾ/" },
          { spanish: "Tengo experiencia en el diseño de base de datos relacionales.", english: "I have experience in relational database design.", ipa: "/ˈteŋ.ɡo eks.pe.ˈɾjen.θja en el ði.ˈse.ɲo ðe ˈba.se ðe ˈda.tos/ " }
        ];

    // Pick a random hint that matches uncompleted objectives
    const hint = scenarioHints[Math.floor(Math.random() * scenarioHints.length)];
    setCurrentHint(hint);
    setCurrentView('HINT');
  };

  const handleApplySettings = () => {
    setCurrentView('HUD');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* GLOBAL HEADER & DEVICE SIMULATION CONTROLLER */}
      <div className="bg-white border-b border-slate-100 py-3 px-4 flex flex-col sm:flex-row justify-between items-center gap-3 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-[#0066FF] to-[#00F0FF] p-1.5 rounded-lg text-white">
            <Globe className="w-5 h-5 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight text-slate-900">PolyGlot Live</h1>
            <p className="text-xs text-slate-400 font-sans">Full-Stack Real-Time AI Speech Lab</p>
          </div>
        </div>

        {/* Form factor state controllers */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full text-xs font-medium">
          <button 
            id="mobile-view-btn"
            onClick={() => {
              setDeviceMode('MOBILE');
              if (currentView === 'WEB_LANDING' || currentView === 'WEB_STUDIO') {
                setCurrentView('HUB');
              }
            }}
            className={`px-4 py-1.5 rounded-full transition-all ${deviceMode === 'MOBILE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            📱 Mobile App Preview
          </button>
          <button 
            id="desktop-view-btn"
            onClick={() => {
              setDeviceMode('DESKTOP');
              setCurrentView('WEB_LANDING');
            }}
            className={`px-4 py-1.5 rounded-full transition-all ${deviceMode === 'DESKTOP' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            💻 Desktop Web Studio
          </button>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center p-0 md:p-6 bg-slate-50">
        
        {/* ========================================================= */}
        {/* MOBILE VIEWPORT SIMULATOR FRAME */}
        {/* ========================================================= */}
        {deviceMode === 'MOBILE' && (
          <div className="w-full max-w-md bg-white min-h-[760px] md:min-h-[820px] md:rounded-[40px] md:shadow-2xl md:border-[10px] md:border-slate-900 relative flex flex-col overflow-hidden font-sans">
            
            {/* Native Top Bar Status */}
            <div className="hidden md:flex justify-between items-center px-6 py-2 bg-white text-slate-400 text-xs font-mono font-medium border-b border-slate-50 select-none">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-2.5 border border-slate-400 rounded-sm inline-block relative"><span className="absolute top-0.5 right-[-2px] w-0.5 h-1 bg-slate-400 rounded-sm"></span></span>
                <span>5G</span>
              </div>
            </div>

            {/* SCREEN VIEW SWITCHER ROUTER */}
            <div className="flex-1 flex flex-col relative overflow-y-auto">

              {/* 1. SCENARIO HUB & PASSPORT VIEW */}
              {currentView === 'HUB' && (
                <div id="view-hub" className="flex-1 flex flex-col pb-24">
                  {/* Top Bar */}
                  <div className="flex justify-between items-center px-6 py-4 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-100 shadow-sm bg-slate-200">
                        <img 
                          alt="User Avatar" 
                          className="w-full h-full object-cover" 
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80"
                        />
                      </div>
                      <h2 className="font-display font-bold text-slate-800">PolyGlot Passport</h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 px-3 py-1.5 bg-[#ECFDF5] text-[#10B981] rounded-full border border-[#10B981]/20 text-xs font-semibold">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span>{streak} Days</span>
                      </div>
                      <button 
                        onClick={() => setCurrentView('SETTINGS')}
                        className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Passport Card */}
                  <div className="p-6">
                    <div className="bg-gradient-to-br from-[#0066FF]/95 to-[#00F0FF]/90 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
                      {/* Decorative Passport Stamp background overlay */}
                      <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                        <Globe className="w-40 h-40" />
                      </div>

                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <p className="text-[10px] font-mono tracking-widest text-blue-100 uppercase mb-1">Current Active Visa</p>
                          <div className="flex items-center gap-2">
                            <span className="text-3xl">🇪🇸</span>
                            <span className="font-display font-bold text-lg">Spanish - Madrid</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-mono tracking-widest text-blue-100 uppercase mb-1">Level</span>
                          <div className="w-10 h-10 rounded-full bg-white text-[#0066FF] font-display font-bold flex items-center justify-center text-lg shadow-md">
                            {passportLevel}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-6 relative z-10">
                        <div className="flex justify-between text-xs text-blue-100 mb-1.5 font-sans font-medium">
                          <span>Progress to Level 15</span>
                          <span>65%</span>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: '65%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scenarios Feed list */}
                  <div className="px-6 flex-1">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-display font-bold text-slate-800 text-base">Select Scenario</h3>
                      <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">3 Available</span>
                    </div>

                    <div className="flex flex-col gap-4">
                      {SCENARIOS.map((scenario) => (
                        <article 
                          key={scenario.id}
                          onClick={() => {
                            setSelectedScenario(scenario);
                            setCurrentView('BRIEFING');
                          }}
                          className={`scenario-card-gradient-${scenario.id === 'tapas' ? '1' : scenario.id === 'bicycle' ? '2' : '3'} rounded-2xl p-5 border border-slate-100 hover:border-blue-200 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] group relative overflow-hidden`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                              scenario.level === 'Beginner' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                : scenario.level === 'Intermediate'
                                ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                                : 'bg-rose-50 text-rose-600 border-rose-200'
                            }`}>
                              {scenario.level}
                            </span>
                            <span className="text-xs text-slate-400 font-mono flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-100">
                              ⏱️ {scenario.duration}
                            </span>
                          </div>

                          <h4 className="font-display font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors mb-1">
                            {scenario.title}
                          </h4>
                          <p className="text-xs text-slate-500 font-sans line-clamp-1">
                            Goal: {scenario.goal}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>

                  {/* Hub Bottom Tab Bar simulated */}
                  <div className="absolute bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 h-20 px-8 flex justify-around items-center select-none z-20">
                    <button className="flex flex-col items-center gap-1 text-blue-600">
                      <BookOpen className="w-5 h-5" />
                      <span className="text-[10px] font-semibold tracking-wider uppercase font-mono">Hub</span>
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedScenario(SCENARIOS[0]);
                        setCurrentView('BRIEFING');
                      }}
                      className="bg-gradient-to-r from-[#0066FF] to-[#00F0FF] p-3.5 rounded-full text-white shadow-lg transform -translate-y-4 hover:scale-105 active:scale-95 transition-all"
                    >
                      <Mic className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => setCurrentView('SETTINGS')}
                      className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="text-[10px] font-medium tracking-wider uppercase font-mono">Setup</span>
                    </button>
                  </div>

                </div>
              )}

              {/* 6. PRE-SCENARIO BRIEFING SHEET */}
              {currentView === 'BRIEFING' && (
                <div id="view-briefing" className="flex-1 flex flex-col p-6 pb-24">
                  <button 
                    onClick={() => setCurrentView('HUB')}
                    className="self-start flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm font-semibold mb-6 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Passports</span>
                  </button>

                  <div className="flex flex-col items-center text-center max-w-sm mx-auto flex-1">
                    <div className="relative w-28 h-28 mb-5 rounded-full overflow-hidden shadow-lg border-2 border-slate-100">
                      <img 
                        alt={selectedScenario.hostName} 
                        className="w-full h-full object-cover" 
                        src={selectedScenario.hostImage}
                      />
                    </div>

                    <span className={`inline-block px-3 py-1 text-xs font-mono font-semibold rounded-full uppercase tracking-wider mb-2 ${
                      selectedScenario.level === 'Beginner' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : selectedScenario.level === 'Intermediate'
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {selectedScenario.level}
                    </span>

                    <h2 className="font-display font-bold text-slate-800 text-xl tracking-tight mb-1">
                      {selectedScenario.title}
                    </h2>
                    <p className="text-sm text-slate-400 mb-6 font-sans">
                      {selectedScenario.hostRole}
                    </p>

                    {/* Objectives Checklist Card */}
                    <div className="w-full bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left mb-6">
                      <h3 className="font-display font-bold text-slate-700 text-xs tracking-wider uppercase mb-3">Your Objectives</h3>
                      <ul className="space-y-3">
                        {selectedScenario.objectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium font-sans">
                            <span className="w-4 h-4 rounded-full border border-slate-300 mt-0.5 flex items-center justify-center text-blue-500 flex-shrink-0"></span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Key Vocabulary Card */}
                    <div className="w-full text-left mb-6">
                      <h3 className="font-display font-bold text-slate-700 text-xs tracking-wider uppercase mb-3">Key Vocabulary</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedScenario.keyVocab.slice(0, 3).map((v, i) => (
                          <div key={i} className="bg-white border border-slate-100 rounded-xl px-3 py-2 flex flex-col shadow-sm">
                            <span className="text-xs font-bold text-slate-800">{v.word}</span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">{v.ipa}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Start Button Fixed at Bottom */}
                  <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-white via-white/95 to-transparent pt-12 z-20">
                    <button 
                      onClick={() => startScenario(selectedScenario)}
                      className="w-full bg-gradient-to-r from-[#0066FF] to-[#00F0FF] text-white font-display font-bold text-sm py-4 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Start Live Conversation</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. REAL-TIME ROLEPLAY HUD & TRANSCRIPT DRAWER */}
              {currentView === 'HUD' && (
                <div id="view-hud" className="flex-1 flex flex-col relative bg-slate-50">
                  {/* Real-time floating grammar toast banner inside HUD view */}
                  <AnimatePresence>
                    {grammarToasts.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="absolute top-4 left-4 right-4 z-40 bg-white/95 backdrop-blur-md border border-[#10B981]/30 rounded-2xl p-3 shadow-lg flex items-start gap-3"
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] mt-1.5 animate-ping flex-shrink-0"></div>
                        <div className="flex-1 text-xs">
                          <p className="text-slate-400 font-mono font-medium line-through">&quot;{grammarToasts[0].original}&quot;</p>
                          <p className="text-[#10B981] font-display font-bold mt-0.5">&quot;{grammarToasts[0].correction}&quot;</p>
                          <p className="text-[10px] text-slate-500 font-medium mt-1 font-sans">{grammarToasts[0].explanation}</p>
                        </div>
                        <button 
                          onClick={() => setGrammarToasts([])}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Header */}
                  <div className="flex justify-between items-center px-4 py-3 bg-white/80 backdrop-blur-md border-b border-slate-100 z-10">
                    <button 
                      onClick={() => {
                        if (window.speechSynthesis) window.speechSynthesis.cancel();
                        setCurrentView('BRIEFING');
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                      <h3 className="font-display font-bold text-slate-800 text-sm">{selectedScenario.title}</h3>
                      <p className="text-[10px] text-slate-400 font-semibold font-mono tracking-wider uppercase mt-0.5">Host: {selectedScenario.hostName}</p>
                    </div>
                    <button 
                      onClick={() => setCurrentView('SETTINGS')}
                      className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Upper Pane: Avatar with animated visualizer rings */}
                  <div className="flex-1 flex flex-col justify-center items-center p-6 relative">
                    <div className="relative w-44 h-44 flex items-center justify-center">
                      
                      {/* Interactive Visualizer aura when AI or user is speaking */}
                      <AnimatePresence>
                        {(isAISpeaking || isListening || isLoading) && (
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ 
                              scale: [1, 1.15, 1],
                              opacity: [0.6, 0.2, 0.6]
                            }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className={`absolute inset-0 rounded-full ${
                              isListening 
                                ? 'bg-indigo-400/20' 
                                : isLoading 
                                ? 'bg-amber-400/15'
                                : 'bg-[#00f0ff]/25'
                            } blur-md z-0`}
                          />
                        )}
                      </AnimatePresence>

                      <div className="absolute inset-0 rounded-full border border-blue-200/40 scale-[1.2]"></div>

                      {/* Mateo Avatar */}
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl z-10 bg-slate-100">
                        <img 
                          alt={selectedScenario.hostName} 
                          className="w-full h-full object-cover" 
                          src={selectedScenario.hostImage}
                        />
                      </div>
                    </div>

                    <div className="mt-6 text-center relative z-10">
                      <h4 className="font-display font-bold text-slate-800 text-base">{selectedScenario.hostName}</h4>
                      <p className="text-xs text-slate-400 font-semibold font-mono mt-0.5">
                        {isAISpeaking ? '🗣️ Speaking...' : isListening ? '🎙️ Listening to you...' : isLoading ? '🤖 Analyzing pronunciation...' : '👋 Tap mic to speak'}
                      </p>
                    </div>

                    {/* Hint Button */}
                    <div className="mt-5 relative z-10">
                      <button 
                        onClick={requestHint}
                        className="bg-white hover:bg-slate-50 text-blue-600 font-display font-bold text-xs px-5 py-2.5 rounded-full border border-slate-100 shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Request Hint</span>
                      </button>
                    </div>
                  </div>

                  {/* Live scrolling Transcript Drawer (Frosted Pane) */}
                  <div className="h-64 bg-white/95 backdrop-blur-md border-t border-slate-100 p-4 overflow-y-auto flex flex-col gap-4 shadow-inner">
                    {messages.map((m, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col max-w-[85%] ${m.sender === 'YOU' ? 'self-end items-end' : 'self-start items-start'}`}
                      >
                        <span className="text-[9px] font-mono font-bold uppercase text-slate-400 tracking-wider mb-0.5 px-1">
                          {m.sender === 'YOU' ? 'YOU' : selectedScenario.hostName}
                        </span>
                        
                        <div className={`p-3.5 rounded-2xl shadow-sm text-sm ${
                          m.sender === 'YOU' 
                            ? 'bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white rounded-tr-sm' 
                            : 'bg-slate-50 text-slate-800 rounded-tl-sm border border-slate-100'
                        }`}>
                          <p className="font-sans font-medium line-height-relaxed">{m.text}</p>
                          
                          {/* Optional details for AI host */}
                          {m.sender === 'MATEO' && m.ipa && (
                            <p className="text-[10px] text-slate-400 font-mono mt-1 font-medium tracking-wide">
                              {m.ipa}
                            </p>
                          )}
                        </div>

                        {/* Direct translation utility on demand */}
                        {m.sender === 'MATEO' && m.translation && (
                          <span className="text-[10px] text-slate-400 italic mt-1 px-1 font-sans">
                            {m.translation}
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Streaming / Loading indicators */}
                    {isLoading && (
                      <div className="self-start flex gap-1.5 items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 shadow-sm h-11">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    )}
                  </div>

                  {/* Manual Typing Toggle Indicator */}
                  {isTypingInputMode && (
                    <div className="bg-white border-t border-slate-100 p-3 flex gap-2">
                      <input 
                        type="text" 
                        value={typedInputText}
                        onChange={(e) => setTypedInputText(e.target.value)}
                        placeholder="Type response in Spanish..." 
                        className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUserSpeech(typedInputText);
                            setTypedInputText('');
                            setIsTypingInputMode(false);
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          handleUserSpeech(typedInputText);
                          setTypedInputText('');
                          setIsTypingInputMode(false);
                        }}
                        className="bg-blue-600 text-white rounded-full px-4 text-xs font-semibold"
                      >
                        Send
                      </button>
                    </div>
                  )}

                  {/* Controls Bar */}
                  <div className="bg-white border-t border-slate-100 py-4 px-6 flex justify-between items-center z-10 select-none">
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-3 rounded-full border border-slate-100 shadow-sm transition-colors ${isMuted ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500 hover:text-slate-700'}`}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>

                    <button 
                      id="mic-toggle-btn"
                      onClick={toggleListening}
                      className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                        isListening 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-gradient-to-r from-[#0066FF] to-[#00F0FF] text-white'
                      }`}
                    >
                      <Mic className="w-6 h-6" />
                    </button>

                    <button 
                      onClick={() => {
                        if (window.speechSynthesis) window.speechSynthesis.cancel();
                        setCurrentView('SCORECARD');
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-600 font-display font-bold text-xs px-5 py-3 rounded-full flex items-center gap-1.5 transition-all active:scale-95 border border-red-100 shadow-sm"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>End</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 3. IN-CALL HINT & TRANSLATION OVERLAY */}
              {currentView === 'HINT' && (
                <div id="view-hint" className="flex-1 flex flex-col relative bg-slate-900/40">
                  <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-xl z-10"></div>
                  
                  {/* Modal Container */}
                  <div className="absolute bottom-0 left-0 w-full bg-white rounded-t-[28px] p-6 shadow-2xl z-20 flex flex-col gap-6">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-2"></div>

                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-widest">Recommended Hint</span>
                      <h2 className="font-display font-bold text-slate-800 text-xl tracking-tight leading-tight">
                        {currentHint?.spanish}
                      </h2>
                      <div className="flex flex-col gap-1 text-xs">
                        <p className="text-slate-500 font-sans font-medium">{currentHint?.english}</p>
                        <p className="text-slate-400 font-mono mt-0.5">{currentHint?.ipa}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <button 
                        onClick={() => {
                          if (currentHint) speakAIResponse(currentHint.spanish);
                        }}
                        className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>

                      <button 
                        onClick={() => {
                          if (currentHint) {
                            handleUserSpeech(currentHint.spanish);
                          }
                          setCurrentView('HUD');
                        }}
                        className="flex-1 bg-gradient-to-r from-[#0066FF] to-[#00F0FF] text-white font-display font-bold text-sm py-3.5 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Speak This Hint</span>
                      </button>
                    </div>

                    <button 
                      onClick={() => setCurrentView('HUD')}
                      className="text-center text-xs font-semibold text-slate-400 hover:text-slate-600 py-1"
                    >
                      Close & Resume
                    </button>
                  </div>
                </div>
              )}

              {/* 4. POST-SCENARIO FLUENCY SCORECARD */}
              {currentView === 'SCORECARD' && (
                <div id="view-scorecard" className="flex-1 flex flex-col pb-24">
                  {/* Top Bar */}
                  <div className="flex justify-between items-center px-6 py-4 border-b border-slate-50 bg-white">
                    <h2 className="font-display font-bold text-slate-800">Session Summary</h2>
                    <button 
                      onClick={() => {
                        setStreak(prev => prev + 1);
                        setCurrentView('HUB');
                      }}
                      className="font-display font-bold text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      Done
                    </button>
                  </div>

                  {/* Main score dial card */}
                  <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="relative w-44 h-44 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                          <circle className="text-slate-100" cx="80" cy="80" fill="none" r="70" stroke="currentColor" strokeWidth="8"></circle>
                          <circle className="text-blue-500" cx="80" cy="80" fill="none" r="70" stroke="currentColor" strokeWidth="12" strokeDasharray="440" strokeDashoffset="52.8" strokeLinecap="round"></circle>
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="font-display font-bold text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] to-[#00F0FF]">88%</span>
                          <span className="text-[10px] text-slate-400 font-semibold font-mono tracking-wider uppercase mt-1">Fluency Score</span>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-2">
                        <span className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">Grammar</span>
                        <div className="flex justify-between items-end">
                          <span className="font-display font-bold text-2xl text-slate-800">92%</span>
                          <span className="text-[10px] text-emerald-500 font-semibold font-mono bg-emerald-50 px-1.5 py-0.5 rounded-md">Excellent</span>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-2">
                        <span className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">Vocabulary</span>
                        <div className="flex justify-between items-end">
                          <span className="font-display font-bold text-2xl text-slate-800">85%</span>
                          <span className="text-[10px] text-blue-500 font-semibold font-mono bg-blue-50 px-1.5 py-0.5 rounded-md">Good</span>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-left flex flex-col gap-3">
                      <h3 className="font-display font-bold text-slate-700 text-xs tracking-wider uppercase">Feedback from {selectedScenario.hostName}</h3>
                      <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-200">
                          <img 
                            alt={selectedScenario.hostName} 
                            className="w-full h-full object-cover" 
                            src={selectedScenario.hostImage}
                          />
                        </div>
                        <p className="text-xs text-slate-600 font-medium italic leading-relaxed">
                          &quot;Your confidence is growing! Focus on your past tense conjugations next time.&quot;
                        </p>
                      </div>
                    </div>

                    {/* Pronunciation review items */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-left">
                      <h3 className="font-display font-bold text-slate-700 text-xs tracking-wider uppercase mb-3">Review Pronunciation</h3>
                      <div className="flex flex-col gap-3">
                        {selectedScenario.keyVocab.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-800">{item.word}</span>
                              <span className="text-[10px] text-slate-400 font-mono mt-0.5">{item.ipa}</span>
                            </div>
                            <button 
                              onClick={() => speakAIResponse(item.word)}
                              className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-white via-white/95 to-transparent pt-12 z-20">
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => {
                          setVocabIndex(0);
                          setMasteredCount(3);
                          setCurrentView('VOCAB_PRACTICE');
                        }}
                        className="w-full bg-gradient-to-r from-[#0066FF] to-[#00F0FF] text-white font-display font-bold text-sm py-4 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Practice These Words</span>
                      </button>

                      <button 
                        onClick={() => {
                          setStreak(prev => prev + 1);
                          setCurrentView('HUB');
                        }}
                        className="w-full bg-white text-slate-500 border border-slate-200 font-display font-bold text-sm py-3 rounded-full hover:bg-slate-50 active:scale-95 transition-all"
                      >
                        Back to Home
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. VOCABULARY PRACTICE FLASHCARD */}
              {currentView === 'VOCAB_PRACTICE' && (
                <div id="view-vocab-practice" className="flex-1 flex flex-col pb-24">
                  {/* Top Bar */}
                  <div className="flex justify-between items-center px-6 py-4 border-b border-slate-50 bg-white">
                    <button 
                      onClick={() => setCurrentView('SCORECARD')}
                      className="p-1.5 text-slate-400 hover:text-slate-600"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                      <h3 className="font-display font-bold text-slate-800 text-sm">Study Flashcards</h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{vocabIndex + 1} of {selectedScenario.keyVocab.length}</p>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {masteredCount} Mastered
                    </div>
                  </div>

                  {/* Flashcard container */}
                  <div className="p-6 flex-grow flex flex-col justify-center items-center">
                    <div className="w-full max-w-sm aspect-[4/5] bg-white rounded-3xl border border-slate-100 shadow-xl p-8 flex flex-col items-center justify-center gap-6 text-center transition-all hover:shadow-2xl">
                      <h2 className="font-display font-bold text-3xl text-slate-800">
                        {selectedScenario.keyVocab[vocabIndex]?.word}
                      </h2>

                      {/* IPA Phonetics and Audio */}
                      <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                        <span className="font-mono text-xs text-slate-500">{selectedScenario.keyVocab[vocabIndex]?.ipa}</span>
                        <button 
                          onClick={() => speakAIResponse(selectedScenario.keyVocab[vocabIndex]?.word)}
                          className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="w-full h-[1px] bg-slate-100 my-4"></div>

                      <div className="text-center">
                        <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider font-mono">Meaning</p>
                        <p className="text-base font-medium text-slate-700 mt-1">
                          {selectedScenario.keyVocab[vocabIndex]?.meaning}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-white via-white/95 to-transparent pt-12 z-20">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          speakAIResponse(selectedScenario.keyVocab[vocabIndex]?.word);
                          if (vocabIndex < selectedScenario.keyVocab.length - 1) {
                            setVocabIndex(prev => prev + 1);
                          } else {
                            setMasteredCount(prev => prev + 1);
                            setCurrentView('SCORECARD');
                          }
                        }}
                        className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 font-display font-bold text-sm py-4 rounded-full flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Review Again</span>
                      </button>

                      <button 
                        onClick={() => {
                          setMasteredCount(prev => prev + 1);
                          if (vocabIndex < selectedScenario.keyVocab.length - 1) {
                            setVocabIndex(prev => prev + 1);
                          } else {
                            setCurrentView('SCORECARD');
                          }
                        }}
                        className="flex-1 bg-[#10B981] hover:bg-[#10B981]/90 text-white font-display font-bold text-sm py-4 rounded-full flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md"
                      >
                        <Check className="w-4 h-4" />
                        <span>Got It</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. SCENARIO & VOICE SETTINGS SHEET */}
              {currentView === 'SETTINGS' && (
                <div id="view-settings" className="flex-1 flex flex-col bg-slate-900/40 relative">
                  <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-xl z-10"></div>

                  <div className="absolute bottom-0 left-0 w-full bg-white rounded-t-[28px] p-6 shadow-2xl z-20 flex flex-col gap-6">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-2"></div>

                    <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                      <h2 className="font-display font-bold text-slate-800 text-lg">Voice & Dialect</h2>
                      <button 
                        onClick={() => setCurrentView('HUB')}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Dialect choice list */}
                    <div className="flex flex-col gap-4">
                      <h3 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">Select Accent</h3>
                      
                      <button 
                        onClick={() => setDialect('Spanish (Spain - Madrid)')}
                        className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-slate-50 transition-all text-left"
                      >
                        <span className={`font-sans text-sm ${dialect === 'Spanish (Spain - Madrid)' ? 'text-blue-600 font-bold' : 'text-slate-600 font-medium'}`}>
                          🇪🇸 Spanish (Spain - Madrid)
                        </span>
                        {dialect === 'Spanish (Spain - Madrid)' && <Check className="w-5 h-5 text-blue-600" />}
                      </button>

                      <button 
                        onClick={() => setDialect('Spanish (Latin America)')}
                        className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-slate-50 transition-all text-left"
                      >
                        <span className={`font-sans text-sm ${dialect === 'Spanish (Latin America)' ? 'text-blue-600 font-bold' : 'text-slate-600 font-medium'}`}>
                          🇲🇽 Spanish (Latin America)
                        </span>
                        {dialect === 'Spanish (Latin America)' && <Check className="w-5 h-5 text-blue-600" />}
                      </button>
                    </div>

                    {/* AI Speaking Speed rate */}
                    <div className="flex flex-col gap-3">
                      <h3 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">Speaking Speed</h3>
                      <div className="flex justify-between gap-3 bg-slate-50 p-1.5 rounded-full border border-slate-100">
                        {(['0.8x', '1.0x', '1.2x'] as const).map((rate) => (
                          <button
                            key={rate}
                            onClick={() => {
                              setSpeechRateLabel(rate);
                              setVoiceSpeed(rate === '0.8x' ? 0.8 : rate === '1.2x' ? 1.2 : 1.0);
                            }}
                            className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all ${
                              speechRateLabel === rate 
                                ? 'bg-white text-blue-600 shadow-sm font-bold' 
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {rate}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={handleApplySettings}
                      className="w-full bg-gradient-to-r from-[#0066FF] to-[#00F0FF] text-white font-display font-bold text-sm py-4 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all mt-4"
                    >
                      Apply Settings
                    </button>
                  </div>
                </div>
              )}

              {/* 8. FIXED RECONNECTION STATE OVERLAY (GEMINI LIVE FALLBACK) */}
              {currentView === 'RECONNECTING' && (
                <div id="view-reconnecting" className="flex-grow flex flex-col justify-center items-center p-8 bg-slate-50 text-center gap-8 relative select-none">
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-100 shadow-lg bg-slate-200">
                      <img 
                        alt={selectedScenario.hostName} 
                        className="w-full h-full object-cover" 
                        src={selectedScenario.hostImage}
                      />
                    </div>
                    <div className="flex items-center gap-3 bg-red-50 text-red-500 px-4 py-2 rounded-full border border-red-100 text-xs font-semibold font-mono">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      <span>Reconnecting to Gemini Engine...</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setCurrentView('HUD');
                    }}
                    className="bg-white hover:bg-slate-50 text-slate-800 font-display font-bold text-sm px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 border border-slate-200 flex items-center gap-2"
                  >
                    <span>Tap to Resume Call</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* DESKTOP VIEWPORT SIMULATOR PANELS */}
        {/* ========================================================= */}
        {deviceMode === 'DESKTOP' && (
          <div className="w-full max-w-7xl mx-auto flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 h-[calc(100vh-140px)] min-h-[700px]">
            
            {/* 9. LANDING PAGE & WEB STUDIO PREVIEW (DESKTOP MARKETING) */}
            {currentView === 'WEB_LANDING' && (
              <div id="view-web-landing" className="flex-1 flex flex-col overflow-y-auto">
                {/* Hero Banner */}
                <section className="py-16 px-8 max-w-4xl mx-auto text-center flex flex-col items-center justify-center">
                  <h1 className="font-display text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none mb-6">
                    Speak Any Language Fluently Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] to-[#00F0FF]">Live AI Voice Roleplay</span>
                  </h1>
                  <p className="text-slate-500 font-sans text-base max-w-2xl leading-relaxed mb-10">
                    Immerse yourself in real-time conversations with intelligent conversational avatars. Overcome the fear of speaking, master pronunciation, and expand your active vocabulary with instant grammar corrections.
                  </p>

                  <button 
                    onClick={() => {
                      startScenario(SCENARIOS[0]);
                      setCurrentView('WEB_STUDIO');
                    }}
                    className="bg-gradient-to-r from-[#0066FF] to-[#00F0FF] text-white px-10 py-5 rounded-full font-display font-bold text-lg flex items-center gap-3 hover:opacity-95 shadow-xl transition-all hover:scale-105 active:scale-98"
                  >
                    <Mic className="w-5 h-5" />
                    <span>Try Voice Demo in Browser</span>
                    {/* Visual Waveform Accent */}
                    <div className="flex gap-1 items-end h-4 ml-3 select-none">
                      <span className="w-0.5 bg-white/70 rounded-full h-2 wave-bar" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-0.5 bg-white/70 rounded-full h-4 wave-bar" style={{ animationDelay: '0.3s' }}></span>
                      <span className="w-0.5 bg-white/70 rounded-full h-3 wave-bar" style={{ animationDelay: '0.5s' }}></span>
                    </div>
                  </button>
                </section>

                {/* Feature Grid */}
                <section className="bg-slate-50 border-t border-b border-slate-100 py-16 px-8">
                  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <article className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Mic className="w-6 h-6" />
                      </div>
                      <h3 className="font-display font-bold text-slate-800 text-lg">Native Speech-to-Speech</h3>
                      <p className="text-sm text-slate-500 leading-relaxed font-sans">
                        Zero-latency conversational flow mimicking real-world native speakers without text-based crutches.
                      </p>
                    </article>

                    <article className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h3 className="font-display font-bold text-slate-800 text-lg">Grammar Toasts</h3>
                      <p className="text-sm text-slate-500 leading-relaxed font-sans">
                        Subtle, non-blocking visual cues correct your grammar mid-sentence without breaking immersion.
                      </p>
                    </article>

                    <article className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <h3 className="font-display font-bold text-slate-800 text-lg">Post-Conversation Analytics</h3>
                      <p className="text-sm text-slate-500 leading-relaxed font-sans">
                        Detailed breakdown of vocabulary usage, grammar accuracy metrics, and personalized actionable feedback.
                      </p>
                    </article>
                  </div>
                </section>

                {/* Web Studio Interface Preview Mock */}
                <section className="py-16 px-8 max-w-6xl mx-auto">
                  <div className="bg-[#0F172A] text-white rounded-3xl p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl relative overflow-hidden">
                    <div className="max-w-lg relative z-10">
                      <span className="text-blue-400 font-mono text-xs font-semibold uppercase tracking-widest">Active Studio Workspace</span>
                      <h2 className="font-display text-3xl font-black mt-2 mb-4 leading-tight">Unlock Speaking Fluency Today</h2>
                      <p className="text-slate-300 font-sans text-sm leading-relaxed mb-6">
                        Practice real conversations safely. Our interactive studio workspace allows you to converse with simulated characters across dozens of scenarios.
                      </p>
                      <button 
                        onClick={() => {
                          startScenario(SCENARIOS[0]);
                          setCurrentView('WEB_STUDIO');
                        }}
                        className="bg-blue-600 text-white font-display font-bold text-sm px-8 py-3.5 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                      >
                        Launch Standalone Studio Dashboard
                      </button>
                    </div>
                    <div className="relative z-10 w-full md:w-auto bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 p-6 flex flex-col gap-4">
                      <ul className="space-y-3 font-sans text-xs text-slate-200">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" />
                          <span>Unlimited voice roleplay scenarios</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" />
                          <span>Real-time grammar correcting engine</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" />
                          <span>Complete vocabulary pronunciation lists</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* 10. STANDALONE WEB STUDIO DASHBOARD (DESKTOP WORKSPACE) */}
            {currentView === 'WEB_STUDIO' && (
              <div id="view-web-studio" className="flex-1 flex overflow-hidden">
                
                {/* Left Pane: Voice focus canvas */}
                <div className="flex-1 flex flex-col bg-slate-50 border-r border-slate-100 relative">
                  
                  {/* Floating Top Nav bar */}
                  <div className="h-16 px-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setCurrentView('WEB_LANDING')}
                        className="text-slate-400 hover:text-slate-600 font-semibold text-xs flex items-center gap-1 font-mono uppercase"
                      >
                        <ArrowLeft className="w-4 h-4" /> Exit Workspace
                      </button>
                      <span className="text-slate-300">|</span>
                      <span className="text-sm font-semibold text-slate-800">{selectedScenario.title}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                        {selectedScenario.level}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span>Accent: {dialect}</span>
                      <span>•</span>
                      <span>Speed: {speechRateLabel}</span>
                    </div>
                  </div>

                  {/* Absolute Top grammar corrections toasts banner in Desktop Studio */}
                  <AnimatePresence>
                    {grammarToasts.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-20 left-6 right-6 z-40 bg-white/95 backdrop-blur-md border border-[#10B981]/30 rounded-2xl p-4 shadow-xl flex items-center gap-4"
                      >
                        <div className="w-3 h-3 rounded-full bg-[#10B981] animate-ping flex-shrink-0"></div>
                        <div className="flex-1 text-sm font-sans font-medium">
                          <span className="text-slate-400 line-through mr-3">&quot;{grammarToasts[0].original}&quot;</span>
                          <span className="text-[#10B981] font-bold">&quot;{grammarToasts[0].correction}&quot;</span>
                          <span className="text-xs text-slate-500 font-medium ml-4 font-mono">({grammarToasts[0].explanation})</span>
                        </div>
                        <button 
                          onClick={() => setGrammarToasts([])}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Central voice interface workspace focal point */}
                  <div className="flex-1 flex flex-col justify-center items-center p-8">
                    <div className="relative w-56 h-56 flex items-center justify-center">
                      
                      {/* Pulse visualizer halo ring */}
                      <AnimatePresence>
                        {(isAISpeaking || isListening || isLoading) && (
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ 
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 0.1, 0.5]
                            }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className={`absolute inset-0 rounded-full ${
                              isListening 
                                ? 'bg-indigo-400/20' 
                                : isLoading 
                                ? 'bg-amber-400/15'
                                : 'bg-[#00f0ff]/25'
                            } blur-md z-0`}
                          />
                        )}
                      </AnimatePresence>

                      <div className="absolute inset-0 rounded-full border border-blue-200/40 scale-[1.25]"></div>

                      {/* Mateo Avatar */}
                      <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-xl z-10 bg-slate-100">
                        <img 
                          alt={selectedScenario.hostName} 
                          className="w-full h-full object-cover" 
                          src={selectedScenario.hostImage}
                        />
                      </div>
                    </div>

                    <div className="mt-8 text-center">
                      <h4 className="font-display font-black text-slate-900 text-xl tracking-tight">{selectedScenario.hostName}</h4>
                      <p className="text-sm text-slate-400 font-medium font-mono mt-1">
                        {isAISpeaking ? '🎙️ Host is speaking Spanish...' : isListening ? '🗣️ Speech recognition listening...' : isLoading ? '🤖 Analyzing voice and grammar...' : '👋 Click record microphone to talk'}
                      </p>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button 
                        onClick={requestHint}
                        className="bg-white hover:bg-slate-50 text-blue-600 font-display font-bold text-xs px-6 py-3 rounded-full border border-slate-100 shadow-sm flex items-center gap-1.5 transition-all"
                      >
                        <Lightbulb className="w-4 h-4" />
                        <span>Request Hint / Answer Phrase</span>
                      </button>
                    </div>
                  </div>

                  {/* Audio visualizer control bar fixed bottom */}
                  <div className="bg-white border-t border-slate-100 py-4 px-8 flex justify-between items-center z-10">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-3 rounded-full border border-slate-100 shadow-sm transition-colors ${isMuted ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500 hover:text-slate-700'}`}
                      >
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <div className="text-xs text-slate-400 font-mono font-medium">
                        Accent Mode: <span className="text-slate-700 font-bold">{dialect}</span>
                      </div>
                    </div>

                    {/* Main microphone controller trigger */}
                    <div className="flex items-center gap-4">
                      {isListening && (
                        <span className="text-xs text-[#0066FF] font-mono font-bold animate-pulse">RECORDING ACTIVE</span>
                      )}
                      <button 
                        onClick={toggleListening}
                        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                          isListening 
                            ? 'bg-red-500 text-white animate-pulse' 
                            : 'bg-gradient-to-r from-[#0066FF] to-[#00F0FF] text-white'
                        }`}
                      >
                        <Mic className="w-6 h-6" />
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        if (window.speechSynthesis) window.speechSynthesis.cancel();
                        setCurrentView('SCORECARD');
                        setDeviceMode('MOBILE');
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-600 font-display font-bold text-xs px-6 py-3 rounded-full flex items-center gap-1.5 transition-all border border-red-100"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>Complete Roleplay & View Analytics</span>
                    </button>
                  </div>

                </div>

                {/* Right Pane: Live Intelligence Hub containing tabs */}
                <div className="w-[450px] bg-white border-l border-slate-100 flex flex-col">
                  {/* Tab Headers */}
                  <div className="flex border-b border-slate-100 px-6 pt-4 bg-slate-50">
                    <button className="px-4 py-3 font-display font-bold text-sm text-blue-600 border-b-2 border-blue-600">
                      Live Transcript Feed
                    </button>
                    <button 
                      onClick={() => {
                        setVocabIndex(0);
                        setMasteredCount(3);
                        setCurrentView('VOCAB_PRACTICE');
                        setDeviceMode('MOBILE');
                      }}
                      className="px-4 py-3 font-display font-bold text-sm text-slate-400 hover:text-slate-600"
                    >
                      Vocabulary practice
                    </button>
                  </div>

                  {/* Transcript Scroll Feed area */}
                  <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 bg-slate-50/50">
                    {messages.map((m, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col max-w-[90%] ${m.sender === 'YOU' ? 'self-end items-end' : 'self-start items-start'}`}
                      >
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider mb-1 px-1">
                          {m.sender === 'YOU' ? 'You' : selectedScenario.hostName}
                        </span>

                        <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                          m.sender === 'YOU' 
                            ? 'bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white rounded-tr-sm' 
                            : 'bg-white text-slate-800 rounded-tl-sm border border-slate-100'
                        }`}>
                          <p className="font-sans font-medium">{m.text}</p>
                          
                          {m.sender === 'MATEO' && m.ipa && (
                            <p className="text-xs text-slate-400 font-mono mt-1.5 font-medium tracking-wide border-t border-slate-100 pt-1.5">
                              {m.ipa}
                            </p>
                          )}
                        </div>

                        {m.sender === 'MATEO' && m.translation && (
                          <span className="text-xs text-slate-400 font-sans italic mt-1.5 px-1">
                            {m.translation}
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Loader */}
                    {isLoading && (
                      <div className="self-start flex gap-1.5 items-center bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm h-12">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    )}
                  </div>

                  {/* Vocabulary detected chips footer */}
                  <div className="p-6 border-t border-slate-100 bg-white">
                    <h3 className="font-display font-bold text-slate-800 text-xs tracking-wider uppercase mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <span>Key Vocabulary Detected</span>
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {detectedVocabList.map((vocab, idx) => (
                        <div 
                          key={idx} 
                          className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 flex items-center gap-3 shadow-sm hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">{vocab.word}</span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">{vocab.ipa}</span>
                          </div>
                          <span className="text-xs text-slate-500 font-medium">• {vocab.translation}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
