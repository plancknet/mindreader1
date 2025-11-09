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
  'abelha', 'águia', 'baleia', 'borboleta', 'cachorro', 'camelo', 'cavalo', 'coelho', 
  'elefante', 'formiga', 'gato', 'girafa', 'gorila', 'hipopótamo', 'jacaré', 'leão',
  'macaco', 'onça', 'papagaio', 'peixe', 'rato', 'sapo', 'tigre', 'urso', 'zebra'
];

const FRUITS = [
  'abacate', 'abacaxi', 'amora', 'banana', 'caju', 'cereja', 'coco', 'damasco',
  'figo', 'framboesa', 'goiaba', 'laranja', 'limão', 'maçã', 'mamão', 'manga',
  'maracujá', 'melancia', 'melão', 'morango', 'pera', 'pêssego', 'tangerina', 'uva'
];

const COUNTRIES = [
  'alemanha', 'argentina', 'austrália', 'bélgica', 'brasil', 'canadá', 'chile', 'china',
  'colômbia', 'egito', 'espanha', 'frança', 'grécia', 'índia', 'inglaterra', 'itália',
  'japão', 'méxico', 'noruega', 'peru', 'portugal', 'rússia', 'suécia', 'tailândia', 'uruguai'
];

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

  const addAiMessage = async (text: string) => {
    setMessages(prev => [...prev, { text, sender: 'ai' }]);
    
    // Generate and play audio for AI message
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'alloy' }
      });

      if (error) throw error;

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

          if (error) throw error;

          if (data?.text) {
            setInput(data.text);
            // Auto-submit the transcribed text
            setTimeout(() => {
              addUserMessage(data.text);
              setInput('');
              setTimeout(() => processInput(data.text), 1000);
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

    setTimeout(() => {
      processInput(userInput);
    }, 1000);
  };

  const processInput = (userInput: string) => {
    const wordCount = countWords(userInput);

    if (step === 'ready') {
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
