import { useState, useCallback } from 'react';
import { useGameUsageTracker } from '@/hooks/useGameUsageTracker';
import { GAME_IDS } from '@/constants/games';
import { Mic, Camera, Home, Search, Bell, Clock, Sparkles, Music, ArrowLeft, MoreVertical } from 'lucide-react';

// Real celebrity data with Wikipedia-style info
const CELEBRITIES = [
  { 
    id: 1, 
    name: 'Anitta', 
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Anitta_2023.png/440px-Anitta_2023.png',
    description: 'Larissa de Macedo Machado, conhecida pelo nome artístico Anitta, é uma cantora, compositora, atriz, dançarina e empresária brasileira.',
    birthDate: '30 de março de 1993',
    occupation: 'Cantora, compositora, atriz',
    nationality: 'Brasileira'
  },
  { 
    id: 2, 
    name: 'Neymar Jr', 
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Bra-Cos_%281%29_%28cropped%29.jpg/440px-Bra-Cos_%281%29_%28cropped%29.jpg',
    description: 'Neymar da Silva Santos Júnior, conhecido como Neymar Jr., é um futebolista brasileiro que atua como ponta-esquerda e meia-atacante.',
    birthDate: '5 de fevereiro de 1992',
    occupation: 'Futebolista',
    nationality: 'Brasileiro'
  },
  { 
    id: 3, 
    name: 'Ivete Sangalo', 
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Ivete_Sangalo_2018_%28cropped%29.jpg/440px-Ivete_Sangalo_2018_%28cropped%29.jpg',
    description: 'Ivete Maria Dias de Sangalo é uma cantora, compositora, instrumentista, apresentadora e atriz brasileira.',
    birthDate: '27 de maio de 1972',
    occupation: 'Cantora, apresentadora',
    nationality: 'Brasileira'
  },
  { 
    id: 4, 
    name: 'Ronaldinho Gaúcho', 
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Ronaldinho_2019.jpg/440px-Ronaldinho_2019.jpg',
    description: 'Ronaldo de Assis Moreira, mais conhecido como Ronaldinho Gaúcho, é um ex-futebolista brasileiro, considerado um dos maiores jogadores de todos os tempos.',
    birthDate: '21 de março de 1980',
    occupation: 'Ex-futebolista',
    nationality: 'Brasileiro'
  },
  { 
    id: 5, 
    name: 'Gisele Bündchen', 
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Gisele_Bundchen_2.jpg/440px-Gisele_Bundchen_2.jpg',
    description: 'Gisele Caroline Bündchen é uma supermodelo brasileira, considerada uma das mais influentes do mundo da moda.',
    birthDate: '20 de julho de 1980',
    occupation: 'Modelo, empresária',
    nationality: 'Brasileira'
  },
  { 
    id: 6, 
    name: 'Pelé', 
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Pele_con_brasil_%28cropped%29.jpg/440px-Pele_con_brasil_%28cropped%29.jpg',
    description: 'Edson Arantes do Nascimento, conhecido mundialmente como Pelé, foi um futebolista brasileiro, amplamente considerado o maior jogador de futebol de todos os tempos.',
    birthDate: '23 de outubro de 1940',
    occupation: 'Ex-futebolista',
    nationality: 'Brasileiro'
  },
  { 
    id: 7, 
    name: 'Xuxa', 
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Xuxa_Meneghel_em_2019_%28cropped%29.jpg/440px-Xuxa_Meneghel_em_2019_%28cropped%29.jpg',
    description: 'Maria da Graça Xuxa Meneghel, conhecida como Xuxa, é uma apresentadora de televisão, cantora, atriz e empresária brasileira.',
    birthDate: '27 de março de 1963',
    occupation: 'Apresentadora, cantora, atriz',
    nationality: 'Brasileira'
  },
  { 
    id: 8, 
    name: 'Gusttavo Lima', 
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Gusttavo_Lima_%28cropped%29.jpg/440px-Gusttavo_Lima_%28cropped%29.jpg',
    description: 'Nivaldo Batista Lima, mais conhecido pelo nome artístico Gusttavo Lima, é um cantor e compositor brasileiro de música sertaneja.',
    birthDate: '3 de setembro de 1989',
    occupation: 'Cantor, compositor',
    nationality: 'Brasileiro'
  },
  { 
    id: 9, 
    name: 'Bruna Marquezine', 
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Bruna_Marquezine_em_2023.jpg/440px-Bruna_Marquezine_em_2023.jpg',
    description: 'Bruna Reis Maia, conhecida como Bruna Marquezine, é uma atriz brasileira conhecida por seus papéis em novelas da TV Globo.',
    birthDate: '4 de agosto de 1995',
    occupation: 'Atriz',
    nationality: 'Brasileira'
  },
  { 
    id: 10, 
    name: 'Caetano Veloso', 
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Caetano_Veloso_2012_%28cropped%29.jpg/440px-Caetano_Veloso_2012_%28cropped%29.jpg',
    description: 'Caetano Emanuel Viana Teles Veloso é um músico, produtor, arranjador e escritor brasileiro, considerado um dos maiores artistas da música brasileira.',
    birthDate: '7 de agosto de 1942',
    occupation: 'Cantor, compositor',
    nationality: 'Brasileiro'
  },
  { 
    id: 11, 
    name: 'Sabrina Sato', 
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Sabrina_Sato_em_2019.jpg/440px-Sabrina_Sato_em_2019.jpg',
    description: 'Sabrina Sato Rahal é uma apresentadora de televisão, atriz, modelo e empresária brasileira.',
    birthDate: '4 de fevereiro de 1981',
    occupation: 'Apresentadora, modelo',
    nationality: 'Brasileira'
  },
  { 
    id: 12, 
    name: 'Roberto Carlos', 
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Roberto_Carlos_2019_%28cropped%29.jpg/440px-Roberto_Carlos_2019_%28cropped%29.jpg',
    description: 'Roberto Carlos Braga é um cantor e compositor brasileiro, considerado o Rei da Música Brasileira e um dos artistas mais influentes do país.',
    birthDate: '19 de abril de 1941',
    occupation: 'Cantor, compositor',
    nationality: 'Brasileiro'
  },
];

// Fake search results for web tab
const SEARCH_RESULTS = [
  { title: 'Lista de celebridades brasileiras - Wikipédia', url: 'pt.wikipedia.org', snippet: 'Esta é uma lista de celebridades brasileiras famosas do cinema, televisão, música e esporte...' },
  { title: 'Celebridades brasileiras mais seguidas nas redes sociais', url: 'uol.com.br', snippet: 'Confira o ranking das celebridades brasileiras com mais seguidores no Instagram em 2024...' },
  { title: 'Notícias de famosos e celebridades - Gshow', url: 'gshow.globo.com', snippet: 'Últimas notícias de famosos, fofocas e novidades sobre celebridades brasileiras e internacionais...' },
  { title: 'Forbes Brasil - Lista dos famosos mais ricos', url: 'forbes.com.br', snippet: 'Ranking anual das celebridades brasileiras mais bem pagas do ano...' },
  { title: 'Caras Brasil - Revista de celebridades', url: 'caras.uol.com.br', snippet: 'Tudo sobre famosos, festas, casamentos, filhos e a vida das celebridades brasileiras...' },
];

// News articles for the home screen
const NEWS_ARTICLES = [
  {
    source: 'Jornal O Globo',
    sourceIcon: '📰',
    title: 'As novas superestrelas de IA da Meta começam a bater de frente com o restante da empresa',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  },
  {
    source: 'Folha de S.Paulo',
    sourceIcon: '📰',
    title: 'Brasil lidera crescimento econômico na América Latina em 2024',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
  },
];

type Stage = 'search' | 'results' | 'images' | 'scrolled' | 'reveal';
type Tab = 'all' | 'images' | 'news' | 'videos';

export default function GoogleMime() {
  const [stage, setStage] = useState<Stage>('search');
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCelebrity, setSelectedCelebrity] = useState<typeof CELEBRITIES[0] | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { trackUsage } = useGameUsageTracker(GAME_IDS.GOOGLE_MIME);

  // Handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.toLowerCase().includes('celebridade') || searchQuery.toLowerCase().includes('celebrity') || searchQuery.toLowerCase().includes('famoso')) {
      setStage('results');
      setShowSearchSuggestions(false);
      setIsSearchFocused(false);
    }
  };

  // Handle double click on image to secretly select it
  const handleImageDoubleClick = useCallback((celebrity: typeof CELEBRITIES[0]) => {
    setSelectedCelebrity(celebrity);
    // No visual feedback - this is the magic trick!
  }, []);

  // Handle scroll detection
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if ((stage === 'results' || stage === 'images') && selectedCelebrity && !hasScrolled) {
      const target = e.currentTarget;
      if (target.scrollTop > 150) {
        setHasScrolled(true);
        setStage('scrolled');
      }
    }
  }, [stage, selectedCelebrity, hasScrolled]);

  // Handle link click - reveal the selected image
  const handleLinkClick = () => {
    if (selectedCelebrity && hasScrolled) {
      trackUsage();
      setStage('reveal');
    }
  };

  // Handle tab change
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'images') {
      setStage('images');
    } else if (tab === 'all') {
      setStage('results');
    }
  };

  // Reset game
  const handleReset = () => {
    setStage('search');
    setActiveTab('all');
    setSearchQuery('');
    setSelectedCelebrity(null);
    setHasScrolled(false);
    setShowSearchSuggestions(false);
    setIsSearchFocused(false);
  };

  // Google Logo with Christmas lights
  const GoogleLogoFestive = () => (
    <div className="relative flex flex-col items-center">
      {/* Christmas lights decoration */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-32 h-3">
        <svg viewBox="0 0 120 12" className="w-full h-full">
          <path d="M0,6 Q30,0 60,6 Q90,12 120,6" fill="none" stroke="#333" strokeWidth="1"/>
          <circle cx="15" cy="4" r="4" fill="#FF4444"/>
          <circle cx="35" cy="7" r="4" fill="#FFD700"/>
          <circle cx="55" cy="5" r="4" fill="#4CAF50"/>
          <circle cx="75" cy="8" r="4" fill="#FF4444"/>
          <circle cx="95" cy="5" r="4" fill="#2196F3"/>
          <circle cx="105" cy="7" r="4" fill="#FFD700"/>
        </svg>
      </div>
      {/* Google text */}
      <svg viewBox="0 0 272 92" className="h-10 w-auto mt-2">
        <path fill="#4285F4" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
        <path fill="#EA4335" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
        <path fill="#FBBC05" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/>
        <path fill="#4285F4" d="M225 3v65h-9.5V3h9.5z"/>
        <path fill="#34A853" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/>
        <path fill="#EA4335" d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"/>
      </svg>
    </div>
  );

  // Search stage - Google home screen matching the app visual
  if (stage === 'search') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)' }}>
        {/* Status Bar simulation */}
        <div className="flex items-center justify-between px-4 py-2 text-white text-xs">
          <span className="font-medium">18:05</span>
          <div className="flex items-center gap-1">
            <span>📶</span>
            <span>40%</span>
            <span>🔋</span>
          </div>
        </div>

        {/* Header with Labs icon and Profile */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="w-12 h-12 rounded-full bg-[#4285F4]/20 flex items-center justify-center border border-[#4285F4]/30">
            <span className="text-[#4285F4] text-lg">🧪</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center border-2 border-red-500 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Google Logo */}
        <div className="flex justify-center mt-4 mb-6">
          <GoogleLogoFestive />
        </div>

        {/* Search Bar */}
        <div className="px-4 mb-4">
          <div 
            className="relative flex items-center bg-[#303134] rounded-full shadow-lg"
            onClick={() => setIsSearchFocused(true)}
          >
            {isSearchFocused ? (
              <form onSubmit={handleSearch} className="flex-1 flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchSuggestions(e.target.value.length > 0);
                  }}
                  placeholder="Pesquisa"
                  className="flex-1 bg-transparent py-4 px-6 text-white placeholder-[#9aa0a6] focus:outline-none text-base"
                  autoFocus
                />
                <button type="button" className="p-3">
                  <Mic className="w-6 h-6 text-[#4285F4]" />
                </button>
                <button type="button" className="p-3 pr-4">
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </form>
            ) : (
              <>
                <span className="flex-1 py-4 px-6 text-[#9aa0a6] text-base">Pesquisa</span>
                <button type="button" className="p-3">
                  <Mic className="w-6 h-6 text-[#4285F4]" />
                </button>
                <button type="button" className="p-3 pr-4">
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </>
            )}
          </div>

          {/* Search Suggestions */}
          {showSearchSuggestions && isSearchFocused && (
            <div className="absolute left-4 right-4 mt-1 bg-[#303134] rounded-2xl shadow-lg z-10 overflow-hidden">
              {['Celebridade', 'Celebridades brasileiras', 'Celebridades famosas'].map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSearchQuery(suggestion);
                    setTimeout(() => handleSearch(), 100);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#3c4043] text-left border-b border-[#5f6368]/30 last:border-0"
                >
                  <Search className="w-4 h-4 text-[#9aa0a6]" />
                  <span className="text-white">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Action Pills */}
        <div className="flex gap-3 px-4 mb-6 overflow-x-auto">
          <button className="flex items-center gap-2 bg-[#303134] rounded-full px-5 py-3 whitespace-nowrap">
            <Sparkles className="w-5 h-5 text-[#8ab4f8]" />
            <span className="text-white font-medium">Modo IA</span>
          </button>
          <button className="flex items-center justify-center bg-[#303134] rounded-full w-12 h-12">
            <Music className="w-5 h-5 text-white" />
          </button>
          <button className="flex items-center justify-center bg-[#303134] rounded-full w-12 h-12">
            <span className="text-xl">🍌</span>
          </button>
        </div>

        {/* Info Cards Row */}
        <div className="flex gap-3 px-4 mb-4 overflow-x-auto">
          {/* Sports Card */}
          <div className="flex-shrink-0 bg-[#303134] rounded-2xl p-4 min-w-[160px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white font-medium text-sm">VDG x FLU</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <span className="text-xs">⚽</span>
                </div>
                <span className="text-[#9aa0a6] text-xs">Hoje<br/>20:00</span>
                <div className="w-8 h-8 bg-[#8B0000] rounded-full flex items-center justify-center">
                  <span className="text-xs">⚽</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Card */}
          <div className="flex-shrink-0 bg-[#303134] rounded-2xl p-4 min-w-[140px]">
            <span className="text-white font-medium text-sm">Quiririm</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-white text-2xl font-light">31°</span>
              <span className="text-[#9aa0a6] text-sm">☁️ 5%</span>
            </div>
          </div>

          {/* Time Card */}
          <div className="flex-shrink-0 bg-[#303134] rounded-2xl p-4 min-w-[100px]">
            <span className="text-white font-medium text-sm">Pô...</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-white text-2xl font-light">6:</span>
            </div>
          </div>
        </div>

        {/* News Feed */}
        <div className="flex-1 bg-white rounded-t-3xl mt-2 overflow-hidden">
          {NEWS_ARTICLES.map((article, index) => (
            <div key={index} className="border-b border-[#e8eaed]">
              {/* Article Header */}
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#f1f3f4] flex items-center justify-center">
                    <span>{article.sourceIcon}</span>
                  </div>
                  <span className="text-[#202124] text-sm font-medium">{article.source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 border border-[#dadce0] rounded-full text-sm text-[#1a73e8]">
                    Seguir
                  </button>
                  <button className="p-1">
                    <MoreVertical className="w-5 h-5 text-[#5f6368]" />
                  </button>
                </div>
              </div>
              {/* Article Image */}
              <img 
                src={article.image} 
                alt={article.title}
                className="w-full h-48 object-cover"
              />
              {/* Article Title */}
              <p className="px-4 py-3 text-[#202124] text-lg leading-tight">
                {article.title}
              </p>
            </div>
          ))}
        </div>
        
        {/* Bottom Navigation */}
        <div className="flex justify-around py-3 bg-white border-t border-[#e8eaed]">
          <button className="flex flex-col items-center gap-1">
            <div className="bg-[#e8f0fe] rounded-full px-4 py-1">
              <Home className="w-6 h-6 text-[#1a73e8]" />
            </div>
            <span className="text-xs text-[#1a73e8] font-medium">Início</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <Search className="w-6 h-6 text-[#5f6368]" />
            <span className="text-xs text-[#5f6368]">Pesquisar</span>
          </button>
          <button className="flex flex-col items-center gap-1 relative">
            <Bell className="w-6 h-6 text-[#5f6368]" />
            <span className="absolute -top-1 right-0 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">9+</span>
            <span className="text-xs text-[#5f6368]">Notificações</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <Clock className="w-6 h-6 text-[#5f6368]" />
            <span className="text-xs text-[#5f6368]">Atividade</span>
          </button>
        </div>
      </div>
    );
  }

  // Reveal stage - Show Wikipedia-style page for selected celebrity
  if (stage === 'reveal' && selectedCelebrity) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Wikipedia-style Header */}
        <div className="bg-white border-b border-[#a2a9b1] px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={handleReset} className="p-2 -ml-2">
                <ArrowLeft className="w-5 h-5 text-[#54595d]" />
              </button>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/103px-Wikipedia-logo-v2.svg.png" alt="Wikipedia" className="h-8" />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2">
                <Search className="w-5 h-5 text-[#54595d]" />
              </button>
            </div>
          </div>
        </div>

        {/* Wikipedia Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Title */}
          <div className="px-4 py-4 border-b border-[#eaecf0]">
            <h1 className="text-2xl font-serif text-[#202122]">{selectedCelebrity.name}</h1>
            <p className="text-sm text-[#54595d] mt-1">Origem: Wikipédia, a enciclopédia livre.</p>
          </div>

          {/* Main Image */}
          <div className="px-4 py-4">
            <div className="float-right ml-4 mb-4 w-48">
              <div className="border border-[#a2a9b1] bg-[#f8f9fa] p-2">
                <img 
                  src={selectedCelebrity.image} 
                  alt={selectedCelebrity.name}
                  className="w-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x400/f8f9fa/202122?text=${encodeURIComponent(selectedCelebrity.name)}`;
                  }}
                />
                <p className="text-xs text-[#54595d] text-center mt-2">{selectedCelebrity.name}</p>
              </div>
              
              {/* Info Box */}
              <div className="border border-[#a2a9b1] bg-[#f8f9fa] mt-2">
                <div className="bg-[#eaecf0] px-2 py-1 text-center font-medium text-sm">{selectedCelebrity.name}</div>
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-t border-[#eaecf0]">
                      <td className="px-2 py-1 font-medium bg-[#f8f9fa]">Nascimento</td>
                      <td className="px-2 py-1">{selectedCelebrity.birthDate}</td>
                    </tr>
                    <tr className="border-t border-[#eaecf0]">
                      <td className="px-2 py-1 font-medium bg-[#f8f9fa]">Nacionalidade</td>
                      <td className="px-2 py-1">{selectedCelebrity.nationality}</td>
                    </tr>
                    <tr className="border-t border-[#eaecf0]">
                      <td className="px-2 py-1 font-medium bg-[#f8f9fa]">Ocupação</td>
                      <td className="px-2 py-1">{selectedCelebrity.occupation}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Article Text */}
            <p className="text-[#202122] text-base leading-relaxed mb-4">
              <strong>{selectedCelebrity.name}</strong> {selectedCelebrity.description}
            </p>
            <p className="text-[#202122] text-base leading-relaxed mb-4">
              Considerado(a) um(a) dos maiores nomes de sua área no Brasil, {selectedCelebrity.name.split(' ')[0]} conquistou reconhecimento nacional e internacional ao longo de sua carreira.
            </p>
            <p className="text-[#202122] text-base leading-relaxed mb-4">
              Sua trajetória profissional é marcada por grandes conquistas e contribuições significativas para a cultura brasileira.
            </p>
            
            <div className="clear-both" />
            
            {/* Sections */}
            <h2 className="text-xl font-serif text-[#202122] mt-6 mb-2 pb-1 border-b border-[#a2a9b1]">Carreira</h2>
            <p className="text-[#202122] text-base leading-relaxed mb-4">
              {selectedCelebrity.name.split(' ')[0]} iniciou sua carreira profissional ainda jovem, demonstrando talento excepcional desde cedo. Ao longo dos anos, acumulou uma série de conquistas que consolidaram sua posição como referência em sua área de atuação.
            </p>
            
            <h2 className="text-xl font-serif text-[#202122] mt-6 mb-2 pb-1 border-b border-[#a2a9b1]">Vida pessoal</h2>
            <p className="text-[#202122] text-base leading-relaxed mb-4">
              Nascido(a) em {selectedCelebrity.birthDate}, {selectedCelebrity.name.split(' ')[0]} é conhecido(a) por manter aspectos de sua vida pessoal de forma reservada, embora seja frequentemente visto(a) em eventos públicos e aparições na mídia.
            </p>
          </div>
        </div>

        {/* Bottom button to restart */}
        <div className="p-4 border-t border-[#eaecf0]">
          <button 
            onClick={handleReset}
            className="w-full py-3 bg-[#1A73E8] text-white rounded-full font-medium"
          >
            Nova pesquisa
          </button>
        </div>
      </div>
    );
  }

  // Results/Images/Scrolled stage - Search results with celebrity images
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Search Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#e8eaed]">
        <div className="flex items-center gap-2 px-4 py-2">
          <button onClick={handleReset} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-[#5f6368]" />
          </button>
          <div className="flex-1 flex items-center bg-[#f1f3f4] rounded-full px-4 py-2">
            <span className="text-[#202124] text-sm">{searchQuery || 'Celebridade'}</span>
          </div>
          <button className="p-2">
            <MoreVertical className="w-5 h-5 text-[#5f6368]" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-0 px-4 text-sm overflow-x-auto">
          <button 
            onClick={() => handleTabChange('all')}
            className={`py-3 px-4 font-medium whitespace-nowrap ${activeTab === 'all' ? 'text-[#1A73E8] border-b-2 border-[#1A73E8]' : 'text-[#5f6368]'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => handleTabChange('images')}
            className={`py-3 px-4 font-medium whitespace-nowrap ${activeTab === 'images' ? 'text-[#1A73E8] border-b-2 border-[#1A73E8]' : 'text-[#5f6368]'}`}
          >
            Imagens
          </button>
          <button className="py-3 px-4 text-[#5f6368] whitespace-nowrap">Notícias</button>
          <button className="py-3 px-4 text-[#5f6368] whitespace-nowrap">Vídeos</button>
          <button className="py-3 px-4 text-[#5f6368] whitespace-nowrap">Shopping</button>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div 
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        {/* Images Tab Content */}
        {(activeTab === 'images' || stage === 'images') && (
          <div className="p-2">
            <div className="grid grid-cols-3 gap-1">
              {CELEBRITIES.map((celebrity) => (
                <div
                  key={celebrity.id}
                  className="aspect-square overflow-hidden cursor-pointer relative group"
                  onDoubleClick={() => handleImageDoubleClick(celebrity)}
                >
                  <img
                    src={celebrity.image}
                    alt={celebrity.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://via.placeholder.com/200x200/f1f3f4/5f6368?text=${encodeURIComponent(celebrity.name.split(' ')[0])}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}
            </div>
            
            {/* Links below images */}
            {hasScrolled && (
              <div className="mt-4 px-2 space-y-4">
                <p className="text-xs text-[#70757a]">Pesquisas relacionadas</p>
                {SEARCH_RESULTS.slice(0, 3).map((result, index) => (
                  <div 
                    key={index}
                    className="cursor-pointer hover:bg-[#f8f9fa] -mx-2 px-2 py-2 rounded"
                    onClick={handleLinkClick}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-[#f1f3f4] flex items-center justify-center">
                        <span className="text-[10px] text-[#5f6368] font-medium">{result.url[0].toUpperCase()}</span>
                      </div>
                      <span className="text-xs text-[#202124]">{result.url}</span>
                    </div>
                    <h3 className="text-base text-[#1a0dab] hover:underline">{result.title}</h3>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Tab Content */}
        {activeTab === 'all' && stage !== 'images' && (
          <div className="px-4 py-3">
            {/* Results count */}
            <p className="text-xs text-[#70757a] mb-4">
              Cerca de 1.230.000.000 resultados (0,42 s)
            </p>
            
            {/* Image carousel */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-medium text-[#202124]">Imagens</h2>
                <button 
                  onClick={() => handleTabChange('images')}
                  className="text-sm text-[#1A73E8]"
                >
                  Ver todas
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                {CELEBRITIES.slice(0, 6).map((celebrity) => (
                  <div
                    key={celebrity.id}
                    className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer"
                    onDoubleClick={() => handleImageDoubleClick(celebrity)}
                  >
                    <img
                      src={celebrity.image}
                      alt={celebrity.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/100x100/f1f3f4/5f6368?text=${encodeURIComponent(celebrity.name.split(' ')[0])}`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Search Results - Links */}
            <div className="space-y-6">
              {SEARCH_RESULTS.map((result, index) => (
                <div 
                  key={index}
                  className={`cursor-pointer ${hasScrolled ? 'hover:bg-[#f8f9fa] -mx-2 px-2 py-2 rounded' : ''}`}
                  onClick={hasScrolled ? handleLinkClick : undefined}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-[#f1f3f4] flex items-center justify-center">
                      <span className="text-xs text-[#5f6368] font-medium">{result.url[0].toUpperCase()}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-[#202124]">{result.url}</span>
                    </div>
                  </div>
                  <h3 className="text-lg text-[#1a0dab] hover:underline mb-1">
                    {result.title}
                  </h3>
                  <p className="text-sm text-[#4d5156] line-clamp-2">
                    {result.snippet}
                  </p>
                </div>
              ))}
              
              {/* More content to enable scrolling */}
              <div className="py-8">
                <p className="text-center text-[#70757a] text-sm">Pesquisas relacionadas</p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {['celebridades brasileiras 2024', 'famosos do brasil', 'artistas brasileiros', 'cantores famosos'].map((term, i) => (
                    <span key={i} className="px-4 py-2 bg-[#f1f3f4] rounded-full text-sm text-[#202124]">{term}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scroll indicator when celebrity is selected but not scrolled yet */}
        {selectedCelebrity && !hasScrolled && (
          <div className="fixed bottom-20 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm animate-bounce">
              ↓ Role para continuar
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
