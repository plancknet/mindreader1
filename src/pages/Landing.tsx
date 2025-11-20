import React from "react";
import { useNavigate } from "react-router-dom";
import { HeaderControls } from '@/components/HeaderControls';

const MindReaderUltraLanding = () => {
  const navigate = useNavigate();

  const handleAccessClick = () => {
    navigate("/landing-signup");
  };

  return (
    <div className="w-full bg-black text-white font-sans relative">
      <div className="fixed top-4 right-4 z-50">
        <HeaderControls />
      </div>
      {/* TOP BAR */}
      <div className="bg-red-600 text-center py-2 text-sm font-bold tracking-wide">
        ULTIMOS DIAS
      </div>

      {/* HEADER LOGOS */}
      <div className="bg-black py-4 flex flex-col items-center gap-3 border-b border-yellow-500/20">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-400 text-black py-1 px-3 rounded text-xs font-bold">
            INEDITO
          </div>

          <div className="text-3xl font-extrabold tracking-tight">
            MindReader
          </div>

          <div className="text-xs text-yellow-400 font-semibold uppercase border-l border-yellow-400 pl-2">
            vitalicio
          </div>
        </div>
      </div>

      {/* BLOCO PRINCIPAL */}
      <div className="px-5 py-6 text-center">
        {/* Mini-avatars */}
        <div className="flex justify-center gap-4 mb-5">
          {["A", "B", "C", "D"].map((l) => (
            <div
              key={l}
              className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center text-lg font-bold"
            >
              {l}
            </div>
          ))}
        </div>

        <h1 className="text-2xl font-extrabold uppercase leading-tight mb-3">
          Inscricoes abertas para o <br />
          <span className="text-yellow-400">MindReader vitalicio</span>
        </h1>

        <p className="text-yellow-400 font-semibold mb-2">
          MAIS RAPIDO. MAIS DIVERTIDO. PRA SEMPRE.
        </p>

        <p className="text-[15px] leading-relaxed text-white/90 px-2">
          Acesso <span className="text-yellow-400 font-bold">vitalicio</span>{" "}
          ao aplicativo MindReader - jogue quantas vezes quiser, sem pagar
          mensalidade.
        </p>

        <p className="mt-3 text-white/90 px-2">
          E mais de{" "}
          <span className="text-yellow-400 font-bold">R$ 3 mil em bonus</span>{" "}
          incluindo modos especiais, novos desafios e todas as futuras
          atualizacoes.
        </p>

        <p className="mt-3 text-white/90">
          Incluso <span className="font-bold">20 modos</span>, 8 bonus extras e
          todas as novidades futuras.
        </p>
      </div>

      {/* VIDEO DEMO */}
      <div className="px-5 pb-6 text-center">
        <h3 className="font-semibold text-white/90 text-sm mb-3">
          Assista o video para entender o MindReader:
        </h3>

        <div className="w-full max-w-md mx-auto rounded-lg overflow-hidden border border-white/10 shadow-lg">
          <div className="bg-slate-900 h-48 flex items-center justify-center">
            <button className="bg-white/10 p-4 rounded-full border border-white/20">
              play
            </button>
          </div>
        </div>
      </div>

      {/* BOTOES PRINCIPAIS */}
      <div className="px-5 pb-8 flex flex-col gap-3">
        {/* CTA Verde */}
        <button
          onClick={handleAccessClick}
          className="bg-green-500 font-bold py-3 rounded-lg text-lg shadow-md"
        >
          CLIQUE AQUI PARA GARANTIR SEU ACESSO
        </button>

        {/* Botao amarelo */}
        <a
          href="https://wa.me/5512992090614?text=MindReader"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-yellow-400 text-black font-bold py-3 rounded-lg text-lg shadow-md text-center"
        >
          TIRAR DUVIDA COM UM ESPECIALISTA
        </a>
      </div>

      {/* Footer simples */}
      <div className="text-center text-[11px] text-white/40 pb-6">
        (c) {new Date().getFullYear()} MindReader - Todos os direitos reservados.
      </div>
    </div>
  );
};

export default MindReaderUltraLanding;


