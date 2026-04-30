import { useFocusStore } from '@/store/focusStore';

export default function DebugPanel() {
  const ear = useFocusStore(s => s.ear);
  const pitch = useFocusStore(s => s.pitch);
  const yaw = useFocusStore(s => s.yaw);

  return (
    <div className="space-y-2 p-3 rounded-lg bg-secondary/50">
      <h4 className="text-xs text-muted-foreground uppercase tracking-wider">실시간 수치</h4>
      <div className="grid grid-cols-3 gap-2">
        <DebugValue label="EAR" value={ear.toFixed(3)} />
        <DebugValue label="Pitch" value={`${pitch.toFixed(1)}°`} />
        <DebugValue label="Yaw" value={`${yaw.toFixed(1)}°`} />
      </div>
    </div>
  );
}

function DebugValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-[10px] text-muted-foreground uppercase">{label}</div>
      <div className="font-mono text-sm text-foreground">{value}</div>
    </div>
  );
}
