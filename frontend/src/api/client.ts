import axios, { AxiosError } from 'axios';
import type {
  Asset,
  Booking,
  CreateBookingPayload,
  MaintenanceRequest,
  OverdueReturn,
  UpdateMaintenanceStatusPayload,
  AuditBatchPayload,
  ApiErrorResponse,
  ActivityLog,
  ReportDTO,
  Notification
} from '../types';

// ─────────────────────────────────────────────
// Centralized Axios Instance
// ─────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: normalize error shape
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      // Clear token and optionally redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────
// ── AuthService ──
export const AuthService = {
  login: async (payload: any) => {
    const res = await apiClient.post('/auth/login', payload);
    return res.data;
  },
  signup: async (payload: any) => {
    const res = await apiClient.post('/auth/signup', payload);
    return res.data;
  },
};

// ── MetricsService ──
export const MetricsService = {
  getDashboardMetrics: async () => {
    const res = await apiClient.get('/metrics/dashboard');
    return res.data;
  },
};

// ── UserService ──
export const UserService = {
  getAllUsers: async () => {
    const res = await apiClient.get('/users');
    return res.data;
  },
  updateRole: async (id: number, role: string) => {
    const res = await apiClient.patch(`/users/${id}/role`, { role });
    return res.data;
  },
  updateUser: async (id: number, payload: any) => {
    const res = await apiClient.put(`/users/${id}`, payload);
    return res.data;
  },
  create: async (payload: any) => {
    const res = await apiClient.post('/users', payload);
    return res.data;
  },
};

// ─────────────────────────────────────────────
// Department API
// ─────────────────────────────────────────────
export const DepartmentService = {
  getAll: async () => {
    const { data } = await apiClient.get('/departments');
    return data;
  },
  create: async (payload: { name: string; headUserId?: number; parentId?: number }) => {
    const { data } = await apiClient.post('/departments', payload);
    return data;
  },
  update: async (id: number, payload: { name?: string; headUserId?: number; parentId?: number; isActive?: boolean }) => {
    const { data } = await apiClient.put(`/departments/${id}`, payload);
    return data;
  },
};

// ─────────────────────────────────────────────
// Category API
// ─────────────────────────────────────────────
export const CategoryService = {
  getAll: async () => {
    const { data } = await apiClient.get('/categories');
    return data;
  },
  create: async (payload: { name: string; description?: string; customFields?: string }) => {
    const { data } = await apiClient.post('/categories', payload);
    return data;
  },
  update: async (id: number, payload: { name?: string; description?: string; customFields?: string; isActive?: boolean }) => {
    const { data } = await apiClient.put(`/categories/${id}`, payload);
    return data;
  },
};

// ── Asset Service ──
// ─────────────────────────────────────────────
export const AssetService = {
  /** Fetch all assets (optionally filtered by status) */
  getAll: async (): Promise<Asset[]> => {
    const res = await apiClient.get<Asset[]>('/assets');
    return res.data;
  },

  create: async (payload: any): Promise<Asset> => {
    const res = await apiClient.post<Asset>('/assets', payload);
    return res.data;
  },

  /** Allocate an asset to a user — throws 409 if already ALLOCATED */
  allocate: async (assetId: number, userId: number): Promise<Asset> => {
    const res = await apiClient.post<Asset>(`/assets/${assetId}/allocate/${userId}`);
    return res.data;
  },

  /** De-allocate / return an asset */
  deallocate: async (assetId: number): Promise<Asset> => {
    const res = await apiClient.post<Asset>(`/assets/${assetId}/deallocate`);
    return res.data;
  },

  /** Request a transfer when asset is already allocated */
  requestTransfer: async (assetId: number, requesterId: number, reason: string) => {
    const res = await apiClient.post(`/assets/${assetId}/transfer-request`, {
      requesterId,
      reason,
    });
    return res.data;
  },
};

// ─────────────────────────────────────────────
// Booking Service
// ─────────────────────────────────────────────
export const BookingService = {
  /** Get all bookings for a specific asset */
  getForAsset: async (assetId: number): Promise<Booking[]> => {
    const res = await apiClient.get<Booking[]>(`/bookings?assetId=${assetId}`);
    return res.data;
  },

  /** Get all bookings (system-wide) */
  getAll: async (): Promise<Booking[]> => {
    const res = await apiClient.get<Booking[]>('/bookings');
    return res.data;
  },

  /** Create a new booking — throws 409 if interval overlaps */
  create: async (payload: CreateBookingPayload): Promise<Booking> => {
    const res = await apiClient.post<Booking>('/bookings', payload);
    return res.data;
  },

  /** Cancel a booking */
  cancel: async (bookingId: number): Promise<Booking> => {
    const res = await apiClient.patch<Booking>(`/bookings/${bookingId}/cancel`);
    return res.data;
  },
};

// ─────────────────────────────────────────────
// Maintenance Service
// ─────────────────────────────────────────────
export const MaintenanceService = {
  /** Fetch all maintenance requests */
  getAll: async (): Promise<MaintenanceRequest[]> => {
    const res = await apiClient.get<MaintenanceRequest[]>('/maintenance');
    return res.data;
  },

  /** Update request status — throws 400 on illegal state machine jump */
  updateStatus: async (
    requestId: number,
    payload: UpdateMaintenanceStatusPayload
  ): Promise<MaintenanceRequest> => {
    const res = await apiClient.patch<MaintenanceRequest>(
      `/maintenance/${requestId}/status`,
      payload
    );
    return res.data;
  },

  /** Create a new maintenance request */
  create: async (payload: { assetId: number; requesterId: number; description: string; priority: string }): Promise<MaintenanceRequest> => {
    const res = await apiClient.post<MaintenanceRequest>('/maintenance', payload);
    return res.data;
  },
};

// ─────────────────────────────────────────────
// Dashboard / KPI Service
// ─────────────────────────────────────────────
export const DashboardService = {
  getOverdueReturns: async (): Promise<OverdueReturn[]> => {
    const res = await apiClient.get<OverdueReturn[]>('/dashboard/overdue');
    return res.data;
  },
};

// ─────────────────────────────────────────────
// Audit Service
// ─────────────────────────────────────────────
export const AuditService = {
  /** Get all audit cycles */
  getAllCycles: async () => {
    const res = await apiClient.get('/audit/cycles');
    return res.data;
  },

  /** Create a new audit cycle */
  createCycle: async (payload: { name: string; departmentId?: number; location?: string }) => {
    const res = await apiClient.post('/audit/cycles', payload);
    return res.data;
  },

  /** Get records for a specific cycle */
  getRecordsForCycle: async (cycleId: number) => {
    const res = await apiClient.get(`/audit/cycles/${cycleId}/records`);
    return res.data;
  },

  /** Submit a bulk audit batch */
  submitBatch: async (payload: AuditBatchPayload) => {
    const res = await apiClient.post('/audit/submit', payload);
    return res.data;
  },
  
  /** Close an audit cycle */
  closeCycle: async (cycleId: number) => {
    const res = await apiClient.patch(`/audit/cycles/${cycleId}/close`);
    return res.data;
  },
};

// ─────────────────────────────────────────────
// Reports & Analytics Service
// ─────────────────────────────────────────────
export const ReportService = {
  getReports: async (): Promise<ReportDTO> => {
    const res = await apiClient.get<ReportDTO>('/reports');
    return res.data;
  },
  exportReport: async () => {
    const res = await apiClient.get('/reports/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'assetflow_report.csv');
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  },
};

// ─────────────────────────────────────────────
// Activity Log Service
// ─────────────────────────────────────────────
export const ActivityLogService = {
  getAllLogs: async (): Promise<ActivityLog[]> => {
    const res = await apiClient.get<ActivityLog[]>('/activity-logs');
    return res.data;
  },
};

// ─────────────────────────────────────────────
// Notification Service
// ─────────────────────────────────────────────
export const NotificationService = {
  getUserNotifications: async (unreadOnly: boolean = false): Promise<Notification[]> => {
    const res = await apiClient.get<Notification[]>(`/notifications?unreadOnly=${unreadOnly}`);
    return res.data;
  },
  markAsRead: async (id: number): Promise<Notification> => {
    const res = await apiClient.patch<Notification>(`/notifications/${id}/read`);
    return res.data;
  },
};

// ─────────────────────────────────────────────
// Utility: extract readable message from Axios error
// ─────────────────────────────────────────────
export function extractApiError(err: unknown): { status: number; message: string } {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? 0;
    const data = err.response?.data as ApiErrorResponse | string | undefined;
    const message =
      typeof data === 'string'
        ? data
        : (data as ApiErrorResponse)?.message ?? err.message ?? 'Unknown error';
    return { status, message };
  }
  return { status: 0, message: String(err) };
}