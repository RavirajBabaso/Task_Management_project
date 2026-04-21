export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
    changePassword: '/auth/change-password'
  },
  users: {
    list: '/users',
    detail: (id: number | string) => `/users/${id}`,
    create: '/users',
    update: (id: number | string) => `/users/${id}`,
    deactivate: (id: number | string) => `/users/${id}/deactivate`
  },
  tasks: {
    list: '/tasks',
    detail: (id: number | string) => `/tasks/${id}`,
    create: '/tasks',
    update: (id: number | string) => `/tasks/${id}`,
    status: (id: number | string) => `/tasks/${id}/status`,
    history: (id: number | string) => `/tasks/${id}/history`,
    upload: (id: number | string) => `/tasks/${id}/attachment`
  },
  reports: {
    daily: '/reports/daily',
    weekly: '/reports/weekly',
    monthly: '/reports/monthly',
    export: '/reports/export'
  },
  notifications: {
    list: '/notifications',
    markRead: (id: number | string) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all'
  },
  approvals: {
    list: '/approvals',
    detail: (id: number | string) => `/approvals/${id}`,
    create: '/approvals',
    approve: (id: number | string) => `/approvals/${id}/approve`,
    reject: (id: number | string) => `/approvals/${id}/reject`
  },
  announcements: {
    list: '/announcements',
    create: '/announcements',
    detail: (id: number | string) => `/announcements/${id}`
  },
  dashboard: {
    chairman: '/dashboard/chairman',
    director: '/dashboard/director',
    department: '/dashboard/department',
    metrics: '/dashboard/metrics'
  }
} as const;
