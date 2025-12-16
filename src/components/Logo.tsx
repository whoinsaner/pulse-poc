import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 48, text: 'text-3xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          {/* Outer ring */}
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="url(#pulse-gradient)"
            strokeWidth="2"
            fill="none"
          />
          {/* Inner pulse wave */}
          <path
            d="M12 24 L18 24 L21 16 L24 32 L27 20 L30 28 L33 24 L36 24"
            stroke="url(#pulse-gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Glow effect */}
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="url(#pulse-gradient)"
            strokeWidth="1"
            fill="none"
            opacity="0.3"
            filter="url(#glow)"
          />
          <defs>
            <linearGradient id="pulse-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(252, 100%, 67%)" />
              <stop offset="100%" stopColor="hsl(280, 65%, 60%)" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
        {/* Animated pulse ring */}
        <div className="absolute inset-0 animate-ping">
          <svg
            width={icon}
            height={icon}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-20"
          >
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              fill="none"
            />
          </svg>
        </div>
      </div>
      {showText && (
        <span className={cn('font-bold tracking-tight gradient-text', text)}>
          Pulse
        </span>
      )}
    </div>
  );
}
