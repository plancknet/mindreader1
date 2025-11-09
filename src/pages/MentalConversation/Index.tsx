import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LogoutButton } from '@/components/LogoutButton';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, Send } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

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
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState<GameStep>('initial');
  const [category, setCategory] = useState<Category>(null);
  const [letters, setLetters] = useState<string[]>([]);
  const [possibleWords, setPossibleWords] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const addAiMessage = (text: string) => {
    setMessages(prev => [...prev, { text, sender: 'ai' }]);
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
            addAiMessage(`🎯 Incrível! Estou captando uma energia muito forte...\n\nA palavra em que seu amigo pensou é: **${filtered[0].toUpperCase()}**!\n\nEstou certo? ✨`);
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
          addAiMessage(`🎊 EUREKA! A palavra misteriosa é: **${selectedWord.toUpperCase()}**!\n\nEu li a mente do seu amigo! A categoria era ${getCategoryName(category)} e a palavra era ${selectedWord.toUpperCase()}! 🧠✨\n\nQuer jogar novamente? Digite qualquer coisa para voltar ao menu!`);
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
                    : 'bg-card'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
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
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Digite sua resposta..."
            className="flex-1"
          />
          <Button onClick={handleSubmit} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MentalConversation;
