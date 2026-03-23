/**
 * Application-wide constants
 */

// Route paths
export const ROUTES = {
  HOME: "/",
  LOGIN: "/admin/login",
  DASHBOARD: "/admin/dashboard",
  ZONES: "/admin/map-management",
  TRIP_INSPECTION: "/admin/trip-inspection",
  SNOW_REMOVAL: "/admin/snow-removal",
  CHECK_IN_REQUESTS: "/admin/check-in-requests",
  ATTENDANCE: "/admin/attendance",
  TARGETS: "/admin/targets",
  REPORTS: "/admin/reports",
  USERS: "/admin/users",
  SETTINGS: "/admin/settings",
  AUDIT_LOG: "/admin/audit-log",
  CHECKIN: "/checkin",
  BLOGS: "/admin/blogs",
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    PROFILE: "/api/auth/profile",
  },
  ZONES: "/api/zones",
  TRIP_INSPECTIONS: "/api/trip-inspections",
  SNOW_REMOVALS: "/api/snow-removals",
  CHECKIN_REQUESTS: "/api/checkin-requests",
  ATTENDANCE: "/api/attendance",
  TARGETS: "/api/targets",
  REPORTS: "/api/reports",
  USERS: "/api/users",
  SETTINGS: "/api/settings",
  AUDIT_LOGS: "/api/audit-logs",
  CHECKIN: {
    VERIFY_LOCATION: "/api/checkin/verify-location",
    REQUEST_STATUS: (id: string) => `/api/checkin/request-status/${id}`,
  },
  BLOGS: "/api/blogs",
  UPLOAD_IMAGE: "/api/upload/image",
} as const;

// Status options
export const STATUS = {
  TRIP_INSPECTION: {
    PENDING: "pending",
    INSPECTED: "inspected",
    COMPLETED: "completed",
  },
  SNOW_REMOVAL: {
    PENDING: "pending",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
  },
  CHECK_IN: {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
  },
  USER: {
    ACTIVE: "active",
    INVITED: "invited",
    DISABLED: "disabled",
  },
} as const;

// Default credentials for demo
export const DEMO_CREDENTIALS = {
  EMAIL: "admin@tripledge.com",
  PASSWORD: "admin123",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: "An unexpected error occurred. Please try again.",
  NETWORK: "Network error. Please check your connection.",
  UNAUTHORIZED: "Invalid credentials. Please try again.",
  SESSION_EXPIRED: "Your session has expired. Please login again.",
  VALIDATION: {
    REQUIRED: "This field is required",
    EMAIL: "Please enter a valid email address",
    PASSWORD_MIN: "Password must be at least 6 characters",
  },
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: "Successfully logged in",
  LOGOUT: "Successfully logged out",
  SAVED: "Changes saved successfully",
  CREATED: "Created successfully",
  UPDATED: "Updated successfully",
  DELETED: "Deleted successfully",
} as const;
// Map Management constants
export const MAP_CONSTANTS = {
  NORTH_BATTLEFORD_CENTER: { lat: 52.7745, lng: -108.302 },
  LINE_COLORS: {
    proposed: '#2dd4bf',
    additional: '#f59e0b',
  },
  PRIORITY_COLORS: {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#3b82f6',
  },
} as const;
