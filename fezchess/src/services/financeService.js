import axiosClient from '../api/axiosClient';

const getFinanceStats = async (month, year) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    return await axiosClient.get(`/finance/stats?${params}`);
};

const getFinanceChart = async (month, year) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    return await axiosClient.get(`/finance/chart?${params}`);
};

const getCostStructure = async (month, year) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    return await axiosClient.get(`/finance/cost-structure?${params}`);
};

const getTransactions = async (month, year) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    return await axiosClient.get(`/finance/transactions?${params}`);
};

const createTransaction = async (data) => {
    return await axiosClient.post(`/finance/transactions`, data);
};

const updateTransaction = async (id, data) => {
    return await axiosClient.put(`/finance/transactions/${id}`, data);
};

const deleteTransaction = async (id) => {
    return await axiosClient.delete(`/finance/transactions/${id}`);
};

const exportFinanceReport = (month, year) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    // For window.open, we might need the full URL if axiosClient doesn't expose it easily,
    // but usually we rely on env var.
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.open(`${baseUrl}/finance/export?${params}`, '_blank');
};

const payTuition = async (enrollmentId) => {
    return await axiosClient.post(`/finance/pay-tuition`, { enrollmentId });
};

const financeService = {
    getFinanceStats,
    getFinanceChart,
    getCostStructure,
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    exportFinanceReport,
    payTuition
};

export default financeService;
