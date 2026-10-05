import api from './api';

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
