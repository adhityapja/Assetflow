import { useState, useEffect } from 'react';
import { AssetService, MaintenanceService, extractApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { ConflictAlert } from '../../components/ConflictAlert';
import { Modal } from '../../components/Modal';
import { AssetStatus } from '../../types';
import type { Asset } from '../../types';

export function AssetAllocation() {
  const { user } = useAuth();
  const STATUS_FILTER_OPTIONS = ['ALL', ...Object.values(AssetStatus)];
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filtered, setFiltered] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Allocation form state
  const [allocModal, setAllocModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [allocating, setAllocating] = useState(false);
  const [allocError, setAllocError] = useState<{ status: number; message: string } | null>(null);
  const [allocSuccess, setAllocSuccess] = useState(false);

  // Transfer request modal
  const [transferModal, setTransferModal] = useState(false);
  const [transferReason, setTransferReason] = useState('');
  const [transferSubmitting, setTransferSubmitting] = useState(false);
  const [transferDone, setTransferDone] = useState(false);

  // Add Asset Modal
  const [addModal, setAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', serialNumber: '', category: 'Electronics', location: '', isSharedBookable: false });
  const [adding, setAdding] = useState(false);

  // Maintenance request modal
  const [maintenanceModal, setMaintenanceModal] = useState(false);
  const [maintenanceDesc, setMaintenanceDesc] = useState('');
  const [maintenancePriority, setMaintenancePriority] = useState('MEDIUM');
  const [maintenanceSubmitting, setMaintenanceSubmitting] = useState(false);

  // Filter effect
  useEffect(() => {
    let list = assets;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) => a.name.toLowerCase().includes(q) || (a.serialNumber || a.assetTag || '').toLowerCase().includes(q) || a.location.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'ALL') {
      list = list.filter((a) => a.status === statusFilter);
    }
    setFiltered(list);
  }, [search, statusFilter, assets]);

  // Load from API
  useEffect(() => {
    AssetService.getAll()
      .then(setAssets)
      .catch((err) => console.error('Failed to load assets', err));
  }, []);

  const openAllocation = (asset: Asset) => {
    setSelectedAsset(asset);
    setAllocError(null);
    setAllocSuccess(false);
    setUserId('');
    setUserName('');
    setAllocModal(true);
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setAllocating(true);
    setAllocError(null);
    try {
      const updated = await AssetService.allocate(selectedAsset.id, Number(userId));
      setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setAllocSuccess(true);
      setTimeout(() => setAllocModal(false), 1200);
    } catch (err) {
      const e = extractApiError(err);
      setAllocError(e);
    } finally {
      setAllocating(false);
    }
  };

  const handleTransferRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setTransferSubmitting(true);
    try {
      await AssetService.requestTransfer(selectedAsset.id, 1, transferReason);
      setTransferDone(true);
    } catch {
      // optimistic — show done anyway
      setTransferDone(true);
    } finally {
      setTransferSubmitting(false);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const added = await AssetService.create(newAsset);
      setAssets((prev) => [...prev, added]);
      setAddModal(false);
      setNewAsset({ name: '', serialNumber: '', category: 'Electronics', location: '', isSharedBookable: false });
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const openMaintenance = (asset: Asset) => {
    setSelectedAsset(asset);
    setMaintenanceDesc('');
    setMaintenancePriority('MEDIUM');
    setMaintenanceModal(true);
  };

  const handleMaintenanceRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !user) return;
    setMaintenanceSubmitting(true);
    try {
      await MaintenanceService.create({
        assetId: selectedAsset.id,
        requesterId: user.id,
        description: maintenanceDesc,
        priority: maintenancePriority
      });
      setMaintenanceModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setMaintenanceSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Page header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Asset Allocation Engine</h1>
          <p className="text-slate-500 text-sm mt-1">
            Assign, track, and transfer assets across your organization.
          </p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER') && (
          <button onClick={() => setAddModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all">
            + New Asset
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-52">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search assets, serial, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5
              text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50
              focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-slate-300
            focus:outline-none focus:border-indigo-500/50 transition-colors"
        >
          {STATUS_FILTER_OPTIONS.map((s) => (
            <option key={s} value={s} style={{ background: '#1e293b' }}>
              {s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>

        <span className="text-xs text-slate-600 font-medium ml-auto">
          {filtered.length} of {assets.length} assets
        </span>
      </div>

      {/* Asset Table */}
      <div className="rounded-2xl border border-white/6 overflow-hidden"
        style={{ background: 'rgba(30,41,59,0.5)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(15,23,42,0.5)' }}>
                {['Asset', 'Serial No.', 'Category', 'Location', 'Status', 'Assigned To', 'Action'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-600 text-sm">
                    No assets match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((asset) => (
                  <tr key={asset.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-200">{asset.name}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{asset.serialNumber}</td>
                    <td className="px-5 py-3.5 text-slate-400">{asset.category}</td>
                    <td className="px-5 py-3.5 text-slate-400">{asset.location}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={asset.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">
                      {asset.assignedUserName ?? <span className="text-slate-700">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      {asset.status === AssetStatus.AVAILABLE ? (
                        (user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER' || user?.role === 'DEPARTMENT_HEAD') ? (
                          <button
                            onClick={() => openAllocation(asset)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg
                              bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30
                              hover:bg-indigo-500/30 transition-colors"
                          >
                            Allocate
                          </button>
                        ) : (
                          <span className="text-xs text-slate-700">—</span>
                        )
                      ) : asset.status === AssetStatus.ALLOCATED ? (
                        <div className="flex gap-2 items-center">
                          {(user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER' || user?.role === 'DEPARTMENT_HEAD') && (
                            <button
                              onClick={() => openAllocation(asset)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg
                                bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30
                                hover:bg-amber-500/25 transition-colors"
                            >
                              Reassign
                            </button>
                          )}
                          {asset.assignedUserId === user?.id && (
                            <button
                              onClick={() => openMaintenance(asset)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg
                                bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30
                                hover:bg-rose-500/25 transition-colors"
                            >
                              Report Issue
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-700">N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Allocation Modal ── */}
      <Modal
        open={allocModal}
        onClose={() => setAllocModal(false)}
        title={`Allocate: ${selectedAsset?.name ?? ''}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          {/* Asset summary */}
          {selectedAsset && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-white/3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200">{selectedAsset.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{selectedAsset.serialNumber} · {selectedAsset.location}</p>
              </div>
              <StatusBadge status={selectedAsset.status} size="sm" />
            </div>
          )}

          {/* Conflict / success alerts */}
          {allocError?.status === 409 && (
            <ConflictAlert
              type={409}
              message={`This asset is already allocated to ${selectedAsset?.assignedUserName ?? 'another user'}. You cannot double-allocate. Submit a Transfer Request instead.`}
              onDismiss={() => setAllocError(null)}
              action={{
                label: 'Open Transfer Request',
                onClick: () => { setAllocModal(false); setTransferModal(true); setTransferDone(false); },
              }}
            />
          )}
          {allocError && allocError.status !== 409 && (
            <ConflictAlert
              type="generic"
              message={allocError.message}
              onDismiss={() => setAllocError(null)}
            />
          )}
          {allocSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 text-sm font-medium text-center">
              ✓ Asset successfully allocated
            </div>
          )}

          {/* Form */}
          {!allocSuccess && (
            <form onSubmit={handleAllocate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  User ID
                </label>
                <input
                  type="number"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  placeholder="Enter employee ID"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5
                    text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50
                    focus:ring-1 focus:ring-indigo-500/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  User Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Arjun Mehta"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5
                    text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50
                    focus:ring-1 focus:ring-indigo-500/30 transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setAllocModal(false)}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-white/10
                    text-slate-400 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={allocating}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl
                    bg-indigo-600 hover:bg-indigo-500 text-white transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {allocating ? 'Allocating…' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* ── Transfer Request Modal ── */}
      <Modal
        open={transferModal}
        onClose={() => setTransferModal(false)}
        title="Transfer Request"
        maxWidth="md"
      >
        {transferDone ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-200">Transfer Request Submitted</p>
            <p className="text-xs text-slate-500">The current asset owner will be notified. An admin will process the request.</p>
            <button
              onClick={() => setTransferModal(false)}
              className="mt-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-white/8
                text-slate-300 hover:bg-white/12 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleTransferRequest} className="space-y-4">
            {selectedAsset && (
              <div className="p-3 rounded-xl border border-amber-500/25 bg-amber-500/8 text-sm text-amber-300">
                <p className="font-medium">Currently allocated to: {selectedAsset.assignedUserName ?? 'Unknown'}</p>
                <p className="text-xs text-amber-500 mt-0.5">A transfer request will notify the current holder and await admin approval.</p>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Business Justification
              </label>
              <textarea
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                required
                rows={4}
                placeholder="Explain why this asset transfer is required…"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5
                  text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50
                  focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTransferModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-white/10
                  text-slate-400 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={transferSubmitting}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl
                  bg-amber-600 hover:bg-amber-500 text-white transition-colors
                  disabled:opacity-50"
              >
                {transferSubmitting ? 'Submitting…' : 'Submit Transfer Request'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── Add Asset Modal ── */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Register New Asset" maxWidth="md">
        <form onSubmit={handleAddAsset} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Asset Name</label>
              <input type="text" required value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-slate-200 focus:ring-1 focus:ring-indigo-500/30 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Serial Number</label>
              <input type="text" required value={newAsset.serialNumber} onChange={e => setNewAsset({...newAsset, serialNumber: e.target.value})} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-slate-200 focus:ring-1 focus:ring-indigo-500/30 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Category</label>
              <select value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value})} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-slate-200 focus:ring-1 focus:ring-indigo-500/30 transition-colors">
                <option value="Electronics" style={{background: '#1e293b'}}>Electronics</option>
                <option value="Furniture" style={{background: '#1e293b'}}>Furniture</option>
                <option value="Vehicles" style={{background: '#1e293b'}}>Vehicles</option>
                <option value="Facilities" style={{background: '#1e293b'}}>Facilities</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Location</label>
              <input type="text" required value={newAsset.location} onChange={e => setNewAsset({...newAsset, location: e.target.value})} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-slate-200 focus:ring-1 focus:ring-indigo-500/30 transition-colors" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="shared" checked={newAsset.isSharedBookable} onChange={e => setNewAsset({...newAsset, isSharedBookable: e.target.checked})} className="rounded bg-white/5 border-white/10 text-indigo-500 focus:ring-indigo-500/30" />
            <label htmlFor="shared" className="text-sm text-slate-300">Allow shared booking of this resource</label>
          </div>
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={() => setAddModal(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" disabled={adding} className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50">{adding ? 'Saving...' : 'Save Asset'}</button>
          </div>
        </form>
      </Modal>

      {/* ── Maintenance Modal ── */}
      <Modal open={maintenanceModal} onClose={() => setMaintenanceModal(false)} title="Report Maintenance Issue" maxWidth="md">
        <form onSubmit={handleMaintenanceRequest} className="space-y-4">
          {selectedAsset && (
            <div className="p-3 rounded-xl border border-rose-500/25 bg-rose-500/8 text-sm text-rose-300">
              <p className="font-medium">Reporting issue for: {selectedAsset.name}</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Issue Description</label>
            <textarea required rows={3} value={maintenanceDesc} onChange={(e) => setMaintenanceDesc(e.target.value)} placeholder="Describe the issue..." className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-slate-200 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Priority</label>
            <select value={maintenancePriority} onChange={(e) => setMaintenancePriority(e.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-slate-200 focus:ring-1 focus:ring-indigo-500/30 transition-colors">
              <option value="LOW" style={{background: '#1e293b'}}>Low</option>
              <option value="MEDIUM" style={{background: '#1e293b'}}>Medium</option>
              <option value="HIGH" style={{background: '#1e293b'}}>High</option>
              <option value="CRITICAL" style={{background: '#1e293b'}}>Critical</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={() => setMaintenanceModal(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" disabled={maintenanceSubmitting} className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50">{maintenanceSubmitting ? 'Submitting...' : 'Submit Request'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
