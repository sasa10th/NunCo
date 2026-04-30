import { useMemo } from 'react';

interface ProgressRingProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
}

export default function ProgressRing({ progress, size = 160, strokeWidth = 8 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(progress, 1));
  const isComplete = progress >= 1;

  const strokeColor = useMemo(() => {
    if (isComplete) return 'hsl(45, 93%, 47%)';
    return 'hsl(142, 71%, 45%)';
  }, [isComplete]);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(0, 0%, 18%)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-focus"
        style={{ filter: isComplete ? 'drop-shadow(0 0 8px hsl(45, 93%, 47%))' : undefined }}
      />
    </svg>
  );
}
