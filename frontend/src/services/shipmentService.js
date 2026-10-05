import api from './api';

export const shipmentService = {
  async createShipment(data) {
    const res = await api.post('/shipments', data);
    return res.data;
  },

  async getShipments() {
    const res = await api.get('/shipments');
    return res.data;
  },

  async getById(id) {
    const res = await api.get(`/shipments/${id}`);
    return res.data;
  },

  async getNormalQueue() {
    const res = await api.get('/shipments/queue/normal');
    return res.data;
  },

  async getPriorityQueue() {
    const res = await api.get('/shipments/queue/priority');
    return res.data;
  },

  async processNormal() {
    const res = await api.post('/shipments/process/normal');
    return res.data;
  },

  async processPriority() {
    const res = await api.post('/shipments/process/priority');
    return res.data;
  }
};
