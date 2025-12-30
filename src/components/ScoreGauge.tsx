import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showMinMax?: boolean;
  className?: string;
  animated?: boolean;
}

/**
 * ScoreGauge - Semicircular gauge dial visualization
 * Features: Needle indicator, colored segments, spring animation
 */
export function ScoreGauge({
  score,
  maxScore = 10,
  size = 'md',
  label,
  showMinMax = true,
  className,
  animated = true,
}: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      return;
    }

    const duration = 1200;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      // Easing function for spring effect
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      current = score * eased;
      setDisplayScore(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayScore(score);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score, animated]);

  const sizes = {
    sm: { width: 120, height: 70, strokeWidth: 8, fontSize: 'text-lg', needleLength: 40 },
    md: { width: 180, height: 100, strokeWidth: 10, fontSize: 'text-2xl', needleLength: 60 },
    lg: { width: 240, height: 130, strokeWidth: 12, fontSize: 'text-4xl', needleLength: 80 },
  };

  const { width, height, strokeWidth, fontSize, needleLength } = sizes[size];
  const centerX = width / 2;
  const centerY = height - 10;
  const radius = width / 2 - strokeWidth;

  // Angle calculation (180 degree arc)
  const startAngle = 180;
  const endAngle = 0;
  const angleRange = startAngle - endAngle;
  const needleAngle = startAngle - (displayScore / maxScore) * angleRange;
  const needleRadians = (needleAngle * Math.PI) / 180;

  // Segment colors
  const segments = [
    { start: 0, end: 3, color: 'hsl(var(--score-critical))' },
    { start: 3, end: 5, color: 'hsl(var(--score-poor))' },
    { start: 5, end: 6.5, color: 'hsl(var(--score-average))' },
    { start: 6.5, end: 8, color: 'hsl(var(--score-good))' },
    { start: 8, end: 10, color: 'hsl(var(--score-excellent))' },
  ];

  const getScoreClass = (s: number) => {
    if (s >= 8) return 'score-excellent';
    if (s >= 6.5) return 'score-good';
    if (s >= 5) return 'score-average';
    if (s >= 3) return 'score-poor';
    return 'score-critical';
  };

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Background arc */}
        <path
          d={describeArc(centerX, centerY, radius, endAngle, startAngle)}
          fill="none"
          stroke="hsl(var(--muted) / 0.3)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Colored segments */}
        {segments.map((segment, i) => {
          const segStartAngle = startAngle - (segment.start / maxScore) * angleRange;
          const segEndAngle = startAngle - (segment.end / maxScore) * angleRange;
          return (
            <path
              key={i}
              d={describeArc(centerX, centerY, radius, segEndAngle, segStartAngle)}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              opacity={0.3}
            />
          );
        })}

        {/* Active segment (up to current score) */}
        <path
          d={describeArc(centerX, centerY, radius, needleAngle, startAngle)}
          fill="none"
          stroke={`hsl(var(--${getScoreClass(score).replace('score-', 'score-')}))`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 6px hsl(var(--${getScoreClass(score).replace('score-', 'score-')}) / 0.5))`,
          }}
        />

        {/* Needle */}
        <g className="transition-transform duration-300 ease-out" style={{ transformOrigin: `${centerX}px ${centerY}px` }}>
          <line
            x1={centerX}
            y1={centerY}
            x2={centerX + needleLength * Math.cos(needleRadians)}
            y2={centerY - needleLength * Math.sin(needleRadians)}
            stroke="hsl(var(--foreground))"
            strokeWidth={3}
            strokeLinecap="round"
          />
          {/* Needle cap */}
          <circle
            cx={centerX}
            cy={centerY}
            r={6}
            fill="hsl(var(--foreground))"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={3}
            fill="hsl(var(--accent-gold))"
          />
        </g>

        {/* Min/Max labels */}
        {showMinMax && (
          <>
            <text
              x={strokeWidth + 5}
              y={height - 5}
              className="text-[10px] fill-muted-foreground font-mono"
            >
              0
            </text>
            <text
              x={width - strokeWidth - 10}
              y={height - 5}
              className="text-[10px] fill-muted-foreground font-mono"
            >
              10
            </text>
          </>
        )}
      </svg>

      {/* Score display */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <span className={cn('font-mono font-bold', fontSize, getScoreClass(score))}>
          {displayScore.toFixed(1)}
        </span>
        {label && (
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        )}
      </div>
    </div>
  );
}

// Helper function to create SVG arc path
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  
  const startX = x + radius * Math.cos(startRad);
  const startY = y - radius * Math.sin(startRad);
  const endX = x + radius * Math.cos(endRad);
  const endY = y - radius * Math.sin(endRad);
  
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  
  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 0 ${endX} ${endY}`;
}