import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { getScoreColor } from '@/lib/scoreUtils';

interface ScoreRingProps {
  score: number; // Expected 0-100 scale
  maxScore?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
  showBenchmark?: boolean;
  benchmarkScore?: number;
}

/**
 * ScoreRing - Premium circular score visualization
 * Features: Gradient arcs, glow effects, animated reveals, benchmark overlay
 * STANDARDIZED 100-POINT SCALE
 */
export function ScoreRing({
  score,
  maxScore = 100,
  size = 'md',
  showLabel = true,
  label,
  className,
  animated = true,
  showBenchmark = false,
  benchmarkScore = 70,
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  const [isVisible, setIsVisible] = useState(!animated);

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      setIsVisible(true);
      return;
    }

    // Animate score counting
    const duration = 1200;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    setIsVisible(true);

    const timer = setInterval(() => {
      step++;
      current = Math.min(score, increment * step);
      setDisplayScore(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayScore(score);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score, animated]);

  const sizes = {
    xs: { diameter: 48, stroke: 4, fontSize: 'text-xs', labelSize: 'text-[8px]', gap: 2 },
    sm: { diameter: 64, stroke: 5, fontSize: 'text-sm', labelSize: 'text-[10px]', gap: 3 },
    md: { diameter: 100, stroke: 6, fontSize: 'text-2xl', labelSize: 'text-xs', gap: 4 },
    lg: { diameter: 140, stroke: 8, fontSize: 'text-4xl', labelSize: 'text-sm', gap: 5 },
    xl: { diameter: 200, stroke: 10, fontSize: 'text-5xl', labelSize: 'text-base', gap: 6 },
  };

  const { diameter, stroke, fontSize, labelSize, gap } = sizes[size];
  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = (displayScore / maxScore) * 100;
  const progress = (percentage / 100) * circumference;
  const benchmarkProgress = (benchmarkScore / maxScore) * circumference;

  // Score-based colors with gradients (0-100 scale)
  const getScoreGradient = (s: number) => {
    if (s >= 80) return { start: '#10B981', end: '#34D399', glow: 'var(--score-excellent)' };
    if (s >= 65) return { start: '#22C55E', end: '#4ADE80', glow: 'var(--score-good)' };
    if (s >= 50) return { start: '#F59E0B', end: '#FBBF24', glow: 'var(--score-average)' };
    if (s >= 30) return { start: '#F97316', end: '#FB923C', glow: 'var(--score-poor)' };
    return { start: '#EF4444', end: '#F87171', glow: 'var(--score-critical)' };
  };

  const getScoreClass = (s: number) => {
    return getScoreColor(s);
  };

  const colors = getScoreGradient(score);
  const gradientId = `score-gradient-${Math.random().toString(36).substr(2, 9)}`;
  const glowId = `score-glow-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
        className="transform -rotate-90"
      >
        <defs>
          {/* Gradient for progress arc */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
          {/* Glow filter */}
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle with subtle pattern */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted) / 0.5)"
          strokeWidth={stroke}
        />

        {/* Tick marks for scale reference (0-100 scale) */}
        {size !== 'xs' && size !== 'sm' && (
          <>
            {[0, 25, 50, 75, 100].map((tick, i) => {
              const tickAngle = (tick / maxScore) * 360 - 90;
              const tickRadians = (tickAngle * Math.PI) / 180;
              const innerRadius = radius - stroke - gap;
              const outerRadius = radius - stroke / 2;
              const x1 = diameter / 2 + innerRadius * Math.cos(tickRadians);
              const y1 = diameter / 2 + innerRadius * Math.sin(tickRadians);
              const x2 = diameter / 2 + outerRadius * Math.cos(tickRadians);
              const y2 = diameter / 2 + outerRadius * Math.sin(tickRadians);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="hsl(var(--muted-foreground) / 0.3)"
                  strokeWidth={1}
                />
              );
            })}
          </>
        )}

        {/* Benchmark line (optional) */}
        {showBenchmark && (
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--accent-gold) / 0.4)"
            strokeWidth={2}
            strokeDasharray={`${benchmarkProgress} ${circumference}`}
            strokeLinecap="round"
          />
        )}

        {/* Progress arc with gradient */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          filter={`url(#${glowId})`}
          className={cn(
            animated && isVisible && 'transition-all duration-1000 ease-out'
          )}
          style={{
            filter: `drop-shadow(0 0 ${stroke * 2}px ${colors.start}50)`,
          }}
        />

        {/* Inner glow ring */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius - stroke - 2}
          fill="none"
          stroke={`${colors.start}15`}
          strokeWidth={stroke}
        />
      </svg>

      {/* Score display - now shows integer for 0-100 scale */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span 
          className={cn(
            'font-mono font-bold tracking-tight',
            fontSize, 
            getScoreClass(score),
            animated && isVisible && 'animate-count-up'
          )}
        >
          {Math.round(displayScore)}
        </span>
        {showLabel && label && (
          <span className={cn('text-muted-foreground mt-0.5 font-medium', labelSize)}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}