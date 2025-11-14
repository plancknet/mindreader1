import React from "react";

const MindReaderUltraLanding = () => {
  const checkoutUrl = "https://seu-checkout-stripe-aqui.com";

  return (
    <div className="w-full bg-black text-white font-sans">
      {/* TOP BAR */}
      <div className="bg-red-600 text-center py-2 text-sm font-bold tracking-wide">
        ÚLTIMOS DIAS
      </div>

      {/* HEADER LOGOS */}
      <div className="bg-black py-4 flex flex-col items-center gap-3 border-b border-yellow-500/20">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-400 text-black py-1 px-3 rounded text-xs font-bold">
            INÉDITO
          </div>

          <div className="text-3xl font-extrabold tracking-tight">
            MindReader
          </div>

          <div className="text-xs text-yellow-400 font-semibold uppercase border-l border-yellow-400 pl-2">
            Lifetime Deal
          </div>
        </div>
      </div>

      {/* BLOCO PRINCIPAL */}
      <div className="px-5 py-6 text-center">
        {/* Mini-avatars (simulando os 4 especialistas do exemplo) */}
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
          Inscrições abertas para o <br />
          <span className="text-yellow-400">MindReader Lifetime Deal</span>
        </h1>

        <p className="text-yellow-400 font-semibold mb-2">
          MAIS RÁPIDO. MAIS DIVERTIDO. PRA SEMPRE.
        </p>

        <p className="text-[15px] leading-relaxed text-white/90 px-2">
          Acesso <span className="text-yellow-400 font-bold">vitalício</span>{" "}
          ao aplicativo MindReader — jogue quantas vezes quiser, sem pagar
          mensalidade.
        </p>

        <p className="mt-3 text-white/90 px-2">
          E mais de{" "}
          <span className="text-yellow-400 font-bold">R$ 3 mil em bônus</span>{" "}
          incluindo modos especiais, novos desafios e todas as futuras
          atualizações.
        </p>

        <p className="mt-3 text-white/90">
          Incluso <span className="font-bold">20 modos</span>, 8 bônus extras e
          todas as novidades futuras.
        </p>

        {/* Botão suporte */}
        <button className="mt-5 bg-yellow-400 text-black font-bold rounded-full px-6 py-2 flex items-center gap-2 mx-auto">
          <span>💬</span> FALE COM O SUPORTE!
        </button>
      </div>

      {/* VÍDEO DEMO */}
      <div className="px-5 pb-6 text-center">
        <h3 className="font-semibold text-white/90 text-sm mb-3">
          Assista o vídeo para entender a oferta:
        </h3>

        <div className="w-full max-w-md mx-auto rounded-lg overflow-hidden border border-white/10 shadow-lg">
          <div className="bg-slate-900 h-48 flex items-center justify-center">
            <button className="bg-white/10 p-4 rounded-full border border-white/20">
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* BOTÕES PRINCIPAIS */}
      <div className="px-5 pb-8 flex flex-col gap-3">
        {/* CTA Verde */}
        <button
          onClick={() => window.open(checkoutUrl, "_blank")}
          className="bg-green-500 font-bold py-3 rounded-lg text-lg shadow-md"
        >
          CLIQUE PARA GARANTIR SUA VAGA
        </button>

        {/* Botão amarelo */}
        <button className="bg-yellow-400 text-black font-bold py-3 rounded-lg text-lg shadow-md">
          TIRAR DÚVIDAS COM UM ESPECIALISTA
        </button>

        {/* Botão preto com borda */}
        <button className="border border-yellow-400 py-3 rounded-lg text-lg font-bold text-yellow-400">
          QUERO RECEBER UMA LIGAÇÃO
        </button>
      </div>

      {/* PARCEIROS */}
      <div className="px-5 pb-10">
        <p className="text-center text-xs text-white/60 mb-3">
          PARCEIROS OFICIAIS
        </p>

        <div className="flex justify-center gap-5 opacity-80">
          {["hotmart", "manychat", "canva", "rd"].map((p) => (
            <div
              key={p}
              className="h-6 w-16 bg-slate-800 rounded flex items-center justify-center text-[10px]"
            >
              {p.toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Footer simples */}
      <div className="text-center text-[11px] text-white/40 pb-6">
        © {new Date().getFullYear()} MindReader — Todos os direitos reservados.
      </div>
    </div>
  );
};

export default MindReaderUltraLanding;
