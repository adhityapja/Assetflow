import { useState, useEffect } from 'react';
import { ActivityLogService, NotificationService } from '../../api/client';
import type { ActivityLog, Notification } from '../../types';

export function ActivityLogScreen() {
  const [activeTab, setActiveTab] = useState<'notifications' | 'audit'>('notifications');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await NotificationService.getUserNotifications(false);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await ActivityLogService.getAllLogs();
      setLogs(data);
    } catch (error) {
      console.error('Failed to load activity logs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotifications();
    } else {
      fetchLogs();
    }
  }, [activeTab]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Activity & Notifications</h1>
        <p className="text-slate-500 text-sm mt-1">Keep track of all actions and alerts.</p>
      </div>

      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'notifications' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          My Notifications
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'audit' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Global Audit Logs
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading...</div>
      ) : activeTab === 'notifications' ? (
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-xl">
              No notifications at the moment.
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`p-4 rounded-xl border transition-colors ${n.isRead ? 'bg-slate-800/20 border-white/5' : 'bg-slate-800/80 border-indigo-500/30'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        n.type === 'ALERT' ? 'bg-rose-500/20 text-rose-400' :
                        n.type === 'WARNING' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {n.type}
                      </span>
                      <span className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <p className={`text-sm ${n.isRead ? 'text-slate-400' : 'text-slate-200'}`}>{n.message}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden bg-slate-800/30">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-200">{log.entity}</td>
                  <td className="px-4 py-3 text-slate-400">{log.details || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
