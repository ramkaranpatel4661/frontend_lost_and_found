import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increased timeout to 30 seconds
  withCredentials: true,
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  verifyToken: () => api.get('/auth/verify'),
}

// Items API
export const itemsApi = {
  // Get all items with filtering and pagination
  getItems: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/items?${queryString}`);
  },

  // Get items statistics
  getStats: async () => {
    return api.get('/items/stats');
  },

  // Get single item by ID
  getItem: async (id) => api.get(`/items/${id}`),

  // Create new item
  createItem: async (itemData) => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(itemData).forEach(key => {
      if (key !== 'imageUrls') {
        formData.append(key, itemData[key]);
      }
    });
    
    // Add images
    if (itemData.imageUrls) {
      itemData.imageUrls.forEach(file => {
        formData.append('imageUrls', file);
      });
    }
    
    return api.post('/items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update item
  updateItem: async (id, itemData) => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(itemData).forEach(key => {
      if (key !== 'imageUrls' && key !== 'removedImages') {
        formData.append(key, itemData[key]);
      }
    });
    
    // Add new images
    if (itemData.imageUrls) {
      itemData.imageUrls.forEach(file => {
        if (file instanceof File) {
          formData.append('imageUrls', file);
        }
      });
    }
    
    // Add removed images info
    if (itemData.removedImages) {
      formData.append('removedImages', JSON.stringify(itemData.removedImages));
    }
    
    return api.put(`/items/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete item
  deleteItem: async (id) => api.delete(`/items/${id}`),

  // Get user's items
  getMyItems: async () => api.get('/items/user/my-items'),

  // Get items by user ID
  getItemsByUser: async (userId) => api.get(`/items/user/${userId}`)
};

// Chat API - Updated for private messaging
export const chatApi = {
  // Get or create private chat between current user and item owner
  getOrCreateChat: (itemId) =>
    api.get(`/chat/${itemId}`),

  // Get all private chats for current user
  getMyChats: () => api.get('/chat/user/conversations'),

  // Get specific chat by ID (only if user is participant)
  getChat: (chatId) => api.get(`/chat/byid/${chatId}`),

  // Send message in private chat
  sendMessage: (itemId, content) =>
    api.post(`/chat/${itemId}`, { content }),

  // Mark messages as read in private chat
  markAsRead: (chatId) => api.put(`/chat/${chatId}/read`),

  // Clear private chat messages
  clearChat: (chatId) => api.delete(`/chat/${chatId}/messages`),
}

// Users API - Enhanced for messaging
export const usersApi = {
  getUser: (userId) => api.get(`/users/${userId}`),
  
  getUserItems: (userId, type, page = 1, limit = 12) => {
    const params = new URLSearchParams()
    if (type) params.append('type', type)
    params.append('page', page.toString())
    params.append('limit', limit.toString())

    return api.get(`/users/${userId}/items?${params.toString()}`)
  },

  // Start direct message with a user
  startDirectMessage: (userId) => api.post(`/users/${userId}/message`),

  // Search users for messaging
  searchUsers: (query, limit = 10) => {
    const params = new URLSearchParams()
    params.append('q', query)
    params.append('limit', limit.toString())
    
    return api.get(`/users/search?${params.toString()}`)
  }
}

// Admin API
export const adminApi = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard'),
  
  // Users Management
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/users?${queryString}`);
  },
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  promoteToAdmin: (userId) => api.put(`/admin/users/${userId}/promote`),
  banUser: (userId, reason) => api.put(`/admin/users/${userId}/ban`, { reason }),
  unbanUser: (userId) => api.put(`/admin/users/${userId}/unban`),
  getUserStats: (userId) => api.get(`/admin/users/${userId}/stats`),
  
  // Items Management
  getItems: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/items?${queryString}`);
  },
  deleteItem: (itemId) => api.delete(`/admin/items/${itemId}`),
  bulkDeleteItems: (itemIds) => api.post('/admin/items/bulk-delete', { itemIds }),
  getItemStats: (itemId) => api.get(`/admin/items/${itemId}/stats`),
  
  // Claims Management
  getClaims: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/claims?${queryString}`);
  },
  getClaimDetails: (claimId) => api.get(`/admin/claims/${claimId}`),
  approveClaim: (claimId, notes) => api.put(`/admin/claims/${claimId}/approve`, { notes }),
  rejectClaim: (claimId, reason) => api.put(`/admin/claims/${claimId}/reject`, { reason }),
  bulkApproveClaims: (claimIds) => api.post('/admin/claims/bulk-approve', { claimIds }),
  bulkRejectClaims: (claimIds, reason) => api.post('/admin/claims/bulk-reject', { claimIds, reason }),
  
  // Analytics & Reports
  getAnalytics: (period = '30d') => api.get(`/admin/analytics?period=${period}`),
  getReports: (type, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/reports/${type}?${queryString}`);
  },
  exportData: (type, format = 'csv') => api.get(`/admin/export/${type}?format=${format}`),
  
  // System Management
  getSystemStats: () => api.get('/admin/system/stats'),
  getAdminLogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/logs?${queryString}`);
  },
  clearCache: () => api.post('/admin/system/clear-cache'),
  
  // Notifications
  sendNotification: (data) => api.post('/admin/notifications/send', data),
  getNotifications: () => api.get('/admin/notifications'),
  markNotificationRead: (notificationId) => api.put(`/admin/notifications/${notificationId}/read`),
};

export default api