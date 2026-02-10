import React, { useEffect, useState } from 'react';
import { 
    Download, ChevronDown, Filter, Plus, MoreHorizontal,
    DollarSign, AlertTriangle, ShoppingCart, TrendingUp, TrendingDown,
    Edit, Trash2, Calendar, FileText, Search, Loader2, X
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import financeService from '../../../services/financeService';

const Finance = () => {
    const [financialStats, setFinancialStats] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [costStructure, setCostStructure] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [newTransaction, setNewTransaction] = useState({
        type: 'income',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [selectedDate, setSelectedDate] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const { month, year } = selectedDate;
            
            const [statsRes, chartRes, costRes, trxRes] = await Promise.all([
                financeService.getFinanceStats(month, year),
                financeService.getFinanceChart(month, year),
                financeService.getCostStructure(month, year),
                financeService.getTransactions(month, year)
            ]);

            // Transform Stats Data
            if (statsRes.success) {
                const rawStats = statsRes.data;
                const mappedStats = rawStats.map((item, idx) => {
                    let icon = DollarSign;
                    let color = 'bg-blue-50 text-blue-600';
                    let trendColor = 'text-green-600';
                    
                    if (idx === 1) { // Expense
                        icon = ShoppingCart;
                        color = 'bg-red-50 text-red-600';
                        trendColor = 'text-red-600';
                    } else if (idx === 2) { // Profit
                        icon = TrendingUp;
                        color = 'bg-green-50 text-green-600';
                        trendColor = 'text-green-600';
                    }

                    return {
                        ...item,
                        valueFormatted: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.value),
                        icon,
                        color,
                        trendColor
                    };
                });
                setFinancialStats(mappedStats);
            }

            if (chartRes.success) {
                setChartData(chartRes.data);
            }

            if (costRes.success) {
                const formattedCost = costRes.data.map(item => ({
                    ...item,
                    valueFormatted: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.value)
                }));
                // Sort by value desc for better visualization
                formattedCost.sort((a,b) => b.value - a.value); 
                setCostStructure(formattedCost);
            }

            if (trxRes.success) {
                const formattedTrx = trxRes.data.map(trx => ({
                    ...trx,
                    amountFormatted: (trx.type === 'income' ? '+' : '-') + new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(trx.amount),
                    dateFormatted: new Date(trx.date).toLocaleDateString('vi-VN')
                }));
                setTransactions(formattedTrx);
            }

        } catch (error) {
            console.error("Error fetching finance data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [selectedDate]);

    const handleMonthChange = (e) => {
        const [month, year] = e.target.value.split('-');
        setSelectedDate({ month: Number(month), year: Number(year) });
    };

    const handleExport = () => {
        const { month, year } = selectedDate;
        financeService.exportFinanceReport(month, year);
    };

    // Generate last 12 months for dropdown
    const monthOptions = [];
    for (let i = 0; i < 12; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        monthOptions.push({ value: `${m}-${y}`, label: `Tháng ${m}/${y}` });
    }

    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newTransaction,
                source: newTransaction.type === 'income' ? newTransaction.category : undefined,
                category: newTransaction.type === 'expense' ? newTransaction.category : undefined
            };
            
            if (editingId) {
                 await financeService.updateTransaction(editingId, payload);
            } else {
                 await financeService.createTransaction(payload);
            }
            
            setShowModal(false);
            setEditingId(null);
            setNewTransaction({
                type: 'income',
                amount: '',
                description: '',
                category: '',
                date: new Date().toISOString().split('T')[0]
            });
            fetchAllData(); 
        } catch (error) {
            console.error("Error saving transaction:", error);
            alert("Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (trx) => {
        if (trx.id.startsWith('ENR')) {
            alert('Không thể sửa giao dịch học phí tại đây.');
            return;
        }
        
        const rawAmount = trx.amount.toString();
        
        setNewTransaction({
            type: trx.type,
            amount: rawAmount,
            description: trx.sub || '',
            category: trx.content || '',
            // Handle date parsing safely from ISO string or similar if available, or verify format
            // Based on backend, standard date format is usually ISO.
            date: new Date(trx.date).toISOString().split('T')[0]
        });
        setEditingId(trx.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (id.startsWith('ENR')) {
            alert('Không thể xóa giao dịch học phí tại đây.');
            return;
        }
        try {
            await financeService.deleteTransaction(id);
            setDeleteConfirm(null);
            fetchAllData();
        } catch (error) {
            console.error("Error deleting transaction:", error);
            alert("Lỗi khi xóa giao dịch");
        }
    };

    const openNewModal = () => {
        setEditingId(null);
        const defaultDate = new Date();
        // Adjust to selected month/year if needed, or just today
        // Let's stick to today to allow accurate entry, or default to 1st of selected month if viewing past?
        // Let's us today if it matches current view, else 1st of viewed month.
        let initDate = new Date();
        if (selectedDate.month !== initDate.getMonth() + 1 || selectedDate.year !== initDate.getFullYear()) {
             initDate = new Date(selectedDate.year, selectedDate.month - 1, 1);
             // Adjust for timezone offset to avoid previous day
             initDate.setMinutes(initDate.getMinutes() - initDate.getTimezoneOffset());
        }
        
        setNewTransaction({
            type: 'income',
            amount: '',
            description: '',
            category: '',
            date: initDate.toISOString().split('T')[0]
        });
        setShowModal(true);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                     <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <DollarSign className="text-primary" size={28} />
                        Tổng Quan Tài Chính
                    </h1>
                     <p className="text-sm text-gray-500 mt-1">Theo dõi dòng tiền, doanh thu và chi phí hoạt động</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select 
                            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 shadow-sm appearance-none cursor-pointer font-medium hover:border-blue-300 transition-colors"
                            value={`${selectedDate.month}-${selectedDate.year}`}
                            onChange={handleMonthChange}
                        >
                            {monthOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                    
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium shadow-sm"
                    >
                        <Download size={18} /> 
                        <span className="hidden sm:inline">Xuất báo cáo</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Loader2 className="animate-spin mb-3 text-primary" size={40} />
                    <span className="text-gray-500 font-medium">Đang tải dữ liệu tài chính...</span>
                </div>
            ) : (
                <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {financialStats.map((stat, idx) => (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all duration-300" key={idx}>
                             <div className="flex justify-between items-start mb-4">
                                 <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</div>
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.color} bg-opacity-50`}>
                                     <stat.icon size={20} />
                                 </div>
                             </div>
                             <div className="text-3xl font-bold text-gray-900 mb-2">{stat.valueFormatted}</div>
                             <div className="flex items-center gap-2 text-sm">
                                 {stat.change && (
                                     <span className={`flex items-center gap-1 font-medium ${
                                         (idx !== 1 && stat.trend === 'up') || (idx === 1 && stat.trend === 'down') 
                                            ? 'text-green-600 bg-green-50 px-2 py-0.5 rounded' 
                                            : 'text-red-600 bg-red-50 px-2 py-0.5 rounded'
                                     }`}>
                                         {stat.trend === 'up' ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                                         {stat.change}
                                     </span>
                                 )}
                                 {stat.sub && (
                                     <span className={`flex items-center gap-1 ${stat.trend === 'warning' ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
                                        {stat.trend === 'warning' && <AlertTriangle size={14} />}
                                        {stat.sub}
                                     </span>
                                 )}
                             </div>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bar Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-800 text-lg">Biểu đồ Thu Chi</h3>
                            <div className="flex items-center gap-4 text-sm font-medium">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <span className="w-3 h-3 rounded-full bg-blue-600"></span> Doanh thu
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <span className="w-3 h-3 rounded-full bg-red-500"></span> Chi phí
                                </div>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} barGap={8} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} tickFormatter={(value) => `${value/1000000}M`} />
                                    <Tooltip 
                                        cursor={{fill: '#F3F4F6'}} 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Bar dataKey="income" fill="#2563EB" radius={[4,4,0,0]} maxBarSize={40} />
                                    <Bar dataKey="expense" fill="#EF4444" radius={[4,4,0,0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Cost Structure */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <h3 className="font-bold text-gray-800 text-lg mb-6">Cơ cấu Chi phí</h3>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-5">
                            {costStructure.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="font-medium text-gray-700">{item.label}</span>
                                        <div className="text-gray-900 font-bold">
                                            {item.valueFormatted}
                                            <span className="text-gray-400 font-normal ml-1">({item.percent}%)</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-500" 
                                            style={{width: `${item.percent}%`, backgroundColor: item.color}}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            {costStructure.length === 0 && (
                                <div className="text-center text-gray-400 py-10">Chưa có dữ liệu chi phí</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="font-bold text-gray-800 text-lg">Giao dịch gần đây</h3>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors text-sm font-medium">
                                <Filter size={16} /> Lọc
                            </button>
                            <button 
                                onClick={openNewModal}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 shadow-lg shadow-blue-500/30 transition-all text-sm font-medium"
                            >
                                <Plus size={18} /> Thêm GD
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã GD</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nội dung</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Loại</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Số tiền</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.map((trx, idx) => (
                                    <tr key={trx.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            {trx.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{trx.content}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{trx.sub}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                trx.type === 'income' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {trx.type === 'income' ? 'Thu nhập' : 'Chi phí'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {trx.dateFormatted}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${
                                            trx.type === 'income' ? 'text-blue-600' : 'text-red-600'
                                        }`}>
                                            {trx.amountFormatted}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                trx.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {trx.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleEdit(trx)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Sửa"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <div className="relative">
                                                     <button 
                                                        onClick={() => setDeleteConfirm(deleteConfirm === trx.id ? null : trx.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    
                                                    {deleteConfirm === trx.id && (
                                                        <div className="absolute right-0 bottom-full mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 min-w-[140px]">
                                                            <div className="text-xs text-center font-medium text-gray-700 mb-2">Xác nhận xóa?</div>
                                                            <div className="flex gap-2 justify-center">
                                                                <button 
                                                                    onClick={() => handleDelete(trx.id)}
                                                                    className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                                                >
                                                                    Xóa
                                                                </button>
                                                                <button 
                                                                    onClick={() => setDeleteConfirm(null)}
                                                                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200"
                                                                >
                                                                    Hủy
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-10 text-center text-gray-400 text-sm">
                                            Không có giao dịch nào trong tháng này.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                </>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-800 text-lg">
                                {editingId ? 'Cập nhật giao dịch' : 'Thêm giao dịch mới'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleTransactionSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Loại giao dịch</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border font-medium text-sm transition-all
                                            ${newTransaction.type === 'income' 
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                            }
                                        `}
                                        onClick={() => !editingId && setNewTransaction({...newTransaction, type: 'income'})}
                                        disabled={!!editingId}
                                    >
                                        <TrendingUp size={16} /> Thu nhập
                                    </button>
                                    <button
                                        type="button"
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border font-medium text-sm transition-all
                                            ${newTransaction.type === 'expense' 
                                                ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/20' 
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                            }
                                        `}
                                        onClick={() => !editingId && setNewTransaction({...newTransaction, type: 'expense'})}
                                        disabled={!!editingId}
                                    >
                                        <TrendingDown size={16} /> Chi phí
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Số tiền (VNĐ)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={newTransaction.amount} 
                                        onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                                        required 
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                                        placeholder="0"
                                    />
                                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Mô tả chi tiết</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={newTransaction.description} 
                                        onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="Nhập nội dung giao dịch..."
                                    />
                                    <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">
                                    {newTransaction.type === 'income' ? 'Nguồn thu' : 'Danh mục chi'}
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={newTransaction.category} 
                                        onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})} 
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder={newTransaction.type === 'income' ? 'VD: Bán sách, Tài trợ...' : 'VD: Điện nước, Lương...'}
                                    />
                                    <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Ngày giao dịch</label>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        value={newTransaction.date} 
                                        onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})} 
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                     <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button" 
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                                    onClick={() => setShowModal(false)}
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 shadow-lg shadow-blue-500/25 font-medium transition-colors"
                                >
                                    {editingId ? 'Cập nhật' : 'Lưu giao dịch'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Finance;
