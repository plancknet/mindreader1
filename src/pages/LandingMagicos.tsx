import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Sparkles, Users, Ticket, DollarSign, ArrowRight, Play, Star, Zap, ChevronDown, MessageCircle, Mail, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const LandingMagicos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
  const handleSubmit = async () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    // Clean and validate WhatsApp
    const cleanWhatsapp = whatsapp.replace(/\D/g, '');
    if (cleanWhatsapp.length < 10 || cleanWhatsapp.length > 13) {
      toast({
        title: "WhatsApp inválido",
        description: "Insira DDD + número (ex: 11999999999)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('register-partner-lead', {
        body: { email, whatsapp }
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Erro no cadastro",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      // Auto login with email and whatsapp as password
      const cleanWhatsappPassword = whatsapp.replace(/\D/g, '');
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: cleanWhatsappPassword,
      });

      // Track Google Ads conversion
      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'conversion', {
          'send_to': 'AW-1052545747/auOdCIPsot0bENOl8vUD'
        });
      }

      if (loginError) {
        console.error('Auto login failed:', loginError);
        toast({
          title: "Cadastro realizado!",
          description: "Sua senha provisória é seu número de WhatsApp. Faça login para continuar.",
        });
        navigate('/auth');
        return;
      }

      toast({
        title: "Cadastro realizado!",
        description: "Agora crie seu cupom personalizado.",
      });

      // Redirect to coupon setup page
      navigate('/influencer/coupon');
    } catch (error: any) {
      console.error('Error submitting lead:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      <Helmet>
        <title>Programa de Parceiros para Mágicos — MindReader</title>
        <meta name="description" content="Ganhe comissões indicando o MindReader: cupom personalizado, pagamento por PIX e material pronto para divulgar. Cadastro gratuito para mágicos parceiros." />
        <link rel="canonical" href="https://mindreader.site/magicos" />
        <meta property="og:title" content="Programa de Parceiros para Mágicos — MindReader" />
        <meta property="og:description" content="Gere comissões indicando o MindReader com seu cupom personalizado. Cadastro gratuito." />
        <meta property="og:url" content="https://mindreader.site/magicos" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map((f) => ({
            "@type": "Question",
            "name": f.question,
            "acceptedAnswer": { "@type": "Answer", "text": f.answer },
          })),
        })}</script>
      </Helmet>
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-pink-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12 bg-[#0a0a12]/80 backdrop-blur-lg border-b border-purple-500/10">
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

      {/* Spacer for fixed nav */}
      <div className="h-20" />

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
                  src="https://www.youtube.com/embed/6Zp8g1jF_5A"
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

            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Quando as luzes se apagam, a magia vai embora com o público. Junto com ela, as oportunidades de criar um vínculo duradouro e continuar a conversa. Você encanta, eles aplaudem... e depois? O contato se perde.
            </p>
            <Button
              onClick={handlePartnerClick}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25"
            >
              Quero ser parceiro MindReader
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
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

          <div className="mt-12 text-center">
            <Button
              onClick={handlePartnerClick}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25"
            >
              Quero ser parceiro MindReader
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
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

          <div className="mt-12 text-center">
            <Button
              onClick={handlePartnerClick}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25"
            >
              Quero ser parceiro MindReader
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
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

          <div className="mt-12 text-center">
            <Button
              onClick={handlePartnerClick}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25"
            >
              Quero ser parceiro MindReader
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
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
            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              MindReader é perfeito para iniciantes. Ele ensina, diverte e inspira novos apaixonados pela ilusão. Para eles, você será o mestre que abriu a porta para esse universo mágico.
            </p>
            <Button
              onClick={handlePartnerClick}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25"
            >
              Quero ser parceiro MindReader
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
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
          <div className="mt-10">
            <Button
              onClick={handlePartnerClick}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25"
            >
              Quero ser parceiro MindReader
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
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
                onClick={handleSubmit}
                disabled={isLoading}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white text-lg py-6 shadow-xl shadow-purple-500/30 h-auto whitespace-normal text-center disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  'Quero meu cupom personalizado'
                )}
              </Button>
            </div>

            <p className="text-center text-gray-500 text-sm mt-6">
              Sua senha provisória será seu número de WhatsApp (somente DDD + número).
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

          <div className="mt-12 text-center">
            <Button
              onClick={handlePartnerClick}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25"
            >
              Quero ser parceiro MindReader
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
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

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/5512992090614?text=Olá! Tenho interesse no programa de parceiros MindReader."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-110 group"
        aria-label="Contato via WhatsApp"
      >
        <svg
          viewBox="0 0 24 24"
          fill="white"
          className="w-7 h-7"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        
        {/* Tooltip */}
        <span className="absolute right-16 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Fale conosco
        </span>
      </a>
    </div>
  );
};

export default LandingMagicos;
