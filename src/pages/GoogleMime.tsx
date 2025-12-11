import { useState, useCallback, useEffect } from 'react';
import { useGameUsageTracker } from '@/hooks/useGameUsageTracker';
import { GAME_IDS } from '@/constants/games';

// Celebrity images - using placeholder celebrities
const CELEBRITY_IMAGES = [
  { id: 1, name: 'Taylor Swift', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
  { id: 2, name: 'Brad Pitt', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { id: 3, name: 'Beyoncé', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop' },
  { id: 4, name: 'Leonardo DiCaprio', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
  { id: 5, name: 'Rihanna', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop' },
  { id: 6, name: 'Tom Hanks', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop' },
  { id: 7, name: 'Selena Gomez', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop' },
  { id: 8, name: 'Chris Evans', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop' },
];

const FAKE_LINKS = [
  { title: 'Wikipedia - Lista de celebridades famosas', url: 'wikipedia.org' },
  { title: 'IMDb - Top 100 atores mais populares', url: 'imdb.com' },
  { title: 'Forbes - Celebridades mais bem pagas de 2024', url: 'forbes.com' },
  { title: 'People Magazine - Notícias de celebridades', url: 'people.com' },
  { title: 'E! Online - Fofocas e novidades', url: 'eonline.com' },
  { title: 'TMZ - Últimas notícias de Hollywood', url: 'tmz.com' },
];

type Stage = 'search' | 'results' | 'scrolled' | 'reveal';

export default function GoogleMime() {
  const [stage, setStage] = useState<Stage>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<typeof CELEBRITY_IMAGES[0] | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const { trackUsage } = useGameUsageTracker(GAME_IDS.GOOGLE_MIME);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.toLowerCase().includes('celebridade') || searchQuery.toLowerCase().includes('celebrity')) {
      setStage('results');
      setShowSearchSuggestions(false);
    }
  };

  // Handle double click on image to secretly select it
  const handleImageDoubleClick = useCallback((celebrity: typeof CELEBRITY_IMAGES[0]) => {
    setSelectedImage(celebrity);
    // Small visual feedback without revealing the selection
  }, []);

  // Handle scroll detection
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (stage === 'results' && selectedImage && !hasScrolled) {
      const target = e.currentTarget;
      if (target.scrollTop > 100) {
        setHasScrolled(true);
        setStage('scrolled');
      }
    }
  }, [stage, selectedImage, hasScrolled]);

  // Handle link click - reveal the selected image
  const handleLinkClick = () => {
    if (selectedImage && hasScrolled) {
      trackUsage();
      setStage('reveal');
    }
  };

  // Reset game
  const handleReset = () => {
    setStage('search');
    setSearchQuery('');
    setSelectedImage(null);
    setHasScrolled(false);
    setShowSearchSuggestions(false);
  };

  // Auto-suggest for search
  useEffect(() => {
    if (searchQuery.length > 0 && stage === 'search') {
      setShowSearchSuggestions(true);
    } else {
      setShowSearchSuggestions(false);
    }
  }, [searchQuery, stage]);

  // Google-style header component
  const GoogleHeader = () => (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#202124]">
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 272 92" className="h-7 w-auto">
          <path fill="#4285F4" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
          <path fill="#EA4335" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
          <path fill="#FBBC05" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/>
          <path fill="#4285F4" d="M225 3v65h-9.5V3h9.5z"/>
          <path fill="#34A853" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/>
          <path fill="#EA4335" d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"/>
        </svg>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
          U
        </div>
      </div>
    </div>
  );

  // Search stage - Google home screen
  if (stage === 'search') {
    return (
      <div className="min-h-screen bg-white dark:bg-[#202124] flex flex-col">
        <GoogleHeader />
        <div className="flex-1 flex flex-col items-center justify-start pt-16 px-4">
          {/* Google Logo */}
          <svg viewBox="0 0 272 92" className="h-12 w-auto mb-8">
            <path fill="#4285F4" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
            <path fill="#EA4335" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
            <path fill="#FBBC05" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/>
            <path fill="#4285F4" d="M225 3v65h-9.5V3h9.5z"/>
            <path fill="#34A853" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/>
            <path fill="#EA4335" d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"/>
          </svg>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full max-w-xl relative">
            <div className="relative flex items-center bg-white dark:bg-[#303134] rounded-full border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
              <svg className="w-5 h-5 ml-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar no Google"
                className="flex-1 bg-transparent py-3 px-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
                autoFocus
              />
              <button type="button" className="p-2 mr-2">
                <svg className="w-6 h-6 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>
            </div>
            
            {/* Search Suggestions */}
            {showSearchSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#303134] rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg z-10">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('Celebridade');
                    setStage('results');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-gray-900 dark:text-white">Celebridade</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('Celebridades famosas');
                    setStage('results');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-gray-900 dark:text-white">Celebridades famosas</span>
                </button>
              </div>
            )}
          </form>
          
          {/* Search Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              onClick={handleSearch}
              className="px-4 py-2 bg-gray-100 dark:bg-[#303134] text-gray-700 dark:text-gray-300 text-sm rounded hover:border-gray-300 dark:hover:border-gray-500 border border-transparent"
            >
              Pesquisa Google
            </button>
            <button className="px-4 py-2 bg-gray-100 dark:bg-[#303134] text-gray-700 dark:text-gray-300 text-sm rounded hover:border-gray-300 dark:hover:border-gray-500 border border-transparent">
              Estou com sorte
            </button>
          </div>
        </div>
        
        {/* Bottom Navigation */}
        <div className="flex justify-around py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#202124]">
          <button className="flex flex-col items-center gap-1 text-blue-500">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
            <span className="text-xs">Descubra</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs">Pesquisa</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span className="text-xs">Coleções</span>
          </button>
        </div>
      </div>
    );
  }

  // Results stage - Search results with celebrity images
  if (stage === 'results' || stage === 'scrolled') {
    return (
      <div className="min-h-screen bg-white dark:bg-[#202124] flex flex-col">
        {/* Search Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-[#202124] border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 px-4 py-2">
            <button onClick={handleReset} className="p-2">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex-1 flex items-center bg-gray-100 dark:bg-[#303134] rounded-full px-4 py-2">
              <span className="text-gray-900 dark:text-white">{searchQuery || 'Celebridade'}</span>
            </div>
            <button className="p-2">
              <svg className="w-6 h-6 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-6 px-4 text-sm">
            <button className="py-3 border-b-2 border-blue-500 text-blue-500 font-medium">Todos</button>
            <button className="py-3 text-gray-600 dark:text-gray-400">Imagens</button>
            <button className="py-3 text-gray-600 dark:text-gray-400">Notícias</button>
            <button className="py-3 text-gray-600 dark:text-gray-400">Vídeos</button>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-4"
          onScroll={handleScroll}
        >
          {/* Results count */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Cerca de 1.234.567.890 resultados (0,42 segundos)
          </p>
          
          {/* Image Grid - Celebrity selection area */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Imagens de celebridades</h2>
            <p className="text-xs text-gray-500 mb-2">(Toque duas vezes para selecionar)</p>
            <div className="grid grid-cols-4 gap-2">
              {CELEBRITY_IMAGES.map((celebrity) => (
                <div
                  key={celebrity.id}
                  className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedImage?.id === celebrity.id 
                      ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-[#202124]' 
                      : 'hover:opacity-80'
                  }`}
                  onDoubleClick={() => handleImageDoubleClick(celebrity)}
                >
                  <img
                    src={celebrity.image}
                    alt={celebrity.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Fake Search Results - Links */}
          <div className="space-y-6">
            {FAKE_LINKS.map((link, index) => (
              <div 
                key={index}
                className={`cursor-pointer ${stage === 'scrolled' ? 'hover:bg-gray-50 dark:hover:bg-gray-800 -mx-2 px-2 py-2 rounded' : 'opacity-50'}`}
                onClick={stage === 'scrolled' ? handleLinkClick : undefined}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-xs text-gray-600 dark:text-gray-300">{link.url[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{link.url}</span>
                  </div>
                </div>
                <h3 className="text-lg text-blue-600 dark:text-blue-400 hover:underline mb-1">
                  {link.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Confira as últimas novidades sobre celebridades e personalidades famosas do mundo do entretenimento...
                </p>
              </div>
            ))}
            
            {/* More fake content to enable scrolling */}
            <div className="py-8">
              <h3 className="text-lg text-blue-600 dark:text-blue-400 mb-1">
                Biografias de Celebridades - Conheça a história
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Descubra a trajetória de vida das maiores celebridades do mundo...
              </p>
            </div>
            <div className="py-8">
              <h3 className="text-lg text-blue-600 dark:text-blue-400 mb-1">
                Fotos Exclusivas - Galeria de Celebridades
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Veja fotos exclusivas e momentos especiais das estrelas...
              </p>
            </div>
            <div className="py-8">
              <h3 className="text-lg text-blue-600 dark:text-blue-400 mb-1">
                Entrevistas com Celebridades - Bastidores
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Assista entrevistas exclusivas e conheça o lado pessoal...
              </p>
            </div>
          </div>
        </div>
        
        {/* Instruction hint */}
        {!selectedImage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm">
            Toque duas vezes em uma celebridade
          </div>
        )}
        {selectedImage && !hasScrolled && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm">
            Role a página para baixo
          </div>
        )}
        {hasScrolled && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm">
            Clique em qualquer link
          </div>
        )}
      </div>
    );
  }

  // Reveal stage - Show the selected celebrity
  if (stage === 'reveal' && selectedImage) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="animate-in fade-in zoom-in duration-500 text-center">
          <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl mb-6 mx-auto ring-4 ring-white/20">
            <img
              src={selectedImage.image}
              alt={selectedImage.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {selectedImage.name}
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            A celebridade que você escolheu
          </p>
        </div>
        
        <button
          onClick={handleReset}
          className="mt-8 px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors"
        >
          Jogar Novamente
        </button>
      </div>
    );
  }

  return null;
}
