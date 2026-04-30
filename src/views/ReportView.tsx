import { useFocusStore } from '@/store/focusStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ReportView() {
  const sessions = useFocusStore(s => s.sessions);
  const resetSession = useFocusStore(s => s.resetSession);

  const chartData = sessions.map((s, i) => ({
    name: `#${i + 1}`,
    focusRate: Math.round(s.focusRate),
  }));

  const avgFocusTime = sessions.length > 0
    ? sessions.reduce((a, s) => a + s.focusedTime, 0) / sessions.length
    : 0;
  const bestFocusTime = sessions.length > 0
    ? Math.max(...sessions.map(s => s.focusedTime))
    : 0;
  const avgFocusRate = sessions.length > 0
    ? sessions.reduce((a, s) => a + s.focusRate, 0) / sessions.length
    : 0;

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">📊 집중 리포트</h1>
          <p className="text-muted-foreground text-sm">최근 7회 세션 기록</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-card text-center space-y-1">
            <div className="text-xs text-muted-foreground uppercase">평균 집중 시간</div>
            <div className="font-mono text-2xl font-bold text-foreground">{formatTime(avgFocusTime)}</div>
          </div>
          <div className="p-4 rounded-xl bg-card text-center space-y-1">
            <div className="text-xs text-muted-foreground uppercase">최고 기록</div>
            <div className="font-mono text-2xl font-bold text-focus-gold">{formatTime(bestFocusTime)}</div>
          </div>
          <div className="p-4 rounded-xl bg-card text-center space-y-1">
            <div className="text-xs text-muted-foreground uppercase">평균 집중률</div>
            <div className="font-mono text-2xl font-bold text-focus-green">{avgFocusRate.toFixed(0)}%</div>
          </div>
        </div>

        {/* Chart */}
        {sessions.length > 0 ? (
          <div className="p-6 rounded-xl bg-card">
            <h3 className="text-sm font-medium text-foreground mb-4">집중률 추이</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 18%)" />
                <XAxis dataKey="name" stroke="hsl(0, 0%, 45%)" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="hsl(0, 0%, 45%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0, 0%, 10%)',
                    border: '1px solid hsl(0, 0%, 18%)',
                    borderRadius: '8px',
                    color: 'hsl(0, 0%, 95%)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="focusRate"
                  stroke="hsl(142, 71%, 45%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(142, 71%, 45%)', r: 4 }}
                  name="집중률 %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-12 rounded-xl bg-card text-center text-muted-foreground">
            아직 기록된 세션이 없습니다.
          </div>
        )}

        {/* Session list */}
        {sessions.length > 0 && (
          <div className="p-6 rounded-xl bg-card space-y-3">
            <h3 className="text-sm font-medium text-foreground">세션 기록</h3>
            {[...sessions].reverse().map((s, i) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="text-sm text-muted-foreground">
                  {new Date(s.date).toLocaleDateString('ko-KR')}
                </div>
                <div className="font-mono text-sm text-foreground">{formatTime(s.focusedTime)}</div>
                <div className={`font-mono text-sm font-medium ${s.focusRate >= 80 ? 'text-focus-green' : s.focusRate >= 50 ? 'text-focus-gold' : 'text-focus-red'}`}>
                  {s.focusRate.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={resetSession}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground text-lg font-bold hover:opacity-90 transition-focus"
        >
          새 세션 시작
        </button>
      </div>
    </div>
  );
}
