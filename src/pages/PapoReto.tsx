import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { HeaderControls } from '@/components/HeaderControls';
import { useNavigate } from 'react-router-dom';
import { Brain, Send } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { GAME_IDS } from '@/constants/games';

type Category = 'animal' | 'fruit' | 'country' | null;
type GameStep = 'initial' | 'ready' | 'collecting' | 'filtering' | 'revealing';

interface Message {
  text: string;
  sender: 'ai' | 'user';
}

const ANIMALS = [
  'aguti', 'aie-aie', 'alce', 'anta', 'antílope', 'babuíno', 'baleia', 'bicho-preguiça', 'bisão',
  'boi', 'burro', 'búfalo', 'cabra', 'cachorro', 'camelo', 'canguru', 'capivara', 'capuchinho',
  'caracal', 'cavalo', 'chimpanzé', 'chinchila', 'coelho', 'cutia', 'delfim', 'doninha',
  'dromedário', 'elefante', 'esquilo', 'foca', 'gato', 'gazela', 'gerbil', 'girafa', 'gnu',
  'golfinho', 'gorila', 'guepardo', 'hamster', 'hiena', 'hipopótamo', 'jaguar', 'jaguarundi',
  'koala', 'leopardo', 'leão', 'leão-marinho', 'lobo', 'lobo-guará', 'lontra', 'lêmure',
  'macaco', 'macaco-aranha', 'macaco-prego', 'mandril', 'mangusto', 'morcego', 'morsa', 'mula',
  'musaranho', 'narval', 'okapi', 'onça', 'orca', 'ornitorrinco', 'ouriço', 'ovelha', 'paca',
  'panda', 'porco', 'porquinho-da-índia', 'preguiça', 'pônei', 'raposa', 'rato', 'rena',
  'rinoceronte', 'sagui', 'suricato', 'tamanduá', 'tarsier', 'tatu', 'texugo', 'tigre', 'topo',
  'urso', 'urso-negro', 'urso-pardo', 'urso-polar', 'vaca', 'veado', 'zebra'
];

const FRUITS = [
  'abacate', 'abacaxi', 'acerola', 'ameixa', 'amora', 'araçá', 'ata', 'atemoia', 'banana',
  'biribá', 'buriti', 'cabeluda', 'cagaita', 'caju', 'cajá', 'cambuci', 'caqui', 'carambola', 'cereja',
  'cupuaçu', 'damasco', 'durian', 'figo', 'framboesa', 'fruta-do-conde', 'goiaba', 'graviola',
  'groselha', 'grumixama', 'ingá', 'jabuticaba', 'jaca', 'jambo', 'jenipapo', 'kiwi', 'laranja',
  'lichia', 'limão', 'manga', 'mangaba', 'mangostão', 'maracujá', 'maçã', 'melancia', 'melão',
  'mirtilo', 'morango', 'murici', 'nectarina', 'noni', 'pequi', 'pera', 'physalis', 'pinha',
  'pitaia', 'pitanga', 'pitomba', 'pupunha', 'pêssego', 'rambutã', 'romã', 'sapota', 'sapoti',
  'seriguela', 'tamarillo', 'tamarindo', 'tangerina', 'taperebá', 'umbu', 'uva'
];

const COUNTRIES = [
  'afeganistão', 'albânia', 'alemanha', 'andorra', 'angola', 'antígua e barbuda', 'argentina',
  'argélia', 'armênia', 'arábia saudita', 'austrália', 'azerbaijão', 'bahamas', 'bahrein',
  'bangladesh', 'barbados', 'belize', 'benin', 'bielorrússia', 'bolívia', 'botsuana', 'brasil',
  'brunei', 'bulgária', 'burquina fasso', 'burúndi', 'butão', 'bélgica', 'bósnia e herzegovina',
  'cabo verde', 'camarões', 'camboja', 'canadá', 'catar', 'cazaquistão', 'chade', 'chile',
  'china', 'chipre', 'colômbia', 'comores', 'congo', 'coreia do norte', 'coreia do sul',
  'costa rica', 'costa do marfim', 'croácia', 'cuba', 'dinamarca', 'dominica', 'egito',
  'el salvador', 'emirados árabes unidos', 'equador', 'eritreia', 'eslováquia', 'eslovênia',
  'espanha', 'estados unidos', 'estônia', 'etiópia', 'fiji', 'filipinas', 'finlândia', 'frança',
  'gabão', 'gana', 'geórgia', 'granada', 'grécia', 'guatemala', 'guiana', 'guiné',
  'guiné equatorial', 'guiné-bissau', 'gâmbia', 'haiti', 'holanda', 'honduras', 'hungria',
  'ilhas maldivas', 'indonésia', 'inglaterra', 'iraque', 'irlanda', 'irã', 'islândia', 'israel',
  'itália', 'iémen', 'jamaica', 'japão', 'jordânia', 'kiribati', 'kosovo', 'kuwait', 'laos',
  'lesoto', 'letônia', 'libéria', 'liechtenstein', 'lituânia', 'luxemburgo', 'líbano', 'líbia',
  'macedônia do norte', 'madagascar', 'malaui', 'mali', 'malta', 'malásia', 'marrocos', 'maurício',
  'moldávia', 'mongólia', 'montenegro', 'moçambique', 'méxico', 'mônaco', 'namíbia', 'nepal',
  'nicarágua', 'nigéria', 'noruega', 'nova zelândia', 'níger', 'omã', 'panamá', 'papua-nova guiné',
  'paquistão', 'paraguai', 'país de gales', 'países baixos', 'peru', 'polônia', 'portugal',
  'quirguistão', 'quênia', 'reino unido', 'república centro-africana', 'república dominicana',
  'república tcheca', 'romênia', 'ruanda', 'rússia', 'salomão', 'samoa', 'san marino',
  'santa lúcia', 'senegal', 'serra leoa', 'somália', 'sri lanka', 'sudão', 'sudão do sul',
  'suriname', 'suécia', 'suíça', 'são cristóvão e névis', 'são tomé e príncipe',
  'são vicente e granadinas', 'sérvia', 'síria', 'tailândia', 'taiwan', 'tanzânia', 'tchéquia',
  'timor-leste', 'togo', 'tonga', 'trinidad e tobago', 'tunísia', 'turcomenistão', 'turquia',
  'tuvalu', 'ucrânia', 'uganda', 'uruguai', 'uzbequistão', 'vanuatu', 'vaticano', 'venezuela',
  'vietnã', 'zimbábue', 'zâmbia', 'áfrica do sul', 'áustria', 'índia'
];

const TTS_ENABLED = false; // Temporarily disabled
const LETTER_GRID = Array.from({ length: 20 }, (_, index) =>
  String.fromCharCode(65 + index)
);

const PapoReto = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { incrementUsage } = useUsageLimit();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState<GameStep>('initial');
  const [category, setCategory] = useState<Category>(null);
  const [letters, setLetters] = useState<string[]>([]);
  const [pendingGridLetter, setPendingGridLetter] = useState<string | null>(null);
  const [possibleWords, setPossibleWords] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initialMessageSent = useRef(false);
  const followUpQuestionKeys = [
    'mentalConversation.messages.askHobby',
    'mentalConversation.messages.askSeason'
  ] as const;

  useEffect(() => {
    if (initialMessageSent.current) return;
    initialMessageSent.current = true;

    addAiMessage(t('mentalConversation.messages.greeting'));
    const timeout = setTimeout(() => {
      addAiMessage(t('mentalConversation.messages.readyCheck'));
      setStep('ready');
    }, 2000);

    return () => clearTimeout(timeout);
  }, [t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addAiMessage = (text: string) => {
    setMessages([{ text, sender: 'ai' }]);

    if (!TTS_ENABLED || !text.trim()) {
      return;
    }

    // Generate and play audio for AI message (non-blocking)
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('text-to-speech', {
          body: { text, voice: 'alloy' }
        });

        if (error) {
          console.error('Text-to-speech error:', error);
          return; // Continue without audio
        }

        if (data?.error) {
          console.error('Text-to-speech API error:', data.error);
          return; // Continue without audio
        }

        if (data?.audioContent) {
          const audioBlob = base64ToBlob(data.audioContent, 'audio/mpeg');
          const audioUrl = URL.createObjectURL(audioBlob);
          
          if (audioRef.current) {
            audioRef.current.pause();
          }
          
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          
          await audio.play();
        }
      } catch (error) {
        console.error('Error generating speech:', error);
        // Continue without audio if there's an error
      }
    })();
  };

  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const addUserMessage = (text: string) => {
    setMessages([{ text, sender: 'user' }]);
  };

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getLastWordFirstLetter = (text: string): string => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) return '';
    const lastWord = words[words.length - 1];
    return lastWord[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const getWordList = (cat: Category): string[] => {
    if (cat === 'animal') return ANIMALS;
    if (cat === 'fruit') return FRUITS;
    if (cat === 'country') return COUNTRIES;
    return [];
  };

  const filterWordsByLetters = (words: string[], letters: string[]): string[] => {
    if (!letters.length) return words;
    const normalizedLetters = letters.map(letter => letter.toLowerCase());

    return words.filter(word => {
      const normalizedWord = word
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

      let searchIndex = 0;

      return normalizedLetters.every(letter => {
        const foundIndex = normalizedWord.indexOf(letter, searchIndex);
        if (foundIndex === -1) return false;
        searchIndex = foundIndex + 1;
        return true;
      });
    });
  };

  const getCategoryName = (cat: Category): string => {
    if (!cat) return '';
    return t(`mentalConversation.categories.${cat}`);
  };

  const handleLetterGridPress = (letter: string) => {
    if (step !== 'collecting' || letters.length >= 3) return;
    setPendingGridLetter(letter.toLowerCase());
  };

  const handleSubmit = () => {
    if (!input.trim()) return;

    const userInput = input;
    addUserMessage(userInput);
    setInput('');

    processInput(userInput);
  };

  const processInput = (userInput: string) => {
    const wordCount = countWords(userInput);

    if (step === 'ready' || step === 'initial') {
      // Determinar categoria baseado no número de palavras
      let detectedCategory: Category = null;
      if (wordCount === 1) detectedCategory = 'animal';
      else if (wordCount === 2) detectedCategory = 'fruit';
      else if (wordCount === 3) detectedCategory = 'country';

      setCategory(detectedCategory);
      setStep('collecting');
      addAiMessage(t('mentalConversation.messages.startCollecting'));
      return;
    }

    if (step === 'collecting') {
      const fallbackLetter = getLastWordFirstLetter(userInput);
      const normalizedLetter = (pendingGridLetter ?? fallbackLetter).toLowerCase();

      if (!normalizedLetter) {
        return;
      }

      setPendingGridLetter(null);
      const newLetters = [...letters, normalizedLetter];
      setLetters(newLetters);

      if (newLetters.length < 3) {
        // Perguntas para coletar letras
        const questionKey = followUpQuestionKeys[newLetters.length - 1];
        addAiMessage(t(questionKey));
      } else {
        // Temos 3 letras, filtrar palavras
        const wordList = getWordList(category);
        const filtered = filterWordsByLetters(wordList, newLetters);
        setPossibleWords(filtered);
        setStep('filtering');

        if (filtered.length === 1) {
          const revealedWord = filtered[0].toUpperCase();
          setTimeout(() => {
            addAiMessage(t('mentalConversation.messages.singleResult', { word: revealedWord }));
            setStep('revealing');
          }, 1500);
        } else if (filtered.length > 1) {
          const lettersText = newLetters.join('').toUpperCase();
          const optionsText = filtered.map(w => w.toUpperCase()).join(', ');
          addAiMessage(t('mentalConversation.messages.multipleOptions', { letters: lettersText, options: optionsText }));
        } else {
          addAiMessage(t('mentalConversation.messages.noMatch'));
        }
      }
      return;
    }

    if (step === 'filtering') {
      const responseWordCount = countWords(userInput);
      if (responseWordCount > 0 && responseWordCount <= possibleWords.length) {
        const selectedWord = possibleWords[responseWordCount - 1];
        const revealedWord = selectedWord.toUpperCase();
        const categoryName = getCategoryName(category);
        setTimeout(() => {
          addAiMessage(t('mentalConversation.messages.finalReveal', {
            word: revealedWord,
            category: categoryName
          }));
          setStep('revealing');
        }, 1500);
      }
    }

    if (step === 'revealing') {
      incrementUsage(GAME_IDS.PAPO_RETO).catch(console.error);
      navigate('/game-selector');
    }
  };

  const lastAiMessageIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].sender === 'ai') {
        return i;
      }
    }
    return -1;
  })();

  const letterGridActive = step === 'collecting' && letters.length < 3;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b border-border z-10 p-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <HeaderControls />
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">{t('gameSelector.cards.papoReto.title')}</h1>
          </div>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => {
            const isAi = message.sender === 'ai';
            const showGrid = isAi && index === lastAiMessageIndex && letterGridActive;
            return (
              <div
                key={index}
                className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi ? (
                  <div className="relative w-full max-w-sm">
                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[32px] border-[6px] border-primary/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-[0_20px_45px_rgba(59,130,246,0.25)]">
                      <div className="absolute inset-0 flex items-center justify-center opacity-80">
                        <img
                          src="/icons/icon-144x144.png"
                          alt="MindReader"
                          className="h-20 w-20 rotate-6 select-none opacity-70"
                          draggable={false}
                        />
                      </div>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />
                      <div className="relative z-10 flex h-full items-center justify-center p-6 text-center">
                        <p className="text-lg font-semibold text-white whitespace-pre-line drop-shadow-xl">
                          {message.text}
                        </p>
                      </div>
                      {showGrid && (
                        <div className="absolute inset-4 grid grid-cols-4 grid-rows-5 gap-2">
                          {LETTER_GRID.map((letter) => (
                            <button
                              key={letter}
                              type="button"
                              className="rounded-xl bg-transparent opacity-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                              onClick={() => handleLetterGridPress(letter)}
                              aria-label={t('papoReto.letterButtonAria', { letter })}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <Card className="max-w-[80%] bg-primary text-primary-foreground p-4">
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </Card>
                )}
              </div>
            );
          })}
          {letterGridActive && pendingGridLetter && (
            <span className="sr-only" aria-live="polite">
              {t('papoReto.selectedLetter', { letter: pendingGridLetter.toUpperCase() })}
            </span>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={t('mentalConversation.input.placeholder')}
            className="flex-1"
          />
          <Button 
            onClick={handleSubmit} 
            size="icon"
            disabled={!input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PapoReto;
