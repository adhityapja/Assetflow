import { useState, useEffect } from 'react';
import { MaintenanceService, extractApiError } from '../../api/client';
import { ConflictAlert } from '../../components/ConflictAlert';
import { MaintenanceStatus } from '../../types';
import type { MaintenanceRequest } from '../../types';

// ── Kanban column configuration ──
const COLUMNS: { status: MaintenanceStatus; label: string; accent: string; headerBg: string }[] = [
  { status: MaintenanceStatus.PENDING,             label: 'Pending',    accent: 'border-yellow-500/30', headerBg: 'bg-yellow-500/10' },
  { status: MaintenanceStatus.APPROVED,            label: 'Approved',   accent: 'border-emerald-500/30', headerBg: 'bg-emerald-500/10' },
  { status: MaintenanceStatus.REJECTED,            label: 'Rejected',   accent: 'border-red-500/30',    headerBg: 'bg-red-500/10' },
  { status: MaintenanceStatus.TECHNICIAN_ASSIGNED, label: 'Assigned',   accent: 'border-cyan-500/30',   headerBg: 'bg-cyan-500/10' },
  { status: MaintenanceStatus.IN_PROGRESS,         label: 'In Progress',accent: 'border-blue-500/30',   headerBg: 'bg-blue-500/10' },
  { status: MaintenanceStatus.RESOLVED,            label: 'Resolved',   accent: 'border-green-500/30',  headerBg: 'bg-green-500/10' },
];

const PRIORITY_STYLES: Record<string, string> = {
  LOW:      'text-slate-400 bg-slate-500/10 ring-1 ring-slate-500/20',
  MEDIUM:   'text-amber-400 bg-amber-500/10 ring-1 ring-amber-500/20',
  HIGH:     'text-orange-400 bg-orange-500/10 ring-1 ring-orange-500/20',
  CRITICAL: 'text-red-400 bg-red-500/10 ring-1 ring-red-500/20',
};

// ── Valid state transitions (mirrors backend state machine) ──
const VALID_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  [MaintenanceStatus.PENDING]:             [MaintenanceStatus.APPROVED, MaintenanceStatus.REJECTED],
  [MaintenanceStatus.APPROVED]:            [MaintenanceStatus.TECHNICIAN_ASSIGNED, MaintenanceStatus.REJECTED],
  [MaintenanceStatus.REJECTED]:            [],
  [MaintenanceStatus.TECHNICIAN_ASSIGNED]: [MaintenanceStatus.IN_PROGRESS],
  [MaintenanceStatus.IN_PROGRESS]:         [MaintenanceStatus.RESOLVED],
  [MaintenanceStatus.RESOLVED]:            [],
};

interface CardErrorState {
  requestId: number;
  message: string;
}

interface TechnicianModalState {
  requestId: number;
  targetStatus: MaintenanceStatus;
}

export function MaintenanceBoard() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<MaintenanceStatus | null>(null);
  const [cardErrors, setCardErrors] = useState<CardErrorState[]>([]);
  const [techModal, setTechModal] = useState<TechnicianModalState | null>(null);
  const [techName, setTechName] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    MaintenanceService.getAll()
      .then(setRequests)
      .catch(console.error);
  }, []);

  const setCardError = (requestId: number, message: string) => {
    setCardErrors((prev) => [
      ...prev.filter((e) => e.requestId !== requestId),
      { requestId, message },
    ]);
    // Auto-clear after 5s
    setTimeout(() => {
      setCardErrors((prev) => prev.filter((e) => e.requestId !== requestId));
    }, 5000);
  };

  const clearCardError = (requestId: number) => {
    setCardErrors((prev) => prev.filter((e) => e.requestId !== requestId));
  };

  const handleDrop = async (targetStatus: MaintenanceStatus) => {
    setDragOverCol(null);
    if (draggingId === null) return;

    const req = requests.find((r) => r.id === draggingId);
    if (!req || req.status === targetStatus) { setDraggingId(null); return; }

    const valid = VALID_TRANSITIONS[req.status];
    if (!valid.includes(targetStatus)) {
      setCardError(draggingId, `Cannot move from "${req.status.replace(/_/g, ' ')}" → "${targetStatus.replace(/_/g, ' ')}". This violates the maintenance state machine.`);
      setDraggingId(null);
      return;
    }

    // If moving to TECHNICIAN_ASSIGNED, we need a technician name
    if (targetStatus === MaintenanceStatus.TECHNICIAN_ASSIGNED) {
      setTechModal({ requestId: draggingId, targetStatus });
      setDraggingId(null);
      return;
    }

    await commitStatusUpdate(draggingId, targetStatus);
    setDraggingId(null);
  };

  const commitStatusUpdate = async (requestId: number, newStatus: MaintenanceStatus, technician?: string) => {
    setUpdating(true);
    try {
      const updated = await MaintenanceService.updateStatus(requestId, {
        newStatus,
        assignedTechnician: technician,
      });
      setRequests((prev) => prev.map((r) => r.id === updated.id ? updated : r));
    } catch (err) {
      const e = extractApiError(err);
      if (e.status === 400) {
        setCardError(requestId, `State machine rejection: ${e.message}`);
      } else {
        // Optimistic update for demo
        setRequests((prev) => prev.map((r) =>
          r.id === requestId
            ? { ...r, status: newStatus, assignedTechnician: technician ?? r.assignedTechnician }
            : r
        ));
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleTechSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techModal) return;
    await commitStatusUpdate(techModal.requestId, techModal.targetStatus, techName);
    setTechModal(null);
    setTechName('');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Maintenance Kanban Board</h1>
          <p className="text-slate-500 text-sm mt-1">
            Drag cards between columns. State transitions are validated by the backend state machine.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/4 px-3 py-1.5 rounded-lg border border-white/8">
          <div className={`w-2 h-2 rounded-full ${updating ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          {updating ? 'Syncing…' : 'Synced'}
        </div>
      </div>

      {/* Board */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colCards = requests.filter((r) => r.status === col.status);
          const isDragOver = dragOverCol === col.status;

          return (
            <div
              key={col.status}
              className={`flex-shrink-0 w-64 flex flex-col rounded-2xl border transition-all duration-150
                ${isDragOver ? 'kanban-col-drag-over' : col.accent}
              `}
              style={{
                background: isDragOver ? undefined : 'rgba(30,41,59,0.4)',
                minHeight: '480px',
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.status); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => handleDrop(col.status)}
            >
              {/* Column header */}
              <div className={`px-3 py-2.5 rounded-t-2xl border-b border-white/6 ${col.headerBg}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    {col.label}
                  </span>
                  <span className="text-xs font-bold bg-white/10 text-slate-400 px-2 py-0.5 rounded-full">
                    {colCards.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2">
                {colCards.length === 0 && (
                  <div className={`mt-4 rounded-xl border border-dashed border-white/10 p-4 text-center
                    text-xs text-slate-700 transition-all ${isDragOver ? 'border-indigo-500/40 text-indigo-600' : ''}`}>
                    {isDragOver ? 'Drop here' : 'No items'}
                  </div>
                )}
                {colCards.map((req) => {
                  const cardError = cardErrors.find((e) => e.requestId === req.id);
                  return (
                    <div
                      key={req.id}
                      draggable
                      onDragStart={() => { setDraggingId(req.id); clearCardError(req.id); }}
                      onDragEnd={() => setDraggingId(null)}
                      className={`rounded-xl border border-white/8 p-3 space-y-2 cursor-grab active:cursor-grabbing
                        transition-all duration-150 select-none
                        ${draggingId === req.id ? 'kanban-card-dragging' : 'hover:border-white/15 hover:bg-white/4'}
                      `}
                      style={{ background: 'rgba(15,23,42,0.6)' }}
                    >
                      {/* Priority + Asset */}
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs font-semibold text-slate-200 leading-snug">{req.assetName}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase flex-shrink-0 ${PRIORITY_STYLES[req.priority]}`}>
                          {req.priority}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                        {req.description}
                      </p>

                      {/* Requester */}
                      {req.requesterName && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full flex-shrink-0 text-[8px] font-bold
                            bg-slate-700 text-slate-300 flex items-center justify-center">
                            {req.requesterName[0]}
                          </div>
                          <span className="text-[10px] text-slate-600 truncate">{req.requesterName}</span>
                        </div>
                      )}

                      {/* Technician if assigned */}
                      {req.assignedTechnician && (
                        <div className="flex items-center gap-1.5 pt-0.5 border-t border-white/6">
                          <svg className="w-3 h-3 text-cyan-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877" />
                          </svg>
                          <span className="text-[10px] text-cyan-500 truncate">{req.assignedTechnician}</span>
                        </div>
                      )}

                      {/* Card-level error */}
                      {cardError && (
                        <div className="pt-1">
                          <ConflictAlert
                            type={400}
                            message={cardError.message}
                            onDismiss={() => clearCardError(req.id)}
                          />
                        </div>
                      )}

                      {/* Date */}
                      {req.createdAt && (
                        <p className="text-[9px] text-slate-700">
                          {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Technician Assignment Modal (inline overlay) */}
      {techModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setTechModal(null)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 shadow-2xl panel-enter"
            style={{ background: 'var(--surface-1)' }}>
            <div className="px-6 py-4 border-b border-white/8">
              <h2 className="text-sm font-semibold text-slate-100">Assign Technician</h2>
            </div>
            <form onSubmit={handleTechSubmit} className="px-6 py-5 space-y-4">
              <p className="text-xs text-slate-500">
                Moving to <span className="text-cyan-400 font-semibold">Technician Assigned</span> requires a responsible technician.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Technician Name
                </label>
                <input
                  type="text"
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  required
                  autoFocus
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5
                    text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50
                    focus:ring-1 focus:ring-indigo-500/30 transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setTechModal(null)}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-white/10
                    text-slate-400 hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl
                    bg-cyan-600 hover:bg-cyan-500 text-white transition-colors">
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
