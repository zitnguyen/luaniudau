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

const exportFinanceReport = async (month, year) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const res = await axiosClient.get(`/finance/export?${params}`, {
        responseType: 'blob',
    });
    const blob = res.data;
    const disposition = res.headers?.['content-disposition'] || '';
    const match = /filename="?([^";]+)"?/i.exec(disposition);
    const filename = match?.[1] || 'BaoCaoTaiChinh.csv';
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
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
