import api from './api';

export const inventoryService = {
  async getInventory() {
    const res = await api.get('/inventory');
    return res.data;
  },

  async getLowStock() {
    const res = await api.get('/inventory/low-stock');
    return res.data;
  },

  // Calls backend manual MergeSort implementation
  async getSorted(sortBy = 'productId', direction = 'asc') {
    const res = await api.get(`/inventory/sorted?sortBy=${sortBy}&direction=${direction}`);
    return res.data;
  },

  async restock(productId, quantity) {
    const res = await api.post('/inventory/restock', { productId, quantity });
    return res.data;
  }
};
