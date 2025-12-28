import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Users, Ticket, DollarSign, ArrowRight, Play, Star, Zap, ChevronDown, MessageCircle, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LandingMagicos = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handlePartnerClick = () => {
    const contactSection = document.getElementById("contact-section");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLearnMore = () => {
    const problemSection = document.getElementById("problem-section");
    if (problemSection) {
      problemSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const benefits = [
    {
      icon: Users,
      title: "Engajamento Contínuo",
      description: "Mantenha a conexão com o público muito além do show.",
    },
    {
      icon: Ticket,
      title: "Cupom Personalizado",
      description: "Fortaleça sua marca pessoal com uma oferta exclusiva.",
    },
    {
      icon: DollarSign,
      title: "Nova Fonte de Renda",
      description: "Monetize o encanto que você já cria.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Peça seu cupom personalizado",
      description: "É rápido e sem custo. Você recebe um cupom com seu nome.",
    },
    {
      number: "02",
      title: "Divulgue nas apresentações",
      description: "Ofereça como um 'bis' digital ou em suas redes sociais.",
    },
    {
      number: "03",
      title: "Receba sua comissão",
      description: "Acompanhe suas vendas e veja sua nova renda crescer.",
    },
  ];

  const faqs = [
    {
      question: "O que é o MindReader?",
      answer: "MindReader é um aplicativo de mentalismo interativo que permite aos usuários experimentarem efeitos de leitura de mente diretamente no celular. É perfeito para surpreender amigos e familiares.",
    },
    {
      question: "Como funciona o programa de parceiros?",
      answer: "Você recebe um cupom personalizado com seu nome. Quando alguém usa seu cupom para adquirir o MindReader, você ganha uma comissão sobre a venda.",
    },
    {
      question: "Preciso pagar algo para participar?",
      answer: "Não! O programa de parceiros é totalmente gratuito. Você só ganha, nunca paga.",
    },
    {
      question: "Como recebo minhas comissões?",
      answer: "As comissões são pagas mensalmente via PIX ou transferência bancária, conforme sua preferência.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white font-sans overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-pink-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 py-6 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              MindReader
            </span>
          </div>
          <Button
            onClick={handlePartnerClick}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 shadow-lg shadow-purple-500/25"
          >
            Seja Parceiro
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[90vh] flex items-center justify-center px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-8">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-purple-300">Programa Exclusivo para Mágicos</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              A mágica não
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              precisa acabar.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-4 max-w-2xl mx-auto">
            Transforme seu aplauso em{" "}
            <span className="text-purple-400 font-semibold">conexão</span> e{" "}
            <span className="text-pink-400 font-semibold">renda</span>.
          </p>

          <p className="text-gray-500 mb-10 max-w-xl mx-auto">
            A parceria que leva sua mágica para o celular do público — e coloca dinheiro no seu bolso.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handlePartnerClick}
              size="lg"
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white text-lg px-8 py-6 shadow-xl shadow-purple-500/30 group"
            >
              Quero ser parceiro MindReader
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={handleLearnMore}
              size="lg"
              variant="outline"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 text-lg px-8 py-6"
            >
              <Play className="mr-2 w-5 h-5" />
              Saiba como funciona
            </Button>
          </div>

          {/* YouTube Video */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 border border-purple-500/30">
              <div className="aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/fcQ8mFwg2eA"
                  title="MindReader - Como funciona"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="mt-12 animate-bounce">
            <ChevronDown className="w-8 h-8 text-purple-400/50 mx-auto" />
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem-section" className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-xl rounded-3xl p-10 md:p-16 border border-gray-700/50 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-red-400 font-medium">O Problema</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              Quando o show termina,{" "}
              <span className="text-red-400">a oportunidade vai embora.</span>
            </h2>

            <p className="text-gray-400 text-lg leading-relaxed">
              Quando as luzes se apagam, a magia vai embora com o público. Junto com ela, as oportunidades de criar um vínculo duradouro e continuar a conversa. Você encanta, eles aplaudem... e depois? O contato se perde.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">A Solução</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Apresentamos o{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MindReader
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-16">
            Um aplicativo de mentalismo interativo que transporta o encanto do palco para o celular do seu público. A mágica continua na palma das mãos deles.
          </p>

          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group">
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="text-xl font-semibold mb-2 text-purple-300">Eles se surpreendem</h3>
              <p className="text-gray-400">Efeitos interativos que parecem impossíveis.</p>
            </div>
            <div className="bg-gradient-to-br from-pink-900/30 to-pink-800/10 backdrop-blur-sm rounded-2xl p-8 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 group">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2 text-pink-300">Eles interagem</h3>
              <p className="text-gray-400">Novos efeitos que mantêm o encanto vivo.</p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group">
              <div className="text-4xl mb-4">💫</div>
              <h3 className="text-xl font-semibold mb-2 text-blue-300">Eles lembram de você</h3>
              <p className="text-gray-400">Sua marca fica na memória do público.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 py-24 px-6 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Com a parceria você{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                ganha
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Benefícios exclusivos para mágicos parceiros</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 hover:transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Como funciona?{" "}
              <span className="text-purple-400">3 passos simples.</span>
            </h2>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="group flex items-start gap-6 bg-gradient-to-r from-gray-900/80 to-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-purple-500/30">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beginners Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/20 backdrop-blur-xl rounded-3xl p-10 md:p-16 border border-purple-500/30 text-center">
            <div className="text-6xl mb-6">🎩</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Seja a referência que{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                abre um novo universo
              </span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
              MindReader é perfeito para iniciantes. Ele ensina, diverte e inspira novos apaixonados pela ilusão. Para eles, você será o mestre que abriu a porta para esse universo mágico.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-3xl md:text-4xl font-light italic text-gray-300 leading-relaxed">
            "Feito por quem ama mágica,
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold not-italic">
              pensado para quem vive de encantamento.
            </span>
            "
          </blockquote>
          <div className="mt-8 flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact-section" className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-900/60 via-pink-900/40 to-purple-900/60 backdrop-blur-xl rounded-3xl p-10 md:p-16 border border-purple-500/30 shadow-2xl shadow-purple-500/20">
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Leve sua mágica para o{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  próximo nível
                </span>
              </h2>
              <p className="text-xl text-gray-400">
                Torne-se um parceiro MindReader hoje mesmo.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 py-6 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 rounded-xl"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="tel"
                  placeholder="Seu WhatsApp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full pl-12 py-6 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 rounded-xl"
                />
              </div>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white text-lg py-6 shadow-xl shadow-purple-500/30 h-auto whitespace-normal text-center"
              >
                Quero meu cupom personalizado
              </Button>
            </div>

            <p className="text-center text-gray-500 text-sm mt-6">
              Entraremos em contato em até 24 horas úteis.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perguntas frequentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl rounded-xl border border-gray-700/50 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-800/30 transition-colors"
                >
                  <span className="font-semibold text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-400 transition-transform ${
                      expandedFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6 text-gray-400">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                MindReader
              </span>
            </div>

            <div className="flex items-center gap-6">
              <a
                href="https://wa.me/5512992090614?text=MindReader%20Parceiros"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>WhatsApp</span>
              </a>
              <a
                href="mailto:contato@mindreaderapp.com"
                className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>E-mail</span>
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} MindReader - Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingMagicos;
