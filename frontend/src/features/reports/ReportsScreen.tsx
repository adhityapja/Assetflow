import { useState, useEffect } from 'react';
import { ReportService } from '../../api/client';
import type { ReportDTO, Asset } from '../../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b', '#ec4899', '#06b6d4'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function ReportsScreen() {
  const [report, setReport] = useState<ReportDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ReportService.getReports()
      .then(setReport)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading analytics...</div>;
  }

  if (!report) {
    return <div className="p-8 text-center text-red-400">Failed to load reports.</div>;
  }

  const handleExport = async () => {
    try {
      await ReportService.exportReport();
    } catch (err) {
      console.error('Failed to export', err);
      alert('Failed to export report');
    }
  };

  // Heatmap helper
  const getHeatmapColor = (day: number, hour: number) => {
    if (!report.bookingHeatmap || report.bookingHeatmap.length === 0) return 'rgba(255,255,255,0.02)';
    const maxCount = Math.max(...report.bookingHeatmap.map(b => b.count), 1);
    const cell = report.bookingHeatmap.find(b => b.dayOfWeek === day && b.hourOfDay === hour);
    if (!cell) return 'rgba(255,255,255,0.02)';
    const opacity = Math.max(0.1, cell.count / maxCount);
    return `rgba(99, 102, 241, ${opacity})`; // Indigo based
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time breakdown of your entire asset lifecycle.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Allocation (Pie) */}
        <div className="rounded-2xl border border-white/6 p-6 bg-slate-800/50">
          <h2 className="text-sm font-semibold text-slate-200 mb-6">Department-wise Allocation</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={report.departmentAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="label"
                >
                  {report.departmentAllocation.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Used Assets (Bar) */}
        <div className="rounded-2xl border border-white/6 p-6 bg-slate-800/50">
          <h2 className="text-sm font-semibold text-slate-200 mb-6">Asset Utilization (Top 5 Booked)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.mostUsedAssets} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="label" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Hours Booked" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Frequency by Category (Bar) */}
        <div className="rounded-2xl border border-white/6 p-6 bg-slate-800/50">
          <h2 className="text-sm font-semibold text-slate-200 mb-6">Maintenance by Category</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.maintenanceByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Requests" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assets By Status (Pie) */}
        <div className="rounded-2xl border border-white/6 p-6 bg-slate-800/50">
          <h2 className="text-sm font-semibold text-slate-200 mb-6">Overall Asset Status</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={report.assetsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="label"
                >
                  {report.assetsByStatus.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Booking Heatmap */}
        <div className="rounded-2xl border border-white/6 p-6 bg-slate-800/50 lg:col-span-2 overflow-x-auto">
          <h2 className="text-sm font-semibold text-slate-200 mb-6">Resource Booking Heatmap (Peak Windows)</h2>
          <div className="min-w-[700px]">
            <div className="flex">
              <div className="w-12"></div>
              {HOURS.map(h => (
                <div key={h} className="flex-1 text-center text-[10px] text-slate-500">{h}h</div>
              ))}
            </div>
            <div className="space-y-1 mt-1">
              {DAYS.map((dayLabel, index) => {
                const dayIndex = index + 1; // 1 = Mon, 7 = Sun
                return (
                  <div key={dayIndex} className="flex items-center gap-2">
                    <div className="w-10 text-xs font-medium text-slate-400 text-right">{dayLabel}</div>
                    <div className="flex flex-1 gap-1">
                      {HOURS.map(hour => (
                        <div
                          key={`${dayIndex}-${hour}`}
                          className="flex-1 h-6 rounded-sm transition-opacity hover:opacity-80"
                          style={{ backgroundColor: getHeatmapColor(dayIndex, hour) }}
                          title={`${dayLabel} ${hour}:00 - Bookings: ${report.bookingHeatmap?.find(b => b.dayOfWeek === dayIndex && b.hourOfDay === hour)?.count || 0}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Maintenance / Nearing Retirement */}
        <div className="rounded-2xl border border-white/6 p-6 bg-slate-800/50 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-200 mb-6">Assets Due For Maintenance / Nearing Retirement</h2>
          {report.upcomingMaintenance && report.upcomingMaintenance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-white/5 text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 font-semibold rounded-tl-xl">Asset Tag</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Location</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {report.upcomingMaintenance.map((asset: Asset) => (
                    <tr key={asset.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{asset.assetTag}</td>
                      <td className="px-4 py-3 font-medium text-slate-200">{asset.name}</td>
                      <td className="px-4 py-3">{asset.category}</td>
                      <td className="px-4 py-3">{asset.location}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400`}>
                          {asset.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic text-center py-8 border border-dashed border-white/10 rounded-xl">
              No assets currently flagged for immediate maintenance or retirement.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
