import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LogoutButton } from '@/components/LogoutButton';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, Send, Mic, Square } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  'biribá', 'buriti', 'cabeluda', 'cagaita', 'caju', 'cajá', 'cambuci', 'carambola', 'cereja',
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

const TTS_ENABLED = import.meta.env.VITE_ENABLE_TTS === 'true';

const MentalConversation = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState<GameStep>('initial');
  const [category, setCategory] = useState<Category>(null);
  const [letters, setLetters] = useState<string[]>([]);
  const [possibleWords, setPossibleWords] = useState<string[]>([]);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
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
    setMessages(prev => [...prev, { text, sender: 'ai' }]);

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
          
          audio.onplay = () => setIsPlayingAudio(true);
          audio.onended = () => setIsPlayingAudio(false);
          audio.onerror = () => setIsPlayingAudio(false);
          
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
    setMessages(prev => [...prev, { text, sender: 'user' }]);
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
    return words.filter(word => {
      const normalizedWord = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return letters.every((letter, index) => {
        return normalizedWord[index] && normalizedWord[index].toLowerCase() === letter.toLowerCase();
      });
    });
  };

  const getCategoryName = (cat: Category): string => {
    if (!cat) return '';
    return t(`mentalConversation.categories.${cat}`);
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      try {
        setIsProcessingAudio(true);
        const audioBlob = await stopRecording();
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];
          
          if (!base64Audio) {
            throw new Error('Failed to convert audio');
          }

          // Send to speech-to-text edge function with language
          const languageMap: Record<string, string> = {
            'pt-BR': 'pt',
            'en': 'en',
            'es': 'es',
            'zh-CN': 'zh',
            'fr': 'fr',
            'it': 'it'
          };
          
          const { data, error } = await supabase.functions.invoke('speech-to-text', {
            body: { 
              audio: base64Audio,
              language: languageMap[language] || 'pt'
            }
          });

          if (error) {
            console.error('Speech-to-text error:', error);
            throw new Error('Erro ao processar áudio. Verifique se a API OpenAI está configurada corretamente.');
          }

          if (data?.error) {
            console.error('Speech-to-text API error:', data.error);
            throw new Error('Erro na API de transcrição de áudio. Verifique sua quota do OpenAI.');
          }

          if (data?.text) {
            setInput(data.text);
            // Auto-submit the transcribed text
            setTimeout(() => {
              addUserMessage(data.text);
              setInput('');
              processInput(data.text);
            }, 100);
          }

          setIsProcessingAudio(false);
        };
      } catch (error) {
        console.error('Error processing voice:', error);
        toast({
          title: t('mentalConversation.toast.errorTitle'),
          description: t('mentalConversation.toast.audioProcessingFailed'),
          variant: 'destructive'
        });
        setIsProcessingAudio(false);
      }
    } else {
      try {
        await startRecording();
        toast({
          title: t('mentalConversation.toast.recordingTitle'),
          description: t('mentalConversation.toast.recordingDescription'),
        });
      } catch (error) {
        console.error('Error starting recording:', error);
        toast({
          title: t('mentalConversation.toast.errorTitle'),
          description: t('mentalConversation.toast.micErrorDescription'),
          variant: 'destructive'
        });
      }
    }
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
      const letter = getLastWordFirstLetter(userInput);
      const newLetters = [...letters, letter];
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
      navigate('/game-selector');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b border-border z-10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/game-selector')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">{t('mentalConversation.title')}</h1>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSelector />
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Processing Animation */}
      {(isProcessingAudio || isPlayingAudio) && (
        <div className="flex justify-center my-4">
          <Card className="p-4 bg-card">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-8 bg-primary rounded-full animate-pulse"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {isProcessingAudio
                  ? t('mentalConversation.status.processingAudio')
                  : t('mentalConversation.status.speaking')}
              </span>
            </div>
          </Card>
        </div>
      )}
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-[80%] p-4 ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : message.text.includes('🔮') || message.text.includes('🌟')
                    ? 'bg-card animate-pulse border-2 border-primary shadow-lg shadow-primary/50'
                    : 'bg-card'
                }`}
              >
                <p className={`whitespace-pre-wrap ${
                  message.text.includes('🔮') || message.text.includes('🌟')
                    ? 'text-center text-lg font-bold'
                    : ''
                }`}>{message.text}</p>
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isRecording && handleSubmit()}
            placeholder={isRecording ? t('mentalConversation.input.recording') : t('mentalConversation.input.placeholder')}
            className="flex-1"
            disabled={isRecording || isProcessingAudio}
          />
          <Button 
            onClick={handleVoiceInput} 
            size="icon"
            variant={isRecording ? "destructive" : "secondary"}
            disabled={isProcessingAudio}
          >
            {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Button 
            onClick={handleSubmit} 
            size="icon"
            disabled={isRecording || isProcessingAudio || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MentalConversation;
