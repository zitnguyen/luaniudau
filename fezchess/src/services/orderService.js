import axiosClient from "../api/axiosClient";

const orderService = {
  create: (data) => {
    return axiosClient.post("/orders", data);
  },
  getMyOrders: () => {
    return axiosClient.get("/orders/my-orders");
  },
  getAll: () => {
    return axiosClient.get("/orders/admin/all");
  },
  updateStatus: (id, status) => {
    return axiosClient.put(`/orders/${id}/pay`, { status });
  },
};

export default orderService;
