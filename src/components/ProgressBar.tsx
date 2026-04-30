interface ProgressBarProps {
  progress: number; // 0-1
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const pct = Math.min(progress * 100, 100);
  const isComplete = progress >= 1;

  return (
    <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
      <div
        className="h-full rounded-full transition-focus"
        style={{
          width: `${pct}%`,
          backgroundColor: isComplete ? 'hsl(45, 93%, 47%)' : 'hsl(142, 71%, 45%)',
          boxShadow: isComplete ? '0 0 10px hsl(45, 93%, 47%)' : undefined,
        }}
      />
    </div>
  );
}
