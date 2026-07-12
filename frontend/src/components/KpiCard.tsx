interface KpiCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  delta?: { value: number; label: string };
  accent?: 'indigo' | 'emerald' | 'amber' | 'red' | 'sky' | 'violet';
  loading?: boolean;
}

const ACCENTS = {
  indigo:  { bg: 'bg-indigo-500/10',  icon: 'bg-indigo-500/20 text-indigo-400',  border: 'border-indigo-500/20',  value: 'text-indigo-300' },
  emerald: { bg: 'bg-emerald-500/10', icon: 'bg-emerald-500/20 text-emerald-400', border: 'border-emerald-500/20', value: 'text-emerald-300' },
  amber:   { bg: 'bg-amber-500/10',   icon: 'bg-amber-500/20 text-amber-400',   border: 'border-amber-500/20',   value: 'text-amber-300' },
  red:     { bg: 'bg-red-500/10',     icon: 'bg-red-500/20 text-red-400',       border: 'border-red-500/20',     value: 'text-red-300' },
  sky:     { bg: 'bg-sky-500/10',     icon: 'bg-sky-500/20 text-sky-400',       border: 'border-sky-500/20',     value: 'text-sky-300' },
  violet:  { bg: 'bg-violet-500/10',  icon: 'bg-violet-500/20 text-violet-400',  border: 'border-violet-500/20',  value: 'text-violet-300' },
};

export function KpiCard({ label, value, icon, delta, accent = 'indigo', loading = false }: KpiCardProps) {
  const a = ACCENTS[accent];

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/6 p-5 shimmer h-32" />
    );
  }

  const isPositiveDelta = delta && delta.value > 0;
  const isNegativeDelta = delta && delta.value < 0;

  return (
    <div
      className={`rounded-2xl border ${a.border} ${a.bg} p-5 flex flex-col gap-3 
        hover:scale-[1.02] transition-transform duration-200 cursor-default`}
      style={{ background: 'rgba(30,41,59,0.5)' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.icon}`}>
          {icon}
        </div>
        {delta && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full
              ${isPositiveDelta ? 'bg-emerald-500/15 text-emerald-400'
                : isNegativeDelta ? 'bg-red-500/15 text-red-400'
                : 'bg-slate-500/15 text-slate-400'}`}
          >
            {isPositiveDelta ? '+' : ''}{delta.value} {delta.label}
          </span>
        )}
      </div>

      {/* Value */}
      <div>
        <p className={`text-3xl font-bold tabular-nums ${a.value}`}>
          {value}
        </p>
        <p className="text-sm text-slate-400 mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
}
