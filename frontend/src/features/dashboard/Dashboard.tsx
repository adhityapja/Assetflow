import { useState, useEffect } from 'react';
import { KpiCard } from '../../components/KpiCard';
import { StatusBadge } from '../../components/StatusBadge';
import { DashboardService, MetricsService, ActivityLogService } from '../../api/client';
import type { KpiSummary, OverdueReturn, ActivityLog } from '../../types';
import { BookingStatus } from '../../types';

// ── Mock data (used as initial state while API loads) ──
const MOCK_KPIS: KpiSummary = {
  totalAssets: 284,
  availableAssets: 142,
  allocatedAssets: 89,
  underMaintenance: 18,
  activeBookings: 34,
  pendingMaintenance: 11,
  overdueReturns: 7,
};

const MOCK_OVERDUE: OverdueReturn[] = [
  { bookingId: 1, assetId: 10, assetName: 'MacBook Pro 16"', userName: 'Sarah Chen', scheduledReturn: '2026-07-10T17:00:00', hoursOverdue: 43 },
  { bookingId: 2, assetId: 22, assetName: 'Nikon D850 Camera', userName: 'James Okafor', scheduledReturn: '2026-07-11T09:00:00', hoursOverdue: 27 },
  { bookingId: 3, assetId: 47, assetName: 'Conference Room B2', userName: 'Priya Nair', scheduledReturn: '2026-07-11T14:00:00', hoursOverdue: 22 },
  { bookingId: 4, assetId: 61, assetName: 'Dell XPS Workstation', userName: 'Arjun Mehta', scheduledReturn: '2026-07-11T18:00:00', hoursOverdue: 18 },
  { bookingId: 5, assetId: 88, assetName: 'iPad Pro 12.9"', userName: 'Luisa Ferreira', scheduledReturn: '2026-07-12T08:00:00', hoursOverdue: 4 },
];

// Remove MOCK_ACTIVITY

function ActivityIcon({ type }: { type: string }) {
  const map: Record<string, { bg: string; icon: React.ReactNode }> = {
    allocate: {
      bg: 'bg-indigo-500/20 text-indigo-400',
      icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
    },
    resolved: {
      bg: 'bg-emerald-500/20 text-emerald-400',
      icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    conflict: {
      bg: 'bg-red-500/20 text-red-400',
      icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>,
    },
    booking: {
      bg: 'bg-sky-500/20 text-sky-400',
      icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25" /></svg>,
    },
    retired: {
      bg: 'bg-slate-500/20 text-slate-400',
      icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5" /></svg>,
    },
  };
  const cfg = map[type] ?? map.booking;
  return (
    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
      {cfg.icon}
    </div>
  );
}

export function Dashboard() {
  const [kpis, setKpis] = useState<KpiSummary>(MOCK_KPIS);
  const [overdue, setOverdue] = useState<OverdueReturn[]>(MOCK_OVERDUE);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      MetricsService.getDashboardMetrics(), 
      DashboardService.getOverdueReturns(),
      ActivityLogService.getAllLogs()
    ])
      .then(([k, o, a]) => { setKpis(k); setOverdue(o); setActivities(a.slice(0, 5)); })
      .catch(() => { /* keep mock data on failure */ })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Operations Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Live asset intelligence across your entire fleet.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <KpiCard
          loading={loading}
          label="Available Assets"
          value={kpis.availableAssets}
          accent="emerald"
          delta={{ value: +12, label: 'this week' }}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>}
        />
        <KpiCard
          loading={loading}
          label="Active Bookings"
          value={kpis.activeBookings}
          accent="sky"
          delta={{ value: +3, label: 'today' }}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
        />
        <KpiCard
          loading={loading}
          label="Pending Maintenance"
          value={kpis.pendingMaintenance}
          accent="amber"
          delta={{ value: -2, label: 'vs yesterday' }}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>}
        />
        <KpiCard
          loading={loading}
          label="Overdue Returns"
          value={kpis.overdueReturns}
          accent="red"
          delta={{ value: +7, label: 'flagged' }}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Asset utilization bar */}
      <div className="rounded-2xl p-5 border border-white/6" style={{ background: 'rgba(30,41,59,0.5)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Fleet Utilization</h2>
            <p className="text-xs text-slate-500 mt-0.5">{kpis.totalAssets} total assets</p>
          </div>
          <span className="text-2xl font-bold text-slate-100">
            {Math.round((kpis.allocatedAssets / kpis.totalAssets) * 100)}%
          </span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
          <div className="h-full flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${(kpis.availableAssets / kpis.totalAssets) * 100}%` }}
              title={`Available: ${kpis.availableAssets}`}
            />
            <div
              className="h-full bg-indigo-500"
              style={{ width: `${(kpis.allocatedAssets / kpis.totalAssets) * 100}%` }}
              title={`Allocated: ${kpis.allocatedAssets}`}
            />
            <div
              className="h-full bg-amber-500"
              style={{ width: `${(kpis.underMaintenance / kpis.totalAssets) * 100}%` }}
              title={`Maintenance: ${kpis.underMaintenance}`}
            />
          </div>
        </div>
        <div className="flex gap-5 mt-3">
          {[
            { color: 'bg-emerald-500', label: 'Available', val: kpis.availableAssets },
            { color: 'bg-indigo-500', label: 'Allocated', val: kpis.allocatedAssets },
            { color: 'bg-amber-500', label: 'Maintenance', val: kpis.underMaintenance },
          ].map(({ color, label, val }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <span className="text-xs text-slate-400">{label} <span className="text-slate-200 font-medium">{val}</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom grid: overdue + activity */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Overdue Returns Table */}
        <div className="xl:col-span-3 rounded-2xl border border-white/6 overflow-hidden"
          style={{ background: 'rgba(30,41,59,0.5)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Overdue Returns</h2>
              <p className="text-xs text-slate-500 mt-0.5">Assets past their scheduled return time</p>
            </div>
            <span className="text-xs font-bold bg-red-500/20 text-red-400 ring-1 ring-red-500/30
              px-2.5 py-1 rounded-full">
              {overdue.length} flagged
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(15,23,42,0.4)' }}>
                  {['Asset', 'Assignee', 'Due Date', 'Overdue', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {overdue.map((row) => (
                  <tr key={row.bookingId} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-200">{row.assetName}</td>
                    <td className="px-5 py-3.5 text-slate-400">{row.userName}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">
                      {new Date(row.scheduledReturn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`font-semibold text-xs ${row.hoursOverdue > 24 ? 'text-red-400' : 'text-amber-400'}`}>
                        +{row.hoursOverdue}h
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={BookingStatus.ONGOING} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="xl:col-span-2 rounded-2xl border border-white/6 overflow-hidden"
          style={{ background: 'rgba(30,41,59,0.5)' }}>
          <div className="px-5 py-4 border-b border-white/6">
            <h2 className="text-sm font-semibold text-slate-200">Recent Activity</h2>
            <p className="text-xs text-slate-500 mt-0.5">Live event stream</p>
          </div>
          <div className="p-4 space-y-3">
            {activities.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-4">No recent activity</p>
            ) : (
              activities.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <ActivityIcon type={item.action.toLowerCase().includes('create') ? 'booking' : 'allocate'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 leading-none">{item.action}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{item.entity}</p>
                  </div>
                  <span className="text-[10px] text-slate-600 whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
