import axiosClient from '../api/axiosClient';

const orderService = {
  create: (data) => {
    return axiosClient.post('/orders', data);
  },
  getMyOrders: () => {
    return axiosClient.get('/orders/my-orders');
  },
  getAll: () => { // Admin
    return axiosClient.get('/orders');
  },
  updateStatus: (id, status) => { // Admin
    return axiosClient.put(`/orders/${id}/status`, { status });
  }
};

export default orderService;
