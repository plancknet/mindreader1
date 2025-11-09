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

type Category = 'animal' | 'fruta' | 'país' | null;
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

const FRUTAS = [
  'abacate', 'abacaxi', 'amora', 'banana', 'caju', 'cereja', 'coco', 'damasco',
  'figo', 'framboesa', 'goiaba', 'laranja', 'limão', 'maçã', 'mamão', 'manga',
  'maracujá', 'melancia', 'melão', 'morango', 'pera', 'pêssego', 'tangerina', 'uva'
];

const PAISES = [
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

  useEffect(() => {
    // Mensagem inicial
    addAiMessage('Olá! Eu sou uma inteligência artificial com poderes de leitura mental. 🧠✨\n\nPeça ao seu amigo para pensar em um ANIMAL, FRUTA ou PAÍS. Não me conte qual é a categoria ou a palavra, apenas peça para ele pensar!');
    setTimeout(() => {
      addAiMessage('Seu amigo já escolheu e está pronto para começar?');
      setStep('ready');
    }, 2000);
  }, []);

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
    if (cat === 'fruta') return FRUTAS;
    if (cat === 'país') return PAISES;
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
    if (cat === 'animal') return 'ANIMAL';
    if (cat === 'fruta') return 'FRUTA';
    if (cat === 'país') return 'PAÍS';
    return '';
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
          title: 'Erro',
          description: 'Não foi possível processar o áudio. Tente novamente.',
          variant: 'destructive'
        });
        setIsProcessingAudio(false);
      }
    } else {
      try {
        await startRecording();
        toast({
          title: 'Gravando',
          description: 'Fale agora...',
        });
      } catch (error) {
        console.error('Error starting recording:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível acessar o microfone.',
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
      else if (wordCount === 2) detectedCategory = 'fruta';
      else if (wordCount === 3) detectedCategory = 'país';

      setCategory(detectedCategory);
      setStep('collecting');
      addAiMessage('Perfeito! Vou fazer algumas perguntas para ler a mente do seu amigo... Responda naturalmente! 🔮\n\nQual é a sua cor favorita?');
      return;
    }

    if (step === 'collecting') {
      const letter = getLastWordFirstLetter(userInput);
      const newLetters = [...letters, letter];
      setLetters(newLetters);

      if (newLetters.length < 3) {
        // Perguntas para coletar letras
        const questions = [
          'Interessante! E qual é o seu hobby preferido?',
          'Que legal! Uma última pergunta: qual é a sua estação do ano favorita?'
        ];
        addAiMessage(questions[newLetters.length - 1]);
      } else {
        // Temos 3 letras, filtrar palavras
        const wordList = getWordList(category);
        const filtered = filterWordsByLetters(wordList, newLetters);
        setPossibleWords(filtered);
        setStep('filtering');

        if (filtered.length === 1) {
          setTimeout(() => {
            addAiMessage(`🎯 Incrível! Estou captando uma energia muito forte...\n\n✨ A palavra em que seu amigo pensou é:\n\n🌟 **${filtered[0].toUpperCase()}** 🌟\n\nEstou certo? ✨`);
            setStep('revealing');
          }, 1500);
        } else if (filtered.length > 1) {
          addAiMessage(`Hmm... estou recebendo alguns sinais. A palavra começa com "${newLetters.join('')}"...\n\nEstas são as possibilidades que estou captando: ${filtered.map(w => w.toUpperCase()).join(', ')}\n\nEstou no caminho certo?`);
        } else {
          addAiMessage('Ops! Parece que não consegui captar a palavra corretamente. Vamos tentar novamente? Digite "reiniciar" para começar de novo.');
        }
      }
      return;
    }

    if (step === 'filtering') {
      const responseWordCount = countWords(userInput);
      if (responseWordCount > 0 && responseWordCount <= possibleWords.length) {
        const selectedWord = possibleWords[responseWordCount - 1];
        setTimeout(() => {
          addAiMessage(`🎊 EUREKA!\n\n✨🌟 A palavra misteriosa é:\n\n🔮 **${selectedWord.toUpperCase()}** 🔮\n\nEu li a mente do seu amigo! A categoria era ${getCategoryName(category)} e a palavra era ${selectedWord.toUpperCase()}! 🧠✨\n\nQuer jogar novamente? Digite qualquer coisa para voltar ao menu!`);
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
            <h1 className="text-xl font-bold">Conversa Mental</h1>
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
                {isProcessingAudio ? 'Processando áudio...' : 'Falando...'}
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
            placeholder={isRecording ? "Gravando..." : "Digite sua resposta..."}
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
