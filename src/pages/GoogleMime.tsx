import { useState, lazy, Suspense } from 'react';
import { verifyGoogleMimeCode } from '@/lib/googleMimeCode';
import { Mic, Camera, Sparkles, Music, Search, Home, Bell, Clock, MoreVertical } from 'lucide-react';

const GoogleMimeAppLazy = lazy(() => import('./GoogleMimeApp'));

const SEARCH_SUGGESTIONS = ['Celebridade', 'Celebridades brasileiras', 'Celebridades famosas'];

const NEWS_ARTICLES = [
  {
    source: 'Jornal O Globo',
    sourceIcon: 'JG',
    title: 'As novas superestrelas de IA da Meta comecam a bater de frente com o restante da empresa',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  },
  {
    source: 'Folha de S.Paulo',
    sourceIcon: 'FS',
    title: 'Brasil lidera crescimento economico na America Latina em 2024',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
  },
];

const GoogleLogoFestive = () => (
  <div className="relative flex flex-col items-center">
    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-32 h-3">
      <svg viewBox="0 0 120 12" className="w-full h-full">
        <path d="M0,6 Q30,0 60,6 Q90,12 120,6" fill="none" stroke="#333" strokeWidth="1" />
        <circle cx="15" cy="4" r="4" fill="#FF4444" />
        <circle cx="35" cy="7" r="4" fill="#FFD700" />
        <circle cx="55" cy="5" r="4" fill="#4CAF50" />
        <circle cx="75" cy="8" r="4" fill="#FF4444" />
        <circle cx="95" cy="5" r="4" fill="#2196F3" />
        <circle cx="105" cy="7" r="4" fill="#FFD700" />
      </svg>
    </div>
    <svg viewBox="0 0 272 92" className="h-10 w-auto mt-2">
      <path
        fill="#4285F4"
        d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
      />
      <path
        fill="#EA4335"
        d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
      />
      <path
        fill="#FBBC05"
        d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"
      />
      <path fill="#4285F4" d="M225 3v65h-9.5V3h9.5z" />
      <path
        fill="#34A853"
        d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"
      />
      <path
        fill="#EA4335"
        d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"
      />
    </svg>
  </div>
);

const NotFoundScreen = ({ onRetry }: { onRetry: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] text-[#202124] px-6 text-center">
    <p className="text-6xl font-semibold mb-4">404</p>
    <p className="text-lg mb-6">A pagina que voce tentou acessar nao existe.</p>
    <button
      className="px-6 py-2 rounded-full border border-[#dadce0] text-sm text-[#3c4043] hover:bg-white"
      onClick={onRetry}
    >
      Voltar para pesquisa
    </button>
  </div>
);

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-black text-white">
    Carregando jogo...
  </div>
);

const GoogleMimePublic = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const resetState = () => {
    setNotFound(false);
    setSearchValue('');
    setShowSuggestions(false);
    setIsSearchFocused(false);
  };

  const validateCode = async () => {
    if (searchValue.length !== 3 || !/^\d{3}$/.test(searchValue)) {
      setNotFound(true);
      return;
    }
    try {
      setChecking(true);
      const isValid = await verifyGoogleMimeCode(searchValue);
      if (isValid) {
        setVerified(true);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error(error);
      setNotFound(true);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    void validateCode();
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setSearchValue(suggestion);
    setShowSuggestions(false);
    setTimeout(() => {
      void validateCode();
    }, 100);
  };

  if (notFound) {
    return <NotFoundScreen onRetry={resetState} />;
  }

  if (verified) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <GoogleMimeAppLazy
          enforceAdmin={false}
          publicMode
          initialSearchQuery="Celebridade"
          initialStage="results"
          initialTab="all"
        />
      </Suspense>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)' }}
    >
      <div className="flex items-center justify-center px-4 py-4 mt-2">
        <div className="w-12 h-12 rounded-full bg-[#4285F4]/20 flex items-center justify-center border border-[#4285F4]/30">
          <span className="text-[#4285F4] text-lg">Labs</span>
        </div>
      </div>

      <div className="flex justify-center mt-4 mb-6">
        <GoogleLogoFestive />
      </div>

      <div className="px-4 mb-4">
        <div
          className="relative flex items-center bg-[#303134] rounded-full shadow-lg"
          onClick={() => setIsSearchFocused(true)}
        >
          {isSearchFocused ? (
            <form onSubmit={handleSubmit} className="flex-1 flex items-center">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value.replace(/\D/g, '').slice(0, 3));
                  setShowSuggestions(e.target.value.length > 0);
                }}
                placeholder="Pesquisa"
                className="flex-1 bg-transparent py-4 px-6 text-white placeholder-[#9aa0a6] focus:outline-none text-base"
                autoFocus
                disabled={checking}
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

        {showSuggestions && isSearchFocused && (
          <div className="absolute left-4 right-4 mt-1 bg-[#303134] rounded-2xl shadow-lg z-10 overflow-hidden">
            {SEARCH_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionSelect(suggestion)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#3c4043] text-left border-b border-[#5f6368]/30 last:border-0"
              >
                <Search className="w-4 h-4 text-[#9aa0a6]" />
                <span className="text-white">{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 px-4 mb-6 overflow-x-auto">
        <button className="flex items-center gap-2 bg-[#303134] rounded-full px-5 py-3 whitespace-nowrap">
          <Sparkles className="w-5 h-5 text-[#8ab4f8]" />
          <span className="text-white font-medium">Modo IA</span>
        </button>
        <button className="flex items-center justify-center bg-[#303134] rounded-full w-12 h-12">
          <Music className="w-5 h-5 text-white" />
        </button>
        <button className="flex items-center justify-center bg-[#303134] rounded-full w-12 h-12">
          <span className="text-xl text-white">Ai</span>
        </button>
      </div>

      <div className="flex gap-3 px-4 mb-4 overflow-x-auto">
        <div className="flex-shrink-0 bg-[#303134] rounded-2xl p-4 min-w-[160px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white font-medium text-sm">VDG x FLU</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-xs text-white">VS</span>
              </div>
              <span className="text-[#9aa0a6] text-xs">Hoje<br />20:00</span>
              <div className="w-8 h-8 bg-[#8B0000] rounded-full flex items-center justify-center">
                <span className="text-xs text-white">VS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 bg-[#303134] rounded-2xl p-4 min-w-[140px]">
          <span className="text-white font-medium text-sm">Quiririm</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-white text-2xl font-light">31°</span>
            <span className="text-[#9aa0a6] text-sm">Nuvens 5%</span>
          </div>
        </div>

        <div className="flex-shrink-0 bg-[#303134] rounded-2xl p-4 min-w-[100px]">
          <span className="text-white font-medium text-sm">Paris</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-white text-2xl font-light">6:</span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl mt-2 overflow-hidden">
        {NEWS_ARTICLES.map((article) => (
          <div key={article.title} className="border-b border-[#e8eaed]">
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
            <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />
            <p className="px-4 py-3 text-[#202124] text-lg leading-tight">{article.title}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-around py-3 bg-white border-t border-[#e8eaed]">
        <button className="flex flex-col items-center gap-1">
          <div className="bg-[#e8f0fe] rounded-full px-4 py-1">
            <Home className="w-6 h-6 text-[#1a73e8]" />
          </div>
          <span className="text-xs text-[#1a73e8] font-medium">Inicio</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Search className="w-6 h-6 text-[#5f6368]" />
          <span className="text-xs text-[#5f6368]">Pesquisar</span>
        </button>
        <button className="flex flex-col items-center gap-1 relative">
          <Bell className="w-6 h-6 text-[#5f6368]" />
          <span className="absolute -top-1 right-0 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            9+
          </span>
          <span className="text-xs text-[#5f6368]">Alertas</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Clock className="w-6 h-6 text-[#5f6368]" />
          <span className="text-xs text-[#5f6368]">Atividade</span>
        </button>
      </div>
    </div>
  );
};

export default GoogleMimePublic;
