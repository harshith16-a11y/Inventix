import api from './api';

export const productService = {
  async getAll() {
    const res = await api.get('/products');
    return res.data;
  },

  async getById(id) {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  // O(1) HashMap lookup by Product ID
  async searchByProductId(productId) {
    const res = await api.get(`/products/search/${productId}`);
    return res.data;
  },

  async query(q) {
    const res = await api.get(`/products/query?q=${encodeURIComponent(q || '')}`);
    return res.data;
  },

  async create(product) {
    const res = await api.post('/products', product);
    return res.data;
  },

  async createBatch(products) {
    const res = await api.post('/products/batch', products);
    return res.data;
  },

  async quickAdjust(id, price, quantity) {
    const res = await api.patch(`/products/${id}/quick-adjust`, { price, quantity });
    return res.data;
  },

  async getNextId() {
    const res = await api.get('/products/next-id');
    return res.data;
  },

  async update(id, product) {
    const res = await api.put(`/products/${id}`, product);
    return res.data;
  },

  async delete(id) {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  }
};
