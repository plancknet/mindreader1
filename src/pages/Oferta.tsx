import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Brain, Star, Quote, Zap, ArrowDown, Languages } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { startOfferCheckout, priceLabel, type OfferItem } from '@/lib/checkout';
import expertPhoto from '@/assets/expert-mentalist.jpg';
import { getOfferCopy } from './oferta/copy';
import { PricingCard } from './oferta/PricingCard';
import { MindQuiz } from './oferta/MindQuiz';

const fontFamily = '"Spline Sans", "Noto Sans", sans-serif';

const fireConversion = () => {
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  w.gtag?.('event', 'conversion', { send_to: 'AW-1052545747/auOdCIPsot0bENOl8vUD' });
};

const Section = ({ id, children, className = '' }: { id?: string; children: React.ReactNode; className?: string }) => (
  <section id={id} className={`mx-auto w-full max-w-2xl scroll-mt-20 px-5 py-16 sm:py-20 ${className}`}>
    {children}
  </section>
);

const Kicker = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-magic">{children}</p>
);

const Oferta = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useTranslation();
  const { setLanguage } = useLanguageContext();
  const copy = getOfferCopy(language);
  const [loading, setLoading] = useState(false);
  const quizRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title =
      language.startsWith('pt')
        ? 'MindReader — Mágicas de leitura mental no seu celular'
        : 'MindReader — Mind-reading tricks on your phone';
  }, [language]);

  useEffect(() => {
    if (location.hash === '#preco') {
      setTimeout(() => priceRef.current?.scrollIntoView({ behavior: 'smooth' }), 150);
    } else if (location.hash === '#quiz') {
      setTimeout(() => quizRef.current?.scrollIntoView({ behavior: 'smooth' }), 150);
    }
  }, [location.hash]);

  const scrollToQuiz = () => quizRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToPrice = () => priceRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleBuy = async (items: OfferItem[]) => {
    fireConversion();
    setLoading(true);
    try {
      const result = await startOfferCheckout(items, language);
      if (result === 'needs_auth') {
        toast.info(copy.pricing.signInNotice);
        navigate('/auth');
      } else if (result === 'already_owned') {
        navigate('/game-selector');
      }
    } catch (error) {
      console.error('Checkout error', error);
      toast.error(copy.premium.errorCheckout);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => setLanguage(language.startsWith('pt') ? 'en' : 'pt-BR');

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground" style={{ fontFamily }}>
      {/* Decorative blurs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-magic/20 blur-[140px]" />
        <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-primary/15 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-5">
          <div className="flex items-center gap-2 font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-magic text-magic-foreground">
              <Brain className="h-5 w-5" />
            </span>
            MindReader
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={toggleLanguage} aria-label="Language" className="gap-1 text-xs font-semibold">
              <Languages className="h-4 w-4" />
              {language.startsWith('pt') ? 'EN' : 'PT'}
            </Button>
            <ThemeToggle />
            <Button size="sm" onClick={scrollToPrice} className="ml-1 rounded-full bg-gradient-magic font-semibold text-magic-foreground hover:opacity-95">
              {copy.nav.buy}
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <Section className="pt-14 text-center sm:pt-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-magic/30 bg-magic/10 px-4 py-1.5 text-xs font-semibold text-magic">
            <Zap className="h-3.5 w-3.5" /> {copy.hero.badge}
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            {copy.hero.title}{' '}
            <span className="bg-gradient-magic bg-clip-text text-transparent">{copy.hero.highlight}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">{copy.hero.subtitle}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              onClick={scrollToQuiz}
              className="h-14 rounded-2xl bg-gradient-magic px-8 text-base font-bold text-magic-foreground shadow-magic hover:opacity-95"
            >
              <Brain className="mr-2 h-5 w-5" /> {copy.hero.ctaQuiz}
            </Button>
            <Button size="lg" variant="outline" onClick={scrollToPrice} className="h-14 rounded-2xl px-8 text-base font-semibold">
              {copy.hero.ctaPrice} · {priceLabel('MAIN', language)}
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="flex text-warning">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </span>
            {copy.hero.proof}
          </div>
        </Section>

        {/* What it does */}
        <Section>
          <Kicker>{copy.what.kicker}</Kicker>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{copy.what.title}</h2>
          <ol className="mt-10 space-y-6">
            {copy.what.steps.map((step, i) => (
              <li key={step.title} className="flex gap-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-magic/15 text-lg font-bold text-magic">
                  {i + 1}
                </span>
                <div>
                  <p className="text-lg font-semibold">{step.title}</p>
                  <p className="text-muted-foreground">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-12 text-sm font-semibold text-muted-foreground">{copy.what.tricksTitle}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {copy.what.tricks.map((trick) => (
              <span key={trick} className="rounded-full border border-border bg-card px-3 py-1.5 text-sm">
                {trick}
              </span>
            ))}
          </div>
        </Section>

        {/* Pain / urgency */}
        <div className="border-y border-border/60 bg-card/60">
          <Section>
            <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{copy.pain.title}</h2>
            {copy.pain.paragraphs.map((p) => (
              <p key={p} className="mt-5 text-lg text-muted-foreground">
                {p}
              </p>
            ))}
            <p className="mt-8 text-xl font-bold text-magic">{copy.pain.punch}</p>
          </Section>
        </div>

        {/* Quiz */}
        <div ref={quizRef} id="quiz" className="scroll-mt-16">
          <Section className="text-center">
            <Kicker>{copy.quiz.kicker}</Kicker>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{copy.quiz.title}</h2>
            <div className="mt-10 text-left">
              <MindQuiz copy={copy} onSeePrice={scrollToPrice} />
            </div>
          </Section>
        </div>

        {/* Expert */}
        <Section>
          <Kicker>{copy.expert.kicker}</Kicker>
          <div className="mt-6 grid items-center gap-8 sm:grid-cols-[minmax(0,240px)_1fr]">
            <img
              src={expertPhoto}
              alt={copy.expert.name}
              width={896}
              height={1088}
              loading="lazy"
              className="aspect-[4/5] w-full max-w-[260px] rounded-3xl object-cover shadow-magic"
            />
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{copy.expert.name}</h2>
              <p className="mt-1 text-sm font-medium text-magic">{copy.expert.role}</p>
              {copy.expert.bio.map((p) => (
                <p key={p} className="mt-4 text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
          </div>
          <blockquote className="mt-10 rounded-3xl border border-magic/20 bg-magic/5 p-6 text-xl font-semibold italic leading-relaxed">
            {copy.expert.quote}
          </blockquote>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {copy.expert.stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Testimonials */}
        <div className="border-y border-border/60 bg-card/60">
          <Section>
            <Kicker>{copy.testimonials.kicker}</Kicker>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{copy.testimonials.title}</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {copy.testimonials.items.map((item) => (
                <figure key={item.name} className="rounded-3xl border border-border bg-background p-6">
                  <Quote className="h-6 w-6 text-magic/60" />
                  <blockquote className="mt-3 text-foreground">{item.text}</blockquote>
                  <figcaption className="mt-4 flex items-center justify-between text-sm">
                    <span>
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-muted-foreground"> · {item.place}</span>
                    </span>
                    <span className="flex text-warning">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Section>
        </div>

        {/* Pricing */}
        <div ref={priceRef} id="preco" className="scroll-mt-16">
          <Section className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{copy.pricing.title}</h2>
            <div className="mt-10 text-left">
              <PricingCard copy={copy} language={language} loading={loading} onBuy={handleBuy} />
            </div>
          </Section>
        </div>

        {/* FAQ */}
        <Section>
          <Kicker>{copy.faq.kicker}</Kicker>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{copy.faq.title}</h2>
          <Accordion type="single" collapsible className="mt-8">
            {copy.faq.items.map((item, i) => (
              <AccordionItem key={item.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>

        {/* Final CTA */}
        <Section className="pb-28 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">{copy.final.title}</h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">{copy.final.text}</p>
          <Button
            size="lg"
            onClick={scrollToPrice}
            className="mt-8 h-14 rounded-2xl bg-gradient-magic px-8 text-base font-bold text-magic-foreground shadow-magic hover:opacity-95"
          >
            {copy.final.cta} <ArrowDown className="ml-2 h-5 w-5" />
          </Button>
          <p className="mt-16 text-xs text-muted-foreground">{copy.footer}</p>
        </Section>
      </main>
    </div>
  );
};

export default Oferta;
