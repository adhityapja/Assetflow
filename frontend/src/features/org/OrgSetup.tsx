import React, { useState, useEffect } from 'react';
import { UserService, DepartmentService, CategoryService } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';
import type { User, Department, AssetCategory } from '../../types';

export function OrgSetup() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'DEPARTMENTS' | 'CATEGORIES' | 'EMPLOYEES'>('DEPARTMENTS');

  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals State
  const [empModal, setEmpModal] = useState(false);
  const [deptModal, setDeptModal] = useState(false);
  const [catModal, setCatModal] = useState(false);

  // Form State
  const [newEmp, setNewEmp] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE' });
  const [newDept, setNewDept] = useState({ name: '', headUserId: '', parentId: '' });
  const [newCat, setNewCat] = useState({ name: '', description: '', customFields: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, dRes, cRes] = await Promise.all([
        UserService.getAllUsers(),
        DepartmentService.getAll(),
        CategoryService.getAll()
      ]);
      setUsers(uRes);
      setDepartments(dRes);
      setCategories(cRes);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Employee Handlers ──
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await UserService.create(newEmp);
      setUsers([...users, added]);
      setEmpModal(false);
      setNewEmp({ name: '', email: '', password: '', role: 'EMPLOYEE' });
    } catch (err) {
      console.error('Add user failed', err);
    }
  };

  const handleUpdateUser = async (userId: number, field: string, value: any) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;
    
    const payload = {
      role: field === 'role' ? value : userToUpdate.role,
      isActive: field === 'isActive' ? value : userToUpdate.isActive,
      departmentId: field === 'departmentId' ? (value ? Number(value) : null) : userToUpdate.departmentId
    };

    try {
      const updated = await UserService.updateUser(userId, payload);
      setUsers(users.map(u => u.id === userId ? { ...u, ...updated } : u));
    } catch (err) {
      console.error('Update user failed', err);
    }
  };

  // ── Department Handlers ──
  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { name: newDept.name };
      if (newDept.headUserId) payload.headUserId = Number(newDept.headUserId);
      if (newDept.parentId) payload.parentId = Number(newDept.parentId);
      
      const added = await DepartmentService.create(payload);
      setDepartments([...departments, added]);
      setDeptModal(false);
      setNewDept({ name: '', headUserId: '', parentId: '' });
    } catch (err) {
      console.error('Add dept failed', err);
    }
  };

  const handleToggleDeptActive = async (dept: Department) => {
    try {
      const updated = await DepartmentService.update(dept.id, { isActive: !dept.isActive });
      setDepartments(departments.map(d => d.id === dept.id ? updated : d));
    } catch (err) {
      console.error('Update dept failed', err);
    }
  };

  // ── Category Handlers ──
  const handleAddCat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await CategoryService.create(newCat);
      setCategories([...categories, added]);
      setCatModal(false);
      setNewCat({ name: '', description: '', customFields: '' });
    } catch (err) {
      console.error('Add category failed', err);
    }
  };

  const handleToggleCatActive = async (cat: AssetCategory) => {
    try {
      const updated = await CategoryService.update(cat.id, { isActive: !cat.isActive });
      setCategories(categories.map(c => c.id === cat.id ? updated : c));
    } catch (err) {
      console.error('Update category failed', err);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl text-red-400 font-semibold mb-2">Access Denied</h2>
        <p className="text-slate-400">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Organization Setup</h1>
          <p className="text-slate-500 text-sm mt-1">Manage master data and employee directory.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'DEPARTMENTS' && (
            <button onClick={() => setDeptModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20">+ New Department</button>
          )}
          {activeTab === 'CATEGORIES' && (
            <button onClick={() => setCatModal(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20">+ New Category</button>
          )}
          {activeTab === 'EMPLOYEES' && (
            <button onClick={() => setEmpModal(true)} className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-fuchsia-500/20">+ New Employee</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-px">
        <button 
          onClick={() => setActiveTab('DEPARTMENTS')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'DEPARTMENTS' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
        >
          Departments
        </button>
        <button 
          onClick={() => setActiveTab('CATEGORIES')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'CATEGORIES' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
        >
          Asset Categories
        </button>
        <button 
          onClick={() => setActiveTab('EMPLOYEES')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'EMPLOYEES' ? 'border-fuchsia-500 text-fuchsia-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
        >
          Employee Directory
        </button>
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-white/6 overflow-hidden bg-slate-800/50">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm animate-pulse">Loading data...</div>
        ) : (
          <div className="overflow-x-auto p-1">
            {activeTab === 'DEPARTMENTS' && (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-white/6">
                    <th className="px-5 py-3 font-semibold">Department Name</th>
                    <th className="px-5 py-3 font-semibold">Head</th>
                    <th className="px-5 py-3 font-semibold">Parent Dept</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {departments.map(d => (
                    <tr key={d.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-200">{d.name}</td>
                      <td className="px-5 py-4 text-slate-400">{users.find(u => u.id === d.headUserId)?.name || '—'}</td>
                      <td className="px-5 py-4 text-slate-400">{departments.find(p => p.id === d.parentId)?.name || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${d.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                          {d.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => handleToggleDeptActive(d)} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                          {d.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {departments.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500 text-sm">No departments found</td></tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'CATEGORIES' && (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-white/6">
                    <th className="px-5 py-3 font-semibold">Category Name</th>
                    <th className="px-5 py-3 font-semibold">Description</th>
                    <th className="px-5 py-3 font-semibold">Custom Fields JSON</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {categories.map(c => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-200">{c.name}</td>
                      <td className="px-5 py-4 text-slate-400">{c.description || '—'}</td>
                      <td className="px-5 py-4 text-slate-500 font-mono text-xs max-w-xs truncate" title={c.customFields}>{c.customFields || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${c.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => handleToggleCatActive(c)} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                          {c.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500 text-sm">No categories found</td></tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'EMPLOYEES' && (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-white/6">
                    <th className="px-5 py-3 font-semibold">Employee</th>
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">Department</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {users.map(u => (
                    <tr key={u.id} className={`hover:bg-white/5 transition-colors ${u.isActive === false ? 'opacity-50' : ''}`}>
                      <td className="px-5 py-3 font-medium text-slate-200">{u.name}</td>
                      <td className="px-5 py-3 text-slate-400">{u.email}</td>
                      <td className="px-5 py-3">
                        <select
                          className="bg-slate-800/80 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500"
                          value={u.departmentId || ''}
                          onChange={(e) => handleUpdateUser(u.id, 'departmentId', e.target.value)}
                        >
                          <option value="">-- No Dept --</option>
                          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <select
                          className="bg-slate-800/80 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500"
                          value={u.role}
                          onChange={(e) => handleUpdateUser(u.id, 'role', e.target.value)}
                          disabled={u.id === user?.id}
                        >
                          <option value="EMPLOYEE">EMPLOYEE</option>
                          <option value="DEPARTMENT_HEAD">DEPT HEAD</option>
                          <option value="ASSET_MANAGER">ASSET MANAGER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <select
                          className={`bg-slate-800/80 border text-xs rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 ${u.isActive !== false ? 'border-emerald-500/30 text-emerald-400' : 'border-rose-500/30 text-rose-400'}`}
                          value={u.isActive !== false ? 'true' : 'false'}
                          onChange={(e) => handleUpdateUser(u.id, 'isActive', e.target.value === 'true')}
                          disabled={u.id === user?.id}
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={deptModal} onClose={() => setDeptModal(false)} title="New Department" maxWidth="sm">
        <form onSubmit={handleAddDept} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Department Name</label>
            <input type="text" required value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-slate-200 focus:ring-1 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Department Head (Optional)</label>
            <select value={newDept.headUserId} onChange={e => setNewDept({...newDept, headUserId: e.target.value})} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-slate-200">
              <option value="">-- Select Head --</option>
              {users.map(u => <option key={u.id} value={u.id} style={{background:'#1e293b'}}>{u.name} ({u.role})</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={() => setDeptModal(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">Create Dept</button>
          </div>
        </form>
      </Modal>

      <Modal open={catModal} onClose={() => setCatModal(false)} title="New Asset Category" maxWidth="sm">
        <form onSubmit={handleAddCat} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Category Name</label>
            <input type="text" required value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-slate-200 focus:ring-1 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Description</label>
            <input type="text" value={newCat.description} onChange={e => setNewCat({...newCat, description: e.target.value})} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-slate-200 focus:ring-1 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Custom Fields (JSON format)</label>
            <textarea value={newCat.customFields} onChange={e => setNewCat({...newCat, customFields: e.target.value})} placeholder='{"warranty": "string", "os": "string"}' className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-white/10 bg-white/5 text-slate-200 focus:ring-1 focus:ring-emerald-500 h-24" />
          </div>
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={() => setCatModal(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">Create Category</button>
          </div>
        </form>
      </Modal>

      <Modal open={empModal} onClose={() => setEmpModal(false)} title="Add New Employee" maxWidth="sm">
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Full Name</label>
            <input type="text" required value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-slate-200 focus:ring-1 focus:ring-fuchsia-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Email Address</label>
            <input type="email" required value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-slate-200 focus:ring-1 focus:ring-fuchsia-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Password</label>
            <input type="password" required value={newEmp.password} onChange={e => setNewEmp({...newEmp, password: e.target.value})} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-slate-200 focus:ring-1 focus:ring-fuchsia-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Role</label>
            <select value={newEmp.role} onChange={e => setNewEmp({...newEmp, role: e.target.value})} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-slate-200">
              <option value="EMPLOYEE" style={{background: '#1e293b'}}>Employee</option>
              <option value="DEPARTMENT_HEAD" style={{background: '#1e293b'}}>Department Head</option>
              <option value="ASSET_MANAGER" style={{background: '#1e293b'}}>Asset Manager</option>
              <option value="ADMIN" style={{background: '#1e293b'}}>Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={() => setEmpModal(false)} className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white transition-colors">Create Employee</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
