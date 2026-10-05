import api from './api';

export const notificationService = {
  async getNotifications() {
    const res = await api.get('/notifications');
    return res.data;
  },

  async getUnreadCount() {
    const res = await api.get('/notifications/unread-count');
    return res.data.unreadCount;
  },

  async markAsRead(id) {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await api.put('/notifications/read-all');
    return res.data;
  }
};

export const adminService = {
  async getDashboard() {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  async getActivity() {
    const res = await api.get('/admin/activity');
    return res.data;
  },

  async getUsers() {
    const res = await api.get('/admin/users');
    return res.data;
  },

  async runDemo() {
    const res = await api.post('/admin/demo-run');
    return res.data;
  }
};

export const performanceService = {
  async benchmarkSearch(datasetSize = 10000) {
    const res = await api.post('/performance/search', { datasetSize });
    return res.data;
  },

  async benchmarkSort(datasetSize = 10000) {
    const res = await api.post('/performance/sort', { datasetSize });
    return res.data;
  },

  async benchmarkQueue(datasetSize = 10000) {
    const res = await api.post('/performance/queue', { datasetSize });
    return res.data;
  },

  async runAll(datasetSize = 10000) {
    const res = await api.post('/performance/run-all', { datasetSize });
    return res.data;
  },

  async getHistory() {
    const res = await api.get('/performance/history');
    return res.data;
  }
};
