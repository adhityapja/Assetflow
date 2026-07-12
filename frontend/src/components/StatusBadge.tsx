import { AssetStatus, BookingStatus, MaintenanceStatus } from '../types';

type AnyStatus = AssetStatus | BookingStatus | MaintenanceStatus | string;

interface StatusBadgeProps {
  status: AnyStatus;
  size?: 'sm' | 'md';
}

const STATUS_STYLES: Record<string, string> = {
  // AssetStatus
  AVAILABLE:         'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  ALLOCATED:         'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30',
  RESERVED:          'bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/30',
  UNDER_MAINTENANCE: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
  LOST:              'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
  RETIRED:           'bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/30',
  DISPOSED:          'bg-zinc-500/15 text-zinc-500 ring-1 ring-zinc-500/30',

  // BookingStatus
  UPCOMING:          'bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30',
  ONGOING:           'bg-green-500/15 text-green-400 ring-1 ring-green-500/30',
  COMPLETED:         'bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/30',
  CANCELLED:         'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',

  // MaintenanceStatus
  PENDING:             'bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/30',
  APPROVED:            'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  REJECTED:            'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
  TECHNICIAN_ASSIGNED: 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30',
  IN_PROGRESS:         'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30',
  RESOLVED:            'bg-green-500/15 text-green-400 ring-1 ring-green-500/30',
};

const DOT_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-emerald-400', ALLOCATED: 'bg-blue-400', RESERVED: 'bg-violet-400',
  UNDER_MAINTENANCE: 'bg-amber-400', LOST: 'bg-red-400', RETIRED: 'bg-slate-400',
  DISPOSED: 'bg-zinc-500', UPCOMING: 'bg-sky-400', ONGOING: 'bg-green-400',
  COMPLETED: 'bg-slate-400', CANCELLED: 'bg-red-400', PENDING: 'bg-yellow-400',
  APPROVED: 'bg-emerald-400', REJECTED: 'bg-red-400',
  TECHNICIAN_ASSIGNED: 'bg-cyan-400', IN_PROGRESS: 'bg-blue-400', RESOLVED: 'bg-green-400',
};

const STATUS_LABELS: Record<string, string> = {
  UNDER_MAINTENANCE: 'Maintenance',
  TECHNICIAN_ASSIGNED: 'Assigned',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const styles = STATUS_STYLES[status] ?? 'bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/30';
  const dot = DOT_COLORS[status] ?? 'bg-slate-400';
  const label = STATUS_LABELS[status] ?? status.replace(/_/g, ' ');
  const sizeClass = size === 'sm'
    ? 'px-2 py-0.5 text-[10px] gap-1'
    : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full uppercase tracking-wide ${sizeClass} ${styles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </span>
  );
}
