// ─────────────────────────────────────────────
// Backend Enum Mirror — must match Java enums exactly
// Uses const objects instead of TypeScript enums
// to satisfy erasableSyntaxOnly: true (TS 6)
// ─────────────────────────────────────────────

export const AssetStatus = {
  AVAILABLE:         'AVAILABLE',
  ALLOCATED:         'ALLOCATED',
  RESERVED:          'RESERVED',
  UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
  LOST:              'LOST',
  RETIRED:           'RETIRED',
  DISPOSED:          'DISPOSED',
} as const;
export type AssetStatus = (typeof AssetStatus)[keyof typeof AssetStatus];

export interface Department {
  id: number;
  name: string;
  headUserId?: number;
  parentId?: number;
  isActive: boolean;
}

export interface AssetCategory {
  id: number;
  name: string;
  description?: string;
  customFields?: string;
  isActive: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
  departmentId?: number;
  departmentName?: string;
}

export const MaintenanceStatus = {
  PENDING:             'PENDING',
  APPROVED:            'APPROVED',
  REJECTED:            'REJECTED',
  TECHNICIAN_ASSIGNED: 'TECHNICIAN_ASSIGNED',
  IN_PROGRESS:         'IN_PROGRESS',
  RESOLVED:            'RESOLVED',
} as const;
export type MaintenanceStatus = (typeof MaintenanceStatus)[keyof typeof MaintenanceStatus];

export const BookingStatus = {
  UPCOMING:  'UPCOMING',
  ONGOING:   'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const AuditResult = {
  UNREVIEWED: 'UNREVIEWED',
  VERIFIED:   'VERIFIED',
  MISSING:    'MISSING',
  DAMAGED:    'DAMAGED',
} as const;
export type AuditResult = (typeof AuditResult)[keyof typeof AuditResult];

// ─────────────────────────────────────────────
// Domain Interfaces — mirroring backend DTOs
// ─────────────────────────────────────────────

export interface Asset {
  id: number;
  name: string;
  serialNumber?: string;
  assetTag?: string;
  category: string;
  location: string;
  status: AssetStatus;
  assignedUserId?: number;
  assignedUserName?: string;
  purchaseDate: string;        // ISO date string
  lastAuditDate?: string;
  tags?: string[];
  isSharedBookable?: boolean;
}

export interface Booking {
  id: number;
  assetId: number;
  assetName?: string;
  userId: number;
  userName?: string;
  startTime: string;           // ISO datetime string
  endTime: string;             // ISO datetime string
  status: BookingStatus;
  createdAt?: string;
}

export interface MaintenanceRequest {
  id: number;
  assetId: number;
  assetName: string;
  requesterId: number;
  requesterName: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: MaintenanceStatus;
  assignedTechnician?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export interface AuditCycle {
  id: number;
  name: string;
  departmentId?: number;
  location?: string;
  startDate: string;
  endDate?: string;
  status: 'OPEN' | 'CLOSED';
}

export interface AuditItem {
  id: number;
  assetId: number;
  assetName: string;
  serialNumber: string;
  category: string;
  location: string;
  expectedStatus: AssetStatus;
  auditResult: AuditResult;
  notes?: string;
}

export interface AuditBatchPayload {
  auditCycleId: number;
  items: { assetId: number; result: AuditResult; notes?: string }[];
}

// ─────────────────────────────────────────────
// Dashboard / KPI DTOs
// ─────────────────────────────────────────────

export interface KpiSummary {
  totalAssets: number;
  availableAssets: number;
  allocatedAssets: number;
  underMaintenance: number;
  activeBookings: number;
  pendingMaintenance: number;
  overdueReturns: number;
}

export interface OverdueReturn {
  bookingId: number;
  assetId: number;
  assetName: string;
  userName: string;
  scheduledReturn: string;
  hoursOverdue: number;
}

export interface ActivityLog {
  id: number;
  userId: number;
  action: string;
  entity: string;
  details?: string;
  timestamp: string; // ISO datetime
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  type: 'ALERT' | 'INFO' | 'WARNING';
  isRead: boolean;
  createdAt: string;
}

export interface ChartDataDTO {
  label: string;
  value: number;
}

export interface ReportDTO {
  assetsByCategory: ChartDataDTO[];
  assetsByStatus: ChartDataDTO[];
  maintenanceByStatus: ChartDataDTO[];
  departmentAllocation: ChartDataDTO[];
  mostUsedAssets: ChartDataDTO[];
  maintenanceByCategory: ChartDataDTO[];
  upcomingMaintenance: Asset[];
  bookingHeatmap: BookingHeatmapDTO[];
}

export interface BookingHeatmapDTO {
  dayOfWeek: number;
  hourOfDay: number;
  count: number;
}

// ─────────────────────────────────────────────
// API Request / Response Payloads
// ─────────────────────────────────────────────

export interface CreateBookingPayload {
  assetId: number;
  userId: number;
  startTime: string;
  endTime: string;
}

export interface AllocateAssetPayload {
  userId: number;
}

export interface UpdateMaintenanceStatusPayload {
  newStatus: MaintenanceStatus;
  assignedTechnician?: string;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  timestamp?: string;
  details?: string;
}

// ─────────────────────────────────────────────
// UI-only types
// ─────────────────────────────────────────────

export type NavPage =
  | 'dashboard'
  | 'assets'
  | 'bookings'
  | 'maintenance'
  | 'audit'
  | 'org-setup'
  | 'reports'
  | 'logs';

export interface NavItem {
  id: NavPage;
  label: string;
  icon: string;   // SVG path d="" string
}