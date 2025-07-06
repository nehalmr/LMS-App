import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Log error details for debugging
    if (error.response) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data,
      })
    } else {
      console.error('API Error:', error)
    }

    const message = error.response?.data?.message || error.message || 'An error occurred'

    // Don't show toast for 404s on GET requests (might be expected)
    if (!(error.response?.status === 404 && error.config?.method === 'get')) {
      toast.error(message)
    }

    // Optionally, standardize error object for UI
    const standardizedError = {
      message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    }

    return Promise.reject(standardizedError)
  }
)

// Book Service
export const bookService = {
  getAll: () => api.get('/books'),
  getById: (id) => api.get(`/books/${id}`),
  search: (params) => api.get('/books/search', { params }),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
}

// Member Service
export const memberService = {
  getAll: () => api.get('/members'),
  getById: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  updateStatus: (id, status) => api.put(`/members/${id}/status`, { status }),
  delete: (id) => api.delete(`/members/${id}`),
}

// Transaction Service
export const transactionService = {
  getAll: () => api.get('/transactions'),
  getById: (id) => api.get(`/transactions/${id}`),
  getByMember: (memberId) => api.get(`/transactions/member/${memberId}`),
  getOverdue: () => api.get('/transactions/overdue'),
  borrow: (data) => api.post('/transactions/borrow', data),
  return: (id) => api.put(`/transactions/${id}/return`),
}

// Fine Service
export const fineService = {
  getAll: () => api.get('/fines'),
  getById: (id) => api.get(`/fines/${id}`),
  getByMember: (memberId) => api.get(`/fines/member/${memberId}`),
  create: (data) => api.post('/fines', data),
  pay: (id) => api.put(`/fines/${id}/pay`),
}

// Notification Service
export const notificationService = {
  getAll: () => api.get('/notifications'),
  getById: (id) => api.get(`/notifications/${id}`),
  getByMember: (memberId) => api.get(`/notifications/member/${memberId}`),
  getStats: () => api.get('/notifications/stats'),
  create: (data) => api.post('/notifications', data),
  createDueReminder: (data) => api.post('/notifications/due-reminder', data),
  createOverdueAlert: (data) => api.post('/notifications/overdue-alert', data),
  createFineNotice: (data) => api.post('/notifications/fine-notice', data),
}

// Dashboard Service
export const dashboardService = {
  getStats: async () => {
    try {
      const [books, members, transactions, fines] = await Promise.all([
        bookService.getAll(),
        memberService.getAll(),
        transactionService.getAll(),
        fineService.getAll(),
      ])

      const totalBooks = books.data.length
      const totalMembers = members.data.length
      const activeTransactions = transactions.data.filter(t => t.status === 'BORROWED').length
      const overdueTransactions = transactions.data.filter(t => 
        t.status === 'BORROWED' && new Date(t.dueDate) < new Date()
      ).length
      const totalFines = fines.data.reduce((sum, fine) => sum + fine.amount, 0)
      const pendingFines = fines.data.filter(f => f.status === 'PENDING').length

      return {
        totalBooks,
        totalMembers,
        activeTransactions,
        overdueTransactions,
        totalFines,
        pendingFines,
        recentTransactions: transactions.data.slice(0, 5),
        recentMembers: members.data.slice(0, 5),
      }
    } catch (error) {
      throw error
    }
  }
}

export default api