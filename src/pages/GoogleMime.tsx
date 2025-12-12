import { useState, lazy, Suspense } from 'react';
import { verifyGoogleMimeCode } from '@/lib/googleMimeCode';
import { Search, Mic, Camera } from 'lucide-react';

const GoogleMimeAppLazy = lazy(() => import('./GoogleMimeApp'));

const GoogleMimePublic = () => {
  const [searchValue, setSearchValue] = useState('');
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [notFound, setNotFound] = useState(false);

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void validateCode();
  };

  const handleLucky = () => {
    void validateCode();
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] text-[#202124] px-6 text-center">
        <p className="text-6xl font-semibold mb-4">404</p>
        <p className="text-lg mb-6">A pagina que voce tentou acessar nao existe.</p>
        <button
          className="px-6 py-2 rounded-full border border-[#dadce0] text-sm text-[#3c4043] hover:bg-white"
          onClick={() => {
            setNotFound(false);
            setSearchValue('');
          }}
        >
          Voltar para pesquisa
        </button>
      </div>
    );
  }

  if (verified) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-black text-white">
            Carregando jogo...
          </div>
        }
      >
        <GoogleMimeAppLazy enforceAdmin={false} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center gap-3 px-6 py-4 border-b border-[#e8eaed]">
        <div className="w-10 h-10 rounded-full bg-[#4285F4]/20 flex items-center justify-center">
          <span className="text-[#4285F4] text-sm font-semibold">GM</span>
        </div>
        <span className="text-lg text-[#5f6368]">Labs Pesquisa</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 mb-8">
          <div className="text-5xl font-semibold tracking-[0.2em] text-[#1a73e8]">MindReader</div>
          <p className="text-[#5f6368]">Faca uma busca para revelar a celebridade</p>
        </div>

        <form
          id="code-search-form"
          onSubmit={handleSubmit}
          className="w-full max-w-2xl bg-white border border-[#dadce0] rounded-full shadow-lg px-6 py-3 flex items-center gap-3"
        >
          <Search className="w-5 h-5 text-[#9aa0a6]" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value.replace(/\D/g, '').slice(0, 3))}
            placeholder="Pesquise com Labs"
            className="flex-1 bg-transparent text-base text-[#202124] focus:outline-none"
            disabled={checking}
          />
          <Mic className="w-5 h-5 text-[#4285f4]" />
          <Camera className="w-5 h-5 text-[#34a853]" />
        </form>

        <div className="mt-6 flex gap-3">
          <button
            className="px-6 py-2 rounded-full bg-[#f8f9fa] text-sm text-[#3c4043] border border-[#f8f9fa] hover:border-[#dadce0]"
            type="submit"
            form="code-search-form"
            disabled={checking}
          >
            {checking ? 'Verificando...' : 'Pesquisa Labs'}
          </button>
          <button
            className="px-6 py-2 rounded-full bg-[#f8f9fa] text-sm text-[#3c4043] border border-[#f8f9fa] hover:border-[#dadce0]"
            type="button"
            onClick={handleLucky}
            disabled={checking}
          >
            Estou com sorte
          </button>
        </div>
      </main>
    </div>
  );
};

export default GoogleMimePublic;
