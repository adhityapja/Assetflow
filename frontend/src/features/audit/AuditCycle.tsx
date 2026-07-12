import { useState, useEffect } from 'react';
import { AuditService } from '../../api/client';
import { AuditResult } from '../../types';
import type { AuditCycle as AuditCycleType, AuditItem } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';

const RESULT_BUTTONS: { result: AuditResult; label: string; styles: string; activeStyles: string }[] = [
  {
    result: AuditResult.VERIFIED,
    label: 'Verified',
    styles: 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 border-transparent',
    activeStyles: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    result: AuditResult.MISSING,
    label: 'Missing',
    styles: 'text-slate-500 hover:text-red-400 hover:bg-red-500/10 border-transparent',
    activeStyles: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  {
    result: AuditResult.DAMAGED,
    label: 'Damaged',
    styles: 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 border-transparent',
    activeStyles: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
];

export function AuditCycle() {
  const [cycles, setCycles] = useState<AuditCycleType[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<AuditCycleType | null>(null);
  
  const [items, setItems] = useState<AuditItem[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  
  const [createModal, setCreateModal] = useState(false);
  const [newCycleName, setNewCycleName] = useState('');
  const [newCycleLocation, setNewCycleLocation] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [summaryModal, setSummaryModal] = useState(false);

  useEffect(() => {
    loadCycles();
  }, []);

  const loadCycles = async () => {
    try {
      const data = await AuditService.getAllCycles();
      setCycles(data);
    } catch (e) {
      console.error('Failed to load audit cycles');
    }
  };

  const loadCycleRecords = async (cycle: AuditCycleType) => {
    try {
      const records = await AuditService.getRecordsForCycle(cycle.id);
      setSelectedCycle(cycle);
      setItems(records);
      const newNotes: Record<number, string> = {};
      records.forEach((r: any) => {
        if (r.notes) newNotes[r.id] = r.notes;
      });
      setNotes(newNotes);
    } catch (e) {
      console.error('Failed to load records for cycle');
    }
  };

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cycle = await AuditService.createCycle({
        name: newCycleName,
        location: newCycleLocation || undefined,
      });
      setCreateModal(false);
      setNewCycleName('');
      setNewCycleLocation('');
      loadCycles();
      loadCycleRecords(cycle);
    } catch (e) {
      console.error('Failed to create cycle');
    }
  };

  const setResult = (id: number, result: AuditResult) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, auditResult: result } : item));
  };

  const handleFinalize = async () => {
    if (!selectedCycle || !allReviewed) return;
    setSubmitting(true);
    try {
      // First submit batch of updates
      await AuditService.submitBatch({
        auditCycleId: selectedCycle.id,
        items: items.map((i) => ({
          assetId: i.assetId,
          result: i.auditResult,
          notes: notes[i.id],
        })),
      });

      // Then close the cycle
      await AuditService.closeCycle(selectedCycle.id);
      
      setSummaryModal(true);
      loadCycles();
      setSelectedCycle(prev => prev ? { ...prev, status: 'CLOSED' } : null);
    } catch (e) {
      console.error('Failed to finalize audit cycle');
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedCycle) {
    return (
      <div className="space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Audit Cycles</h1>
            <p className="text-slate-500 text-sm mt-1">Manage and run physical asset verification cycles.</p>
          </div>
          <button
            onClick={() => setCreateModal(true)}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all"
          >
            Create New Cycle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cycles.map((cycle) => (
            <div key={cycle.id} className="p-5 rounded-2xl border border-white/10 bg-slate-800/50 hover:bg-slate-800/80 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-slate-200">{cycle.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${cycle.status === 'OPEN' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-500/20 text-slate-400'}`}>
                  {cycle.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">Started: {new Date(cycle.startDate).toLocaleDateString()}</p>
              
              <button
                onClick={() => loadCycleRecords(cycle)}
                className="w-full py-2 rounded-lg border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
              >
                {cycle.status === 'OPEN' ? 'Continue Audit' : 'View Results'}
              </button>
            </div>
          ))}
          {cycles.length === 0 && (
            <div className="col-span-full p-8 text-center border border-white/10 rounded-2xl bg-slate-800/30">
              <p className="text-slate-400">No audit cycles found.</p>
            </div>
          )}
        </div>

        <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Audit Cycle">
          <form onSubmit={handleCreateCycle} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Cycle Name</label>
              <input
                type="text"
                required
                value={newCycleName}
                onChange={(e) => setNewCycleName(e.target.value)}
                placeholder="e.g. Q3 2026 Audit"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Location (Optional)</label>
              <input
                type="text"
                value={newCycleLocation}
                onChange={(e) => setNewCycleLocation(e.target.value)}
                placeholder="e.g. HQ Floor 3"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-500/20"
            >
              Start Cycle
            </button>
          </form>
        </Modal>
      </div>
    );
  }

  // Active/View Cycle Mode
  const isClosed = selectedCycle.status === 'CLOSED';
  const reviewed = items.filter((i) => i.auditResult !== AuditResult.UNREVIEWED);
  const discrepancies = items.filter(
    (i) => i.auditResult === AuditResult.MISSING || i.auditResult === AuditResult.DAMAGED
  );
  const verified  = items.filter((i) => i.auditResult === AuditResult.VERIFIED);
  const allReviewed = items.length > 0 && reviewed.length === items.length;
  const progress  = items.length > 0 ? Math.round((reviewed.length / items.length) * 100) : 0;

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-start gap-4">
        <button onClick={() => setSelectedCycle(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{selectedCycle.name}</h1>
            <p className="text-slate-500 text-sm mt-1">
              Started on {new Date(selectedCycle.startDate).toLocaleDateString()} {selectedCycle.location && `· Location: ${selectedCycle.location}`}
            </p>
          </div>
          <button
            onClick={handleFinalize}
            disabled={!allReviewed || submitting || isClosed}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all
              ${allReviewed && !isClosed
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/8'
              }`}
          >
            {isClosed ? '✓ Cycle Closed' : submitting ? 'Submitting…' : 'Finalize Audit'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/6 p-4"
        style={{ background: 'rgba(30,41,59,0.5)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">
            Audit Progress — {reviewed.length} / {items.length} reviewed
          </span>
          <span className={`text-sm font-bold ${allReviewed ? 'text-emerald-400' : 'text-slate-300'}`}>
            {progress}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${allReviewed ? 'bg-emerald-500' : 'bg-indigo-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3">
          {[
            { color: 'bg-emerald-500', label: 'Verified',    val: verified.length },
            { color: 'bg-amber-500',   label: 'Damaged',     val: discrepancies.filter((d) => d.auditResult === AuditResult.DAMAGED).length },
            { color: 'bg-red-500',     label: 'Missing',     val: discrepancies.filter((d) => d.auditResult === AuditResult.MISSING).length },
            { color: 'bg-slate-600',   label: 'Unreviewed',  val: items.length - reviewed.length },
          ].map(({ color, label, val }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-xs text-slate-500">{label} <span className="text-slate-300 font-semibold">{val}</span></span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 rounded-2xl border border-white/6 overflow-hidden"
          style={{ background: 'rgba(30,41,59,0.5)' }}>
          <div className="px-5 py-4 border-b border-white/6">
            <h2 className="text-sm font-semibold text-slate-200">Asset Checklist</h2>
            <p className="text-xs text-slate-500 mt-0.5">Mark each asset as Verified, Missing, or Damaged.</p>
          </div>
          <div className="divide-y divide-white/4">
            {items.map((item) => {
              const isReviewed = item.auditResult !== AuditResult.UNREVIEWED;
              return (
                <div
                  key={item.id}
                  className={`px-5 py-3.5 transition-colors ${
                    item.auditResult === AuditResult.VERIFIED ? 'bg-emerald-500/4' :
                    item.auditResult === AuditResult.MISSING  ? 'bg-red-500/4' :
                    item.auditResult === AuditResult.DAMAGED  ? 'bg-amber-500/4' :
                    'hover:bg-white/2'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border ${
                      isReviewed ? 'border-transparent bg-indigo-500' : 'border-white/15 bg-transparent'
                    }`}>
                      {isReviewed && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{item.assetName}</p>
                      <p className="text-xs text-slate-600">{item.serialNumber} · {item.location}</p>
                    </div>
                    <StatusBadge status={item.expectedStatus} size="sm" />
                    <div className="flex gap-1">
                      {RESULT_BUTTONS.map(({ result, label, styles, activeStyles }) => (
                        <button
                          key={result}
                          onClick={() => setResult(item.id, item.auditResult === result ? AuditResult.UNREVIEWED : result)}
                          disabled={isClosed}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all
                            ${item.auditResult === result ? activeStyles : styles}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {(item.auditResult === AuditResult.MISSING || item.auditResult === AuditResult.DAMAGED) && (
                    <div className="mt-2.5 ml-8 panel-enter">
                      <input
                        type="text"
                        value={notes[item.id] ?? ''}
                        onChange={(e) => setNotes((n) => ({ ...n, [item.id]: e.target.value }))}
                        disabled={isClosed}
                        placeholder={item.auditResult === AuditResult.MISSING ? 'Last known location or details…' : 'Describe the damage…'}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-white/5
                          text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/40 transition-colors"
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {items.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm">
                No assets found for the specified scope.
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-1">
          {discrepancies.length > 0 ? (
            <div className="rounded-2xl border border-red-500/25 overflow-hidden sticky top-0 panel-enter"
              style={{ background: 'rgba(30,20,20,0.6)' }}>
              <div className="px-5 py-4 border-b border-red-500/20"
                style={{ background: 'rgba(239,68,68,0.08)' }}>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <h2 className="text-sm font-semibold text-red-300">Discrepancy Report</h2>
                </div>
                <p className="text-xs text-red-500 mt-1">
                  {discrepancies.length} issue{discrepancies.length !== 1 ? 's' : ''} flagged.
                </p>
              </div>
              <div className="p-4 space-y-3">
                {discrepancies.map((item) => (
                  <div key={item.id} className={`p-3 rounded-xl border ${item.auditResult === AuditResult.MISSING ? 'border-red-500/25 bg-red-500/8' : 'border-amber-500/25 bg-amber-500/8'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-200 leading-snug">{item.assetName}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase flex-shrink-0 ${item.auditResult === AuditResult.MISSING ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {item.auditResult}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-0.5">{item.serialNumber}</p>
                    {notes[item.id] && <p className="text-[10px] text-slate-400 mt-1.5 italic">"{notes[item.id]}"</p>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/6 p-6 text-center" style={{ background: 'rgba(30,41,59,0.4)' }}>
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-300">No Discrepancies</p>
              <p className="text-xs text-slate-600 mt-1">All reviewed assets are accounted for.</p>
            </div>
          )}
        </div>
      </div>

      <Modal open={summaryModal} onClose={() => setSummaryModal(false)} title="Audit Cycle Complete" maxWidth="md">
        <div className="space-y-4">
          <div className="flex justify-center py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Verified',  val: verified.length,     color: 'text-emerald-400' },
              { label: 'Damaged',   val: discrepancies.filter((d) => d.auditResult === AuditResult.DAMAGED).length, color: 'text-amber-400' },
              { label: 'Missing',   val: discrepancies.filter((d) => d.auditResult === AuditResult.MISSING).length, color: 'text-red-400' },
            ].map(({ label, val, color }) => (
              <div key={label} className="p-3 rounded-xl bg-white/4 border border-white/8">
                <p className={`text-2xl font-bold tabular-nums ${color}`}>{val}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 text-center leading-relaxed">
            Audit Cycle <span className="font-mono text-slate-400">#{selectedCycle.id}</span> has been finalized and submitted.
          </p>
          <button onClick={() => setSummaryModal(false)} className="w-full py-2.5 text-sm font-semibold rounded-xl bg-white/8 text-slate-300 hover:bg-white/12 transition-colors">
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}
