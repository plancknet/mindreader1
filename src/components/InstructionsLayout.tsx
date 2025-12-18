import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface InstructionsLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  label: string;
  icon: React.ComponentType<LucideProps>;
  backPath: string;
  backLabel?: string;
}

const loginFontFamily = '"Spline Sans", "Noto Sans", sans-serif';

export const InstructionsLayout = ({
  children,
  title,
  subtitle,
  label,
  icon: Icon,
  backPath,
  backLabel = 'Voltar para o jogo',
}: InstructionsLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#0f111a] pb-24 text-white"
      style={{ fontFamily: loginFontFamily }}
    >
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#7f13ec]/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-[#7f13ec]/15 blur-[100px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0f111a]/80 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-3xl items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(backPath)}
              className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:border-[#7f13ec]/40 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex flex-1 items-center justify-center">
              <div className="flex size-10 items-center justify-center rounded-full border border-[#7f13ec]/20 bg-[#7f13ec]/15 text-[#7f13ec] shadow-[0_0_15px_rgba(127,19,236,0.3)]">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 pt-6">
          {/* Title section */}
          <div className="text-center space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#7f13ec]">
              {label}
            </p>
            <h1 className="text-3xl font-bold text-white drop-shadow-[0_0_15px_rgba(127,19,236,0.3)]">
              {title}
            </h1>
            {subtitle && (
              <p className="text-white/60">{subtitle}</p>
            )}
          </div>

          {/* Content */}
          {children}

          {/* Back button */}
          <div className="text-center pt-4 pb-8">
            <Button
              size="lg"
              onClick={() => navigate(backPath)}
              className="border-[#7f13ec]/50 bg-[#7f13ec] text-white shadow-[0_0_20px_rgba(127,19,236,0.4)] hover:bg-[#7f13ec]/90"
            >
              {backLabel}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export const InstructionsCard = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div
    className={`rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e1b4b]/85 to-[#0f111a]/95 p-6 shadow-lg shadow-black/30 ${className}`}
  >
    {children}
  </div>
);

export const InstructionsSection = ({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) => (
  <div className="space-y-4">
    {title && (
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7f13ec]">
        {title}
      </p>
    )}
    {children}
  </div>
);

export const InstructionStep = ({
  number,
  children,
}: {
  number: number;
  children: ReactNode;
}) => (
  <div className="flex gap-3">
    <span className="text-sm font-semibold text-[#7f13ec]">{number}.</span>
    <p className="text-white/90">{children}</p>
  </div>
);

export const InstructionParagraph = ({ children }: { children: ReactNode }) => (
  <p className="text-white/90">{children}</p>
);

export const InstructionNote = ({ children }: { children: ReactNode }) => (
  <p className="text-sm text-white/50">{children}</p>
);
