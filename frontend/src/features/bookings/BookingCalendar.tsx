import { useState, useEffect } from 'react';
import { BookingService, extractApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { ConflictAlert } from '../../components/ConflictAlert';
import { BookingStatus } from '../../types';
import type { Booking } from '../../types';

import { AssetService } from '../../api/client';
import type { Asset } from '../../types';

// ── Timeline helpers ──
const TIMELINE_START_HOUR = 8;
const TIMELINE_END_HOUR   = 20;
const TIMELINE_HOURS      = TIMELINE_END_HOUR - TIMELINE_START_HOUR;

function timeToPercent(isoStr: string): number {
  const d = new Date(isoStr);
  const minutesFromStart = (d.getHours() - TIMELINE_START_HOUR) * 60 + d.getMinutes();
  return Math.max(0, Math.min(100, (minutesFromStart / (TIMELINE_HOURS * 60)) * 100));
}

function durationPercent(start: string, end: string): number {
  const s = new Date(start), e = new Date(end);
  const minutes = (e.getTime() - s.getTime()) / 60000;
  return Math.min(100, (minutes / (TIMELINE_HOURS * 60)) * 100);
}

const STATUS_TIMELINE_COLORS: Record<BookingStatus, string> = {
  [BookingStatus.COMPLETED]: 'bg-slate-600',
  [BookingStatus.ONGOING]:   'bg-emerald-600',
  [BookingStatus.UPCOMING]:  'bg-indigo-600',
  [BookingStatus.CANCELLED]: 'bg-red-800/50',
};

function BookingTimeline({ bookings }: { bookings: Booking[] }) {
  const hours = Array.from({ length: TIMELINE_HOURS + 1 }, (_, i) => TIMELINE_START_HOUR + i);

  return (
    <div className="space-y-1">
      {/* Hour labels */}
      <div className="relative h-5 ml-0">
        {hours.map((h) => (
          <span
            key={h}
            className="absolute text-[10px] text-slate-600 -translate-x-1/2"
            style={{ left: `${((h - TIMELINE_START_HOUR) / TIMELINE_HOURS) * 100}%` }}
          >
            {h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`}
          </span>
        ))}
      </div>

      {/* Hour gridlines + booking bars */}
      <div className="relative h-8 rounded-lg overflow-hidden" style={{ background: 'rgba(15,23,42,0.6)' }}>
        {/* Grid lines */}
        {hours.map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 w-px"
            style={{ left: `${((h - TIMELINE_START_HOUR) / TIMELINE_HOURS) * 100}%`, background: 'rgba(255,255,255,0.06)' }}
          />
        ))}

        {/* Current time indicator */}
        {(() => {
          const now = new Date();
          const nowH = now.getHours();
          if (nowH >= TIMELINE_START_HOUR && nowH <= TIMELINE_END_HOUR) {
            const pct = timeToPercent(now.toISOString());
            return (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
                style={{ left: `${pct}%` }}
              >
                <div className="absolute -top-0.5 -left-1 w-2 h-2 rounded-full bg-red-400" />
              </div>
            );
          }
          return null;
        })()}

        {/* Booking bars */}
        {bookings.map((b) => {
          const left = timeToPercent(b.startTime);
          const width = durationPercent(b.startTime, b.endTime);
          return (
            <div
              key={b.id}
              title={`${b.userName}: ${new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              className={`absolute top-1 bottom-1 rounded-md ${STATUS_TIMELINE_COLORS[b.status]} opacity-80
                hover:opacity-100 transition-opacity flex items-center px-1.5 cursor-default`}
              style={{ left: `${left}%`, width: `${Math.max(width, 1)}%` }}
            >
              <span className="text-[9px] font-semibold text-white truncate">{b.userName}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 pt-1">
        {([
          { s: BookingStatus.COMPLETED, label: 'Completed' },
          { s: BookingStatus.ONGOING,   label: 'Ongoing' },
          { s: BookingStatus.UPCOMING,  label: 'Upcoming' },
        ] as const).map(({ s, label }) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm ${STATUS_TIMELINE_COLORS[s]}`} />
            <span className="text-[10px] text-slate-500">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-red-400 inline-block" />
          <span className="text-[10px] text-slate-500">Now</span>
        </div>
      </div>
    </div>
  );
}

export function BookingCalendar() {
  const { user } = useAuth();
  const [bookableAssets, setBookableAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [bookingUserId, setBookingUserId] = useState(String(user?.id || '1'));
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const selectedAsset = bookableAssets.find((a) => a.id === selectedAssetId);
  const assetBookings = bookings.filter((b) => b.assetId === selectedAssetId);

  // Fetch bookable assets
  useEffect(() => {
    AssetService.getAll()
      .then(assets => {
        const shared = assets.filter(a => a.isSharedBookable);
        setBookableAssets(shared);
        if (shared.length > 0 && selectedAssetId === null) {
          setSelectedAssetId(shared[0].id);
        }
      })
      .catch(console.error);
  }, [selectedAssetId]);

  // Load from API
  useEffect(() => {
    if (selectedAssetId) {
      BookingService.getForAsset(selectedAssetId)
        .then(setBookings)
        .catch(console.error);
    }
  }, [selectedAssetId]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    if (!selectedAssetId) return;
    try {
      const booking = await BookingService.create({
        assetId: selectedAssetId,
        userId: Number(bookingUserId),
        startTime: new Date(startTime).toISOString(),
        endTime:   new Date(endTime).toISOString(),
      });
      setBookings((prev) => [...prev, booking]);
      setSuccess(true);
      setStartTime('');
      setEndTime('');
    } catch (err) {
      const e = extractApiError(err);
      setError(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      const canceled = await BookingService.cancel(bookingId);
      setBookings((prev) => prev.map(b => b.id === bookingId ? canceled : b));
    } catch (err) {
      console.error('Failed to cancel booking', err);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Resource Booking Calendar</h1>
        <p className="text-slate-500 text-sm mt-1">
          Schedule and visualize resource intervals. Conflicts are blocked by the greedy interval scheduler.
        </p>
      </div>

      {/* Asset Selector */}
      <div className="flex gap-2 flex-wrap">
        {bookableAssets.map((asset) => (
          <button
            key={asset.id}
            onClick={() => { setSelectedAssetId(asset.id); setError(null); setSuccess(false); }}
            className={`px-3.5 py-2 text-sm rounded-xl border font-medium transition-colors
              ${selectedAssetId === asset.id
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                : 'border-white/8 text-slate-400 hover:border-white/20 hover:text-slate-200 bg-white/3'
              }`}
          >
            <span className="text-[10px] mr-1.5 opacity-60">{asset.category}</span>
            {asset.name}
          </button>
        ))}
        {bookableAssets.length === 0 && (
          <span className="text-slate-500 text-sm italic py-2">Loading bookable assets...</span>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Timeline Panel */}
        <div className="xl:col-span-3 rounded-2xl border border-white/6 p-5 space-y-4"
          style={{ background: 'rgba(30,41,59,0.5)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">
                {selectedAsset?.name} — Today's Schedule
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {assetBookings.length} bookings · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <BookingTimeline bookings={assetBookings} />

          {/* Booking cards list */}
          <div className="space-y-2 mt-2">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Scheduled Intervals</p>
            {assetBookings.length === 0 ? (
              <p className="text-sm text-slate-600 italic py-4 text-center">No bookings for this asset today.</p>
            ) : (
              assetBookings.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/6 bg-white/3">
                  <div className={`w-1 h-10 rounded-full flex-shrink-0 ${STATUS_TIMELINE_COLORS[b.status]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{b.userName}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' – '}
                      {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={b.status} size="sm" />
                    {b.status === BookingStatus.UPCOMING && b.userId === user?.id && (
                      <button 
                        onClick={() => handleCancelBooking(b.id)}
                        className="text-xs font-semibold px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-1 ring-red-500/30 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    {b.status === BookingStatus.UPCOMING && b.userId === user?.id && (
                       <button
                        title="Simulate Reminder Notification"
                        className="text-xs font-semibold px-2 py-1 rounded bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 ring-1 ring-sky-500/30 transition-colors"
                        onClick={() => alert(`Reminder set! You will be notified 15 minutes before your slot starts at ${new Date(b.startTime).toLocaleTimeString()}`)}
                       >
                         Remind Me
                       </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Booking Form */}
        <div className="xl:col-span-2 rounded-2xl border border-white/6 p-5 space-y-4"
          style={{ background: 'rgba(30,41,59,0.5)' }}>
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Request a Time Slot</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Conflicts are validated server-side via the greedy interval algorithm.
            </p>
          </div>

          {/* Alerts */}
          {error?.status === 409 && (
            <ConflictAlert
              type={409}
              message={`Time slot overlap detected. ${error.message}. The requested interval conflicts with an existing booking on this resource.`}
              onDismiss={() => setError(null)}
            />
          )}
          {error && error.status !== 409 && (
            <ConflictAlert
              type="generic"
              message={error.message}
              onDismiss={() => setError(null)}
            />
          )}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 text-sm font-medium text-center panel-enter">
              ✓ Booking confirmed. Slot reserved.
            </div>
          )}

          <form onSubmit={handleBooking} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                User ID
              </label>
              <input
                type="number"
                value={bookingUserId}
                onChange={(e) => setBookingUserId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5
                  text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50
                  focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5
                  text-slate-200 focus:outline-none focus:border-indigo-500/50
                  focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                End Time
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5
                  text-slate-200 focus:outline-none focus:border-indigo-500/50
                  focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              />
            </div>

            {/* Duration preview */}
            {startTime && endTime && new Date(endTime) > new Date(startTime) && (
              <div className="p-2.5 rounded-lg bg-indigo-500/8 border border-indigo-500/20 text-xs text-indigo-400">
                Duration: {Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000)} minutes
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 text-sm font-semibold rounded-xl
                bg-indigo-600 hover:bg-indigo-500 text-white transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Checking availability…' : 'Book Slot'}
            </button>
          </form>

          {/* Info box */}
          <div className="p-3 rounded-xl border border-white/6 bg-white/3">
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="text-slate-400 font-semibold">How it works:</span> The backend runs a JPQL greedy interval query on submission. Any overlap with an existing <span className="text-sky-400">UPCOMING</span> or <span className="text-emerald-400">ONGOING</span> booking will be rejected with a 409 Conflict.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}