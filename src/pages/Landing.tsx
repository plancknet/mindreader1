import React from "react";

const MindReaderLanding: React.FC = () => {
  const year = new Date().getFullYear();

  // 🔗 Edite este link para o seu checkout Stripe
  const checkoutUrl = "https://seu-link-de-checkout-stripe-aqui.com";

  const scrollToLTD = () => {
    const el = document.getElementById("ltd-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-black text-slate-50">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 to-violet-600 text-lg font-extrabold text-slate-100 shadow-xl">
              M
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-100">
                MindReader
              </span>
              <span className="text-[11px] text-slate-400">
                Leitura de mentes em modo diversão
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-600/60 bg-slate-900/80 px-3 py-1 text-[11px] text-slate-300">
              <span>🎁</span>
              <span>
                <span className="font-semibold text-violet-300">
                  LTD exclusivo
                </span>{" "}
                para primeiros usuários
              </span>
            </div>
            <button
              type="button"
              onClick={scrollToLTD}
              className="rounded-full border border-slate-600/80 bg-slate-900/80 px-4 py-1.5 text-xs text-slate-100 transition hover:border-violet-400 hover:text-violet-100"
            >
              Ver oferta
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="mb-12 grid gap-8 md:grid-cols-[1.5fr_minmax(0,1fr)]">
          {/* Texto principal */}
          <div className="rounded-3xl border border-slate-700/80 bg-gradient-to-br from-slate-950/90 via-slate-900/95 to-slate-950/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.9)]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-600/80 bg-slate-950/90 px-2 py-1 text-[11px] text-slate-300">
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-200">
                Novo
              </span>
              <span>MindReader em versão especial para early adopters</span>
            </div>

            <h1 className="mb-2 text-3xl font-semibold leading-tight md:text-[2.3rem]">
              Brinque de{" "}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
                ler mentes
              </span>{" "}
              com seus amigos – sem pagar mensalidade.
            </h1>

            <p className="mb-4 text-sm text-slate-400 md:text-[15px]">
              O MindReader é um app interativo que usa inteligência artificial e
              técnicas de ilusionismo para “adivinhar” o que seu amigo está
              pensando. Perfeito para usar em chamadas de vídeo, festas,
              encontros de família ou lives.
            </p>

            {/* Oferta LTD */}
            <div
              id="ltd-section"
              className="mb-5 grid gap-3 rounded-2xl border border-indigo-400/60 bg-gradient-to-br from-violet-500/10 via-sky-900/40 to-slate-950/80 px-4 py-3 text-xs md:grid-cols-[1.4fr_minmax(0,1fr)]"
            >
              <div className="space-y-1">
                <p className="text-[13px] font-semibold text-slate-100">
                  Oferta Lifetime Deal (LTD) – Acesso Vitalício
                </p>
                <p className="text-slate-300">
                  Pague uma única vez e tenha acesso ao MindReader para sempre,
                  incluindo futuras melhorias e novos modos de jogo. Sem
                  assinatura, sem surpresa na fatura.
                </p>
              </div>
              <div className="text-left text-[11px] text-amber-100 md:text-right">
                Somente para os{" "}
                <span className="font-semibold text-amber-300">
                  primeiros 100 usuários
                </span>{" "}
                que aderirem à oferta. Depois, o acesso passa a ser por
                assinatura.
              </div>
            </div>

            {/* CTA */}
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => window.open(checkoutUrl, "_blank")}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_14px_35px_rgba(56,189,248,0.45)] transition hover:brightness-110 hover:translate-y-[1px]"
              >
                <span className="text-lg">✨</span>
                <span>Garantir meu acesso vitalício</span>
              </button>

              <span className="text-[11px] text-slate-400">
                🔒 Pagamento 100% seguro. Sem renovação automática.
              </span>
            </div>

            {/* Metadados */}
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1">
                ⚡ <span>Comece em menos de</span>{" "}
                <span className="font-semibold text-violet-300">1 minuto</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1">
                👥 Ideal para impressionar amigos, família e público
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1">
                📱 Funciona no celular e no computador
              </span>
            </div>
          </div>

          {/* Visual do "app" */}
          <div className="relative flex items-center justify-center">
            <div className="relative h-[360px] w-[210px] max-w-[260px] rounded-[32px] border border-slate-600/80 bg-gradient-to-tr from-slate-900 via-slate-950 to-black p-2 shadow-[0_22px_60px_rgba(0,0,0,0.85)] md:h-[400px] md:w-[230px]">
              <div className="flex h-full w-full flex-col gap-2 rounded-[24px] bg-gradient-to-b from-slate-900 via-slate-950 to-black p-3">
                {/* Status bar */}
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>MindReader • Online</span>
                  <span>🔊 🎤</span>
                </div>

                {/* Chat bubbles */}
                <div className="flex flex-1 flex-col gap-2 text-[11px] text-slate-100">
                  <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm border border-slate-600/80 bg-slate-950/90 px-3 py-1.5 text-slate-100">
                    Tenho um amigo aqui duvidando que você lê mentes 👀
                  </div>
                  <div className="mr-auto max-w-[90%] rounded-2xl rounded-bl-sm bg-gradient-to-tr from-violet-500/70 to-sky-400/70 px-3 py-1.5 text-slate-50">
                    Perfeito! Peça para ele pensar em um{" "}
                    <span className="font-semibold">animal, fruta ou país</span>{" "}
                    e não dizer em voz alta.
                  </div>
                  <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm border border-slate-600/80 bg-slate-950/90 px-3 py-1.5 text-slate-100">
                    Ele já escolheu e eu não contei pra você 😈
                  </div>
                  <div className="mr-auto max-w-[90%] rounded-2xl rounded-bl-sm bg-gradient-to-tr from-violet-500/70 to-sky-400/70 px-3 py-1.5 text-slate-50">
                    Eu sei. E mesmo assim… já tenho uma boa ideia do que ele
                    pensou. Quer que eu revele agora? 🔮
                  </div>
                </div>

                {/* Input */}
                <div className="flex items-center justify-between rounded-full border border-slate-600/80 bg-slate-950/90 px-3 py-1.5 text-[11px] text-slate-500">
                  <span>Escreva aqui o que seu amigo respondeu...</span>
                  <span className="text-sm text-slate-300">➤</span>
                </div>
              </div>

              {/* Tag LTD */}
              <div className="absolute -right-3 top-10 rounded-full bg-violet-400 px-3 py-1 text-[10px] font-semibold text-slate-950 shadow-[0_14px_40px_rgba(129,140,248,0.8)]">
                🔐 LTD Ativado
              </div>
            </div>
          </div>
        </section>

        <main className="space-y-8">
          {/* Como funciona */}
          <section className="rounded-3xl border border-slate-800 bg-slate-950/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
            <h2 className="mb-2 text-lg font-semibold">
              Como o MindReader funciona na prática
            </h2>
            <p className="mb-4 text-sm text-slate-400">
              Em vez de ser “só mais um app”, o MindReader é uma experiência
              guiada. Ele conduz a conversa com você e com o seu amigo, fazendo
              perguntas estratégicas que parecem simples, mas carregam um toque
              de ilusionismo digital.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-sm">
                <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-[11px] font-semibold text-violet-300">
                  1
                </div>
                <h3 className="mb-1 text-sm font-semibold">
                  Escolha sua “vítima” 😈
                </h3>
                <p className="text-slate-400">
                  Chame um amigo, alguém da família ou até seu público na live.
                  Peça para a pessoa pensar em um animal, fruta ou país.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-sm">
                <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-[11px] font-semibold text-violet-300">
                  2
                </div>
                <h3 className="mb-1 text-sm font-semibold">
                  Deixe o app conduzir
                </h3>
                <p className="text-slate-400">
                  O MindReader faz perguntas leves e descontraídas. Por baixo
                  dos panos, a IA combina lógica, padrões e ilusões para
                  afunilar as respostas possíveis.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-sm">
                <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-[11px] font-semibold text-violet-300">
                  3
                </div>
                <h3 className="mb-1 text-sm font-semibold">Momento “UAU” 🤯</h3>
                <p className="text-slate-400">
                  No final, o app revela exatamente o que o seu amigo estava
                  pensando. Resultado: risadas, surpresa e aquele clima de “como
                  isso é possível?”.
                </p>
              </div>
            </div>
          </section>

          {/* O que está incluído */}
          <section className="rounded-3xl border border-slate-800 bg-slate-950/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
            <h2 className="mb-2 text-lg font-semibold">
              O que está incluído no seu Lifetime Deal
            </h2>
            <p className="mb-4 text-sm text-slate-400">
              Como early adopter, você entra para um grupo seleto que terá
              vantagens que não serão oferecidas quando o MindReader migrar para
              o modelo de assinatura.
            </p>

            <div className="grid gap-3 text-sm md:grid-cols-3">
              <div className="rounded-2xl border border-violet-400/70 bg-gradient-to-br from-violet-500/20 via-slate-950 to-slate-950 p-4">
                <strong className="block text-slate-100">
                  ✅ Acesso vitalício ao MindReader
                </strong>
                <span className="text-slate-300">
                  Um pagamento único. Use o app hoje, daqui a 1 ano ou daqui a 5
                  anos, sem preocupações com renovação.
                </span>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/95 p-4">
                <strong className="block text-slate-100">
                  🚀 Atualizações futuras inclusas
                </strong>
                <span className="text-slate-300">
                  Novos modos de jogo, categorias, melhorias na experiência e na
                  IA já estarão automaticamente no seu plano.
                </span>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/95 p-4">
                <strong className="block text-slate-100">
                  💬 Suporte direto
                </strong>
                <span className="text-slate-300">
                  Acesso prioritário ao suporte e influência nas decisões de roadmap do produto.
                </span>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-12 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
            <p>© {year} MindReader. Todos os direitos reservados.</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default MindReaderLanding;
