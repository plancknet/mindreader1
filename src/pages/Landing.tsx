import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MindReaderUltraLanding = () => {
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    setIsCheckoutLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Você precisa estar logado");
        window.location.href = "/auth";
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

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
            vitalício
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
          <span className="text-yellow-400">MindReader vitalício</span>
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
          onClick={handleCheckout}
          disabled={isCheckoutLoading}
          className="bg-green-500 font-bold py-3 rounded-lg text-lg shadow-md disabled:opacity-70"
        >
          {isCheckoutLoading ? "PROCESSANDO..." : "CLIQUE AQUI PARA GARANTIR SEU ACESSO"}
        </button>

        {/* Botão amarelo */}
        <a
          href="https://wa.me/5512992090614?text=MindReader"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-yellow-400 text-black font-bold py-3 rounded-lg text-lg shadow-md text-center"
        >
          TIRAR DÚVIDA COM UM ESPECIALISTA
        </a>
      </div>

      {/* Footer simples */}
      <div className="text-center text-[11px] text-white/40 pb-6">
        © {new Date().getFullYear()} MindReader — Todos os direitos reservados.
      </div>
    </div>
  );
};

export default MindReaderUltraLanding;
