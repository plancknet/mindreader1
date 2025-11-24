import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HeaderControls } from '@/components/HeaderControls';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { GAME_IDS } from '@/constants/games';
import { Brain, Send } from 'lucide-react';

type Category = 'animal' | 'fruit' | 'country' | null;
type GameStep = 'initial' | 'ready' | 'collecting' | 'filtering' | 'revealing';

type Message = { text: string; sender: 'ai' | 'user' };

const LETTER_GRID = Array.from({ length: 20 }, (_, idx) =>
  String.fromCharCode('A'.charCodeAt(0) + idx),
);

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
  'abacate', 'abacaxi', 'acerola', 'ameixa', 'amora', 'araticum', 'ata', 'atemoia', 'banana',
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
  'são vicente e granadinas', 'sérvia', 'síria', 'tailândia', 'taiwan', 'tanzânia', 'tchetchênia',
  'timor-leste', 'togo', 'tonga', 'trinidad e tobago', 'tunísia', 'turcomenistão', 'turquia',
  'tuvalu', 'ucrânia', 'uganda', 'uruguai', 'uzbequistão', 'vanuatu', 'vaticano', 'venezuela',
  'vietnã', 'zimbábue', 'zâmbia', 'áfrica do sul', 'áustria', 'índia'
];

const PapoReto = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { incrementUsage } = useUsageLimit();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState<GameStep>('initial');
  const [category, setCategory] = useState<Category>(null);
  const [letters, setLetters] = useState<string[]>([]);
  const [possibleWords, setPossibleWords] = useState<string[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (step !== 'initial') return;
    addAiMessage(t('mentalConversation.messages.greeting'));
    const timeout = setTimeout(() => {
      addAiMessage(t('mentalConversation.messages.readyCheck'));
      setStep('ready');
    }, 2000);
    return () => clearTimeout(timeout);
  }, [step, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addAiMessage = (text: string) => {
    setMessages((prev) => [...prev, { text, sender: 'ai' }]);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { text, sender: 'user' }]);
  };

  const countWords = (text: string): number =>
    text.trim().split(/\s+/).filter((word) => word.length > 0).length;

  const normalize = (text: string) =>
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const filterWordsByLetters = (words: string[], pattern: string[]) => {
    if (!pattern.length) return words;
    return words.filter((word) => {
      const normalizedWord = normalize(word);
      let cursor = 0;
      return pattern.every((letter) => {
        const idx = normalizedWord.indexOf(letter.toLowerCase(), cursor);
        if (idx === -1) return false;
        cursor = idx + 1;
        return true;
      });
    });
  };

  const getWordList = (cat: Category) => {
    if (cat === 'animal') return ANIMALS;
    if (cat === 'fruit') return FRUITS;
    if (cat === 'country') return COUNTRIES;
    return [];
  };

  const handleSubmit = () => {
    if (!input.trim()) return;
    addUserMessage(input);
    processInput(input);
    setInput('');
  };

  const processInput = (userInput: string) => {
    const wordCount = countWords(userInput);

    if (step === 'initial' || step === 'ready') {
      let detected: Category = null;
      if (wordCount === 1) detected = 'animal';
      else if (wordCount === 2) detected = 'fruit';
      else if (wordCount === 3) detected = 'country';
      setCategory(detected);
      setLetters([]);
      setSelectedLetter(null);
      setStep('collecting');
      addAiMessage(t('mentalConversation.messages.startCollecting'));
      return;
    }

    if (step === 'collecting') {
      if (!selectedLetter) {
        toast({
          title: 'Selecione uma letra',
          description: 'Toque discretamente no painel antes de continuar.',
          variant: 'destructive',
        });
        return;
      }
      const updatedLetters = [...letters, selectedLetter.toLowerCase()];
      setLetters(updatedLetters);
      setSelectedLetter(null);

      if (updatedLetters.length < 3) {
        const prompts = [
          'mentalConversation.messages.askHobby',
          'mentalConversation.messages.askSeason',
        ];
        addAiMessage(t(prompts[updatedLetters.length - 1]));
        return;
      }

      const filtered = filterWordsByLetters(getWordList(category), updatedLetters);
      setPossibleWords(filtered);
      setStep('filtering');

      if (filtered.length === 1) {
        const word = filtered[0].toUpperCase();
        setTimeout(() => {
          addAiMessage(t('mentalConversation.messages.singleResult', { word }));
          setStep('revealing');
        }, 1200);
      } else if (filtered.length > 1) {
        const options = filtered.map((w) => w.toUpperCase()).join(', ');
        addAiMessage(
          t('mentalConversation.messages.multipleOptions', {
            options,
          }),
        );
      } else {
        addAiMessage(t('mentalConversation.messages.noMatch'));
      }
      return;
    }

    if (step === 'filtering') {
      if (!possibleWords.length) {
        addAiMessage(t('mentalConversation.messages.noMatch'));
        return;
      }
      const responseCount = countWords(userInput);
      if (responseCount < 1 || responseCount > possibleWords.length) {
        toast({
          title: 'Resposta inválida',
          description: 'Use a quantidade correta de palavras para escolher.',
          variant: 'destructive',
        });
        return;
      }
      const word = possibleWords[responseCount - 1].toUpperCase();
      const categoryName = category ? t(`mentalConversation.categories.${category}`) : '';
      setTimeout(() => {
        addAiMessage(
          t('mentalConversation.messages.finalReveal', {
            word,
            category: categoryName,
          }),
        );
        setStep('revealing');
      }, 1200);
      return;
    }

    if (step === 'revealing') {
      incrementUsage(GAME_IDS.PAPO_RETO).catch(console.error);
      navigate('/game-selector');
    }
  };

  const currentAiPrompt = [...messages].reverse().find((msg) => msg.sender === 'ai');
  const needsLetterGrid = step === 'collecting' && letters.length < 3;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b border-border z-10 p-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <HeaderControls />
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Papo Reto</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-20 pb-56 px-4">
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

      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t border-border p-4 space-y-3">
        <div className="max-w-4xl mx-auto">
          {currentAiPrompt && (
            <Card className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-primary-foreground p-6 mb-4">
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <img src="/icons/icon-144x144.png" alt="MindReader" className="h-28 w-28" />
              </div>
              <div className="relative space-y-4">
                <p className="text-lg font-semibold leading-relaxed">{currentAiPrompt.text}</p>
                {needsLetterGrid && (
                  <>
                    <p className="text-sm text-primary-foreground/80">
                      Toque discretamente em uma letra ({letters.length + 1}/3)
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {LETTER_GRID.map((letter) => (
                        <button
                          key={letter}
                          onClick={() => setSelectedLetter(letter)}
                          className={`relative h-12 rounded-xl border border-transparent focus-visible:outline focus-visible:outline-primary transition ${
                            selectedLetter === letter ? 'bg-primary/30 border-primary opacity-90' : 'opacity-0'
                          }`}
                          aria-label={`Selecionar letra ${letter}`}
                        >
                          <span className="sr-only">{letter}</span>
                        </button>
                      ))}
                    </div>
                    {selectedLetter && (
                      <p className="text-xs uppercase tracking-[0.3em] text-center">
                        Letra selecionada: {selectedLetter}
                      </p>
                    )}
                  </>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={t('mentalConversation.input.placeholder')}
            className="flex-1"
          />
          <Button onClick={handleSubmit} size="icon" disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PapoReto;
