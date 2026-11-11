import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Sparkles, RotateCcw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { OfferCopy } from './copy';

type Stage = 'intro' | 'questions' | 'taste' | 'reveal' | 'result';

interface MindQuizProps {
  copy: OfferCopy;
  onSeePrice: () => void;
}

export const MindQuiz = ({ copy, onSeePrice }: MindQuizProps) => {
  const q = copy.quiz;
  const [stage, setStage] = useState<Stage>('intro');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [tasteIndex, setTasteIndex] = useState(0);
  const [hit, setHit] = useState<boolean | null>(null);

  // Gamified "mind power" meter: grows with each step
  const totalSteps = q.questions.length + q.tasteSteps.length + 1;
  const doneSteps =
    stage === 'intro'
      ? 0
      : stage === 'questions'
        ? questionIndex
        : stage === 'taste'
          ? q.questions.length + tasteIndex
          : totalSteps;
  const power = Math.min(97, Math.round(18 + (doneSteps / totalSteps) * 79));

  const profile = useMemo(() => {
    const experience = answers[1] ?? 0;
    if (experience >= 2) return q.profiles[2];
    if (experience === 1) return q.profiles[1];
    return q.profiles[0];
  }, [answers, q.profiles]);

  const answer = (optionIndex: number) => {
    const next = [...answers];
    next[questionIndex] = optionIndex;
    setAnswers(next);
    if (questionIndex + 1 < q.questions.length) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setStage('taste');
      setTasteIndex(0);
    }
  };

  const restart = () => {
    setStage('intro');
    setQuestionIndex(0);
    setAnswers([]);
    setTasteIndex(0);
    setHit(null);
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-8">
        {stage !== 'intro' && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-magic">
                <Brain className="h-4 w-4" /> {q.power}
              </span>
              <span className="text-foreground">{power}%</span>
            </div>
            <Progress value={power} className="h-2.5 bg-magic/15 [&>div]:bg-gradient-magic" />
          </div>
        )}

        {stage === 'intro' && (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-magic text-magic-foreground shadow-magic">
              <Brain className="h-8 w-8" />
            </div>
            <p className="mt-5 text-muted-foreground">{q.subtitle}</p>
            <Button
              size="lg"
              onClick={() => setStage('questions')}
              className="mt-6 h-12 w-full rounded-2xl bg-gradient-magic font-bold text-magic-foreground shadow-magic hover:opacity-95"
            >
              {q.start} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}

        {stage === 'questions' && (
          <div key={questionIndex} className="animate-in fade-in slide-in-from-right-4 duration-300">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {q.question} {questionIndex + 1}/{q.questions.length}
            </p>
            <h3 className="mt-2 text-xl font-bold text-foreground">{q.questions[questionIndex].q}</h3>
            <div className="mt-5 grid gap-2.5">
              {q.questions[questionIndex].options.map((option, i) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => answer(i)}
                  className="rounded-2xl border border-border bg-background px-4 py-3.5 text-left font-medium text-foreground transition-all hover:border-magic hover:bg-magic/10 active:scale-[0.98]"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {stage === 'taste' && (
          <div key={tasteIndex} className="animate-in fade-in slide-in-from-right-4 duration-300">
            {tasteIndex === 0 && <p className="mb-4 text-sm text-muted-foreground">{q.tasteIntro}</p>}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-magic">
              <Sparkles className="h-4 w-4" /> {tasteIndex + 1}/{q.tasteSteps.length}
            </div>
            <p className="mt-3 min-h-[5.5rem] text-2xl font-bold leading-snug text-foreground">
              {q.tasteSteps[tasteIndex]}
            </p>
            <Button
              size="lg"
              onClick={() =>
                tasteIndex + 1 < q.tasteSteps.length ? setTasteIndex(tasteIndex + 1) : setStage('reveal')
              }
              className="mt-6 h-12 w-full rounded-2xl bg-gradient-magic font-bold text-magic-foreground shadow-magic hover:opacity-95"
            >
              {tasteIndex + 1 < q.tasteSteps.length ? q.next : q.reveal}
            </Button>
          </div>
        )}

        {stage === 'reveal' && (
          <div className="animate-magical-reveal text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{q.revealTitle}</p>
            <div className="mt-4 text-6xl">{q.revealFlag}</div>
            <p className="mt-3 text-4xl font-bold text-foreground">{q.revealAnswer}</p>
            {hit === false && <p className="mt-4 text-sm text-muted-foreground">{q.missText}</p>}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                size="lg"
                onClick={() => {
                  setHit(true);
                  setStage('result');
                }}
                className="h-12 rounded-2xl bg-gradient-magic font-bold text-magic-foreground hover:opacity-95"
              >
                {q.hit}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => (hit === false ? setStage('result') : setHit(false))}
                className="h-12 rounded-2xl"
              >
                {hit === false ? q.next : q.miss}
              </Button>
            </div>
          </div>
        )}

        {stage === 'result' && (
          <div className="animate-in fade-in zoom-in-95 text-center duration-500">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-magic">{q.resultKicker}</p>
            <h3 className="mt-2 text-3xl font-bold text-foreground">{profile.title}</h3>
            <p className="mt-3 text-muted-foreground">{profile.text}</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-success/15 px-4 py-1.5 text-sm font-semibold text-success">
              <Sparkles className="h-4 w-4" /> {q.unlocked}
            </div>
            <Button
              size="lg"
              onClick={onSeePrice}
              className="mt-6 h-12 w-full rounded-2xl bg-gradient-magic font-bold text-magic-foreground shadow-magic hover:opacity-95"
            >
              {q.seePrice} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Link to="/demo" className="mt-4 block text-sm font-medium text-magic underline-offset-4 hover:underline">
              {q.fullDemo}
            </Link>
            <button
              type="button"
              onClick={restart}
              className="mx-auto mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" /> {q.restart}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
