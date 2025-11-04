import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { themes } from '@/data/themes';
import { useHeadPoseDetection } from '@/hooks/useHeadPoseDetection';
import { Brain } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { START_WORDS } from '@/i18n/languages';

type Quadrant = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface QuadrantWords {
  'top-left': string[];
  'top-right': string[];
  'bottom-left': string[];
  'bottom-right': string[];
}

interface ClosestWordResult {
  word: string;
  normalizedWord: string;
  distance: number;
}

const LOW_SIMILARITY_THRESHOLD = 0.45;

const normalizeForComparison = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

const calculateLevenshteinDistance = (a: string, b: string) => {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
};

const findClosestWord = (input: string, candidates: string[]): ClosestWordResult | null => {
  if (!input || !candidates.length) {
    return null;
  }

  let closest: ClosestWordResult | null = null;

  candidates.forEach(candidate => {
    const normalizedCandidate = normalizeForComparison(candidate);
    const distance = calculateLevenshteinDistance(input, normalizedCandidate);

    if (!closest || distance < closest.distance) {
      closest = {
        word: candidate,
        normalizedWord: normalizedCandidate,
        distance
      };
      return;
    }

    if (distance === closest.distance && closest) {
      if (
        normalizedCandidate.length < closest.normalizedWord.length ||
        (normalizedCandidate.length === closest.normalizedWord.length &&
          normalizedCandidate < closest.normalizedWord)
      ) {
        closest = {
          word: candidate,
          normalizedWord: normalizedCandidate,
          distance
        };
      }
    }
  });

  return closest;
};

const GamePlay = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [searchParams] = useSearchParams();
  const themeId = searchParams.get('theme');
  const userWord = searchParams.get('userWord');
  
  const theme = themes.find(t => t.id === themeId);
  const themeWords = theme?.words[language] || theme?.words['pt-BR'] || [];
  
  // Find word that starts with the letter provided by user
  const targetWord = useMemo(() => {
    if (!userWord || !theme) {
      return null;
    }
    
    const firstLetter = userWord.trim().toUpperCase();
    const matchingWord = themeWords.find(word => 
      normalizeForComparison(word).startsWith(firstLetter)
    );
    
    return matchingWord || null;
  }, [userWord, theme, themeWords]);

  const trickMode = !!targetWord;
  const [words, setWords] = useState<string[]>([]);
  const [quadrantWords, setQuadrantWords] = useState<QuadrantWords | null>(null);
  const [round, setRound] = useState(1);
  const [isWaiting, setIsWaiting] = useState(true);
  const [colorRotation, setColorRotation] = useState(0);
  const [eliminatingSide, setEliminatingSide] = useState<'left' | 'right' | null>(null);

  // Fixed 7 seconds for trick mode
  const [detectionTime] = useState(7);

  const { videoRef, currentSide, timer, resetDetection } = useHeadPoseDetection({
    threshold: 0.07,
    detectionTime: trickMode ? 7 : 5,
    onSideDetected: trickMode ? () => {} : handleSideDetected
  });

  const distributeWords = useCallback((wordList: string[]) => {
    const shuffled = [...wordList].sort(() => Math.random() - 0.5);
    const wordsPerQuadrant = Math.ceil(shuffled.length / 4);
    
    return {
      'top-left': shuffled.slice(0, wordsPerQuadrant),
      'top-right': shuffled.slice(wordsPerQuadrant, wordsPerQuadrant * 2),
      'bottom-left': shuffled.slice(wordsPerQuadrant * 2, wordsPerQuadrant * 3),
      'bottom-right': shuffled.slice(wordsPerQuadrant * 3)
    };
  }, []);

  useEffect(() => {
    if (!theme) {
      navigate('/select-theme');
      return;
    }

    let initialWords = [...themeWords].sort(() => Math.random() - 0.5);
    
    // If trick mode, keep the chosen target word highlighted
    if (trickMode && targetWord) {
      const normalizedTarget = normalizeForComparison(targetWord);
      initialWords = [
        targetWord,
        ...initialWords.filter(
          word => normalizeForComparison(word) !== normalizedTarget
        )
      ];

      if (themeWords && initialWords.length > themeWords.length) {
        initialWords = initialWords.slice(0, themeWords.length);
      }
    }
    
    setWords(initialWords);
    setQuadrantWords(distributeWords(initialWords));

    setTimeout(() => setIsWaiting(false), 3000);

    // Trick mode auto-elimination
    if (trickMode && targetWord) {
      let currentWords = initialWords;
      let currentRound = 1;

      const eliminateRound = () => {
        const distributed = distributeWords(currentWords);
        
        // Find which quadrant contains the target word
        let quadrantWithTarget: Quadrant | null = null;
        for (const [quadrant, wordList] of Object.entries(distributed) as [Quadrant, string[]][]) {
          if (wordList.some(w => w.toUpperCase() === targetWord.toUpperCase())) {
            quadrantWithTarget = quadrant;
            break;
          }
        }

        if (!quadrantWithTarget) {
          // Target word not found, end game
          navigate(`/result?word=${encodeURIComponent(targetWord)}`);
          return;
        }

        // Keep words from the quadrant with target word
        const newWords = distributed[quadrantWithTarget];

        // Determine which side to eliminate (opposite of target)
        const sideToEliminate: 'left' | 'right' = 
          quadrantWithTarget.includes('left') ? 'right' : 'left';

        if (newWords.length === 1) {
          setTimeout(() => {
            setEliminatingSide(sideToEliminate);
            setTimeout(() => {
              navigate(`/result?word=${encodeURIComponent(targetWord)}`);
            }, 2000);
          }, 7000);
          return;
        }

        setTimeout(() => {
          setEliminatingSide(sideToEliminate);
          
          setTimeout(() => {
            currentWords = newWords;
            currentRound++;
            setWords(currentWords);
            setQuadrantWords(distributeWords(currentWords));
            setRound(currentRound);
            setIsWaiting(true);
            setEliminatingSide(null);
            
            setTimeout(() => {
              setIsWaiting(false);
              eliminateRound();
            }, 2000);
          }, 2000);
        }, 7000);
      };

      setTimeout(() => {
        eliminateRound();
      }, 3000);
    }
  }, [theme, navigate, distributeWords, trickMode, targetWord, themeWords]);

  // Rotate colors every second
  useEffect(() => {
    const interval = setInterval(() => {
      setColorRotation(prev => (prev + 1) % 6);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function handleSideDetected(side: 'left' | 'right') {
    if (!quadrantWords || isWaiting) return;

    const opposingSide = side === 'left' ? 'right' : 'left';
    
    let remainingWords: string[] = [];
    
    if (side === 'left') {
      remainingWords = [...quadrantWords['top-left'], ...quadrantWords['bottom-left']];
    } else {
      remainingWords = [...quadrantWords['top-right'], ...quadrantWords['bottom-right']];
    }

    // Show elimination animation
    setEliminatingSide(opposingSide);

    setTimeout(() => {
      if (remainingWords.length === 1) {
        navigate(`/result?word=${encodeURIComponent(remainingWords[0])}`);
        return;
      }

      setWords(remainingWords);
      setQuadrantWords(distributeWords(remainingWords));
      setRound(prev => prev + 1);
      setIsWaiting(true);
      setEliminatingSide(null);
      resetDetection();
      
      setTimeout(() => setIsWaiting(false), 2000);
    }, 2000);
  }

  if (!theme || !quadrantWords) {
    return null;
  }

  const getQuadrantOpacity = (quadrant: Quadrant): string => {
    const isLeft = quadrant.includes('left');
    
    if (eliminatingSide === 'left' && isLeft) {
      return 'opacity-30 scale-95';
    }
    if (eliminatingSide === 'right' && !isLeft) {
      return 'opacity-30 scale-95';
    }
    return 'opacity-100 scale-100';
  };

  const getQuadrantColor = (quadrant: Quadrant): string => {
    const isLeft = quadrant.includes('left');
    const isTop = quadrant.includes('top');
    
    // Colors that can be used for detected side (with green/yellow)
    const detectedColors = [
      'bg-green-500/30',
      'bg-yellow-500/30',
      'bg-lime-500/30',
      'bg-emerald-500/30',
      'bg-amber-500/30',
      'bg-teal-500/30'
    ];
    
    // Colors that can be used for non-detected side (no green/yellow)
    const nonDetectedColors = [
      'bg-blue-500/30',
      'bg-purple-500/30',
      'bg-pink-500/30',
      'bg-indigo-500/30',
      'bg-cyan-500/30',
      'bg-rose-500/30'
    ];
    
    // Determine which color pool to use based on detection
    let colorPool: string[];
    
    if (currentSide === 'left' && isLeft) {
      colorPool = detectedColors;
    } else if (currentSide === 'right' && !isLeft) {
      colorPool = detectedColors;
    } else if (currentSide === 'left' && !isLeft) {
      colorPool = nonDetectedColors;
    } else if (currentSide === 'right' && isLeft) {
      colorPool = nonDetectedColors;
    } else {
      // No side detected, use balanced colors
      colorPool = (isTop && isLeft) || (!isTop && !isLeft) ? detectedColors : nonDetectedColors;
    }
    
    // Calculate index based on rotation and quadrant position
    const quadrantIndex = isTop ? (isLeft ? 0 : 1) : (isLeft ? 2 : 3);
    const colorIndex = (colorRotation + quadrantIndex) % colorPool.length;
    
    return colorPool[colorIndex];
  };

  const detectionDuration = trickMode ? 7 : 5;
  const clampedTimer = Math.min(timer, detectionDuration);
  const progress = (clampedTimer / detectionDuration) * 100;
  const timeLeft = Math.max(0, Math.ceil(detectionDuration - clampedTimer));

  return (
    <div className="min-h-screen bg-background p-4 relative">
      {/* Hidden camera */}
      <video
        ref={videoRef}
        className="absolute opacity-0 pointer-events-none"
        playsInline
        muted
      />

      {/* Central Timer */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
              opacity="0.2"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-primary transition-all duration-300"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-background/80 rounded-full p-4 backdrop-blur-sm">
              <Brain className="w-12 h-12 mx-auto text-primary mb-1" />
              <div className="text-2xl font-bold">{timeLeft}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Round indicator */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40">
        <Card className="px-6 py-3">
          <p className="text-sm font-semibold">
            {t('gameplay.round', { round: round, count: words.length })}
          </p>
        </Card>
      </div>

      {/* Elimination overlay */}
      {eliminatingSide && !isWaiting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center">
          <Card className="p-8 text-center space-y-4 animate-scale-in">
            <Brain className="w-16 h-16 mx-auto text-primary animate-pulse" />
            <p className="text-xl font-semibold">
              {t('gameplay.eliminatingSide', { 
                side: t(`gameplay.${eliminatingSide}`)
              })}
            </p>
          </Card>
        </div>
      )}

      {/* Waiting overlay */}
      {isWaiting && !eliminatingSide && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center">
          <Card className="p-8 text-center space-y-4 animate-fade-in">
            <Brain className="w-16 h-16 mx-auto text-primary animate-pulse" />
            <p className="text-xl font-semibold">
              {round === 1 ? t('gameplay.thinkWord') : t('gameplay.observePositions')}
            </p>
          </Card>
        </div>
      )}

      {/* Quadrants Grid */}
      <div className="h-screen grid grid-cols-2 gap-8 p-8">
        {/* Top Left */}
        <Card className={`flex items-center justify-center p-8 transition-all duration-1000 border-0 ${getQuadrantColor('top-left')} ${getQuadrantOpacity('top-left')}`}>
          <div className="text-center space-y-3 relative z-10">
            {quadrantWords['top-left'].map((word, idx) => (
              <div key={idx} className="text-2xl md:text-3xl font-bold text-foreground drop-shadow-lg">
                {word}
              </div>
            ))}
          </div>
        </Card>

        {/* Top Right */}
        <Card className={`flex items-center justify-center p-8 transition-all duration-1000 border-0 ${getQuadrantColor('top-right')} ${getQuadrantOpacity('top-right')}`}>
          <div className="text-center space-y-3 relative z-10">
            {quadrantWords['top-right'].map((word, idx) => (
              <div key={idx} className="text-2xl md:text-3xl font-bold text-foreground drop-shadow-lg">
                {word}
              </div>
            ))}
          </div>
        </Card>

        {/* Bottom Left */}
        <Card className={`flex items-center justify-center p-8 transition-all duration-1000 border-0 ${getQuadrantColor('bottom-left')} ${getQuadrantOpacity('bottom-left')}`}>
          <div className="text-center space-y-3 relative z-10">
            {quadrantWords['bottom-left'].map((word, idx) => (
              <div key={idx} className="text-2xl md:text-3xl font-bold text-foreground drop-shadow-lg">
                {word}
              </div>
            ))}
          </div>
        </Card>

        {/* Bottom Right */}
        <Card className={`flex items-center justify-center p-8 transition-all duration-1000 border-0 ${getQuadrantColor('bottom-right')} ${getQuadrantOpacity('bottom-right')}`}>
          <div className="text-center space-y-3 relative z-10">
            {quadrantWords['bottom-right'].map((word, idx) => (
              <div key={idx} className="text-2xl md:text-3xl font-bold text-foreground drop-shadow-lg">
                {word}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Instruction */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <Card className="px-6 py-3 bg-background/90 backdrop-blur">
          <p className="text-sm text-muted-foreground text-center">
            {currentSide === 'left' && '...'}
            {currentSide === 'right' && '...'}
            {currentSide === 'center' && '...'}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default GamePlay;
