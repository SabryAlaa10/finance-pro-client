import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    ResponsiveContainer, XAxis, YAxis, Tooltip, Legend,
    AreaChart, Area, RadialBarChart, RadialBar
} from 'recharts';
import {
    DollarSign, TrendingUp, TrendingDown, PiggyBank,
    Download, FileText, Loader, Sparkles
} from 'lucide-react';
import api from '../api/axios';
import './Dashboard.css';

// Professional color palette
const CHART_COLORS = {
    income: '#10b981',    // Emerald
    expense: '#f43f5e',   // Rose
    investment: '#8b5cf6', // Violet
    primary: '#6366f1',   // Indigo
    secondary: '#14b8a6', // Teal
    accent: '#f59e0b',    // Amber
};

const PIE_COLORS = [
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#f43f5e', // Rose
    '#f97316', // Orange
    '#eab308', // Yellow
    '#10b981', // Emerald
    '#14b8a6', // Teal
    '#3b82f6', // Blue
    '#06b6d4', // Cyan
];

const KPICard = ({ icon: Icon, label, value, trend, color, delay }) => (
    <motion.div
        className="kpi-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)' }}
    >
        <div className="kpi-icon" style={{ background: `${color}20`, color }}>
            <Icon size={22} />
        </div>
        <div className="kpi-content">
            <div className="kpi-label">{label}</div>
            <div className="kpi-value">{value}</div>
            {trend && <div className="kpi-trend" style={{ color }}>{trend}</div>}
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/transactions/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = async (type) => {
        setDownloading(type);
        try {
            const response = await api.get(`/reports/${type}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `${type}_report_${new Date().toISOString().split('T')[0]}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading report:', error);
        } finally {
            setDownloading(null);
        }
    };

    // Prepare monthly chart data
    const prepareMonthlyData = () => {
        if (!stats?.monthlyData) return [];

        const monthMap = {};
        stats.monthlyData.forEach(item => {
            if (!monthMap[item.month]) {
                monthMap[item.month] = { month: item.month, Income: 0, Expense: 0 };
            }
            monthMap[item.month][item.type] = parseFloat(item.amount);
        });

        return Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));
    };

    // Prepare pie chart data with better structure
    const preparePieData = () => {
        if (!stats?.expensesByCategory || stats.expensesByCategory.length === 0) {
            // Return sample data if no data exists
            return [
                { category: 'No Data', amount: 1 }
            ];
        }
        return stats.expensesByCategory.map(item => ({
            ...item,
            amount: parseFloat(item.amount)
        }));
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="skeleton" style={{ width: '100%', height: 120, marginBottom: 24, borderRadius: 20 }} />
                <div className="grid grid-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16 }} />
                    ))}
                </div>
            </div>
        );
    }

    const formatCurrency = (value) => `${value?.toLocaleString() || 0} EGP`;

    return (
        <div className="dashboard">
            {/* Hero Section */}
            <motion.div
                className="dashboard-hero"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="hero-badge">
                    <Sparkles size={16} />
                    Personal Finance Dashboard
                </div>
                <h1 className="hero-title">Welcome Back! 👋</h1>
                <p className="hero-subtitle">
                    Track expenses, monitor investments, and optimize your financial growth.
                </p>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-4 mb-3">
                <KPICard
                    icon={TrendingUp}
                    label="Total Income"
                    value={formatCurrency(stats?.stats?.totalIncome)}
                    trend="↑ All time"
                    color={CHART_COLORS.income}
                    delay={0.1}
                />
                <KPICard
                    icon={TrendingDown}
                    label="Total Expenses"
                    value={formatCurrency(stats?.stats?.totalExpenses)}
                    trend="↓ All time"
                    color={CHART_COLORS.expense}
                    delay={0.2}
                />
                <KPICard
                    icon={DollarSign}
                    label="Net Balance"
                    value={formatCurrency(stats?.stats?.netBalance)}
                    trend={stats?.stats?.netBalance >= 0 ? '✓ Positive' : '✗ Negative'}
                    color={stats?.stats?.netBalance >= 0 ? CHART_COLORS.income : CHART_COLORS.expense}
                    delay={0.3}
                />
                <KPICard
                    icon={PiggyBank}
                    label="Investments"
                    value={formatCurrency(stats?.stats?.investmentsValue)}
                    trend="📈 Growing"
                    color={CHART_COLORS.investment}
                    delay={0.4}
                />
            </div>

            {/* Reports Section */}
            <motion.div
                className="section-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h2 className="section-title">
                    <FileText size={22} />
                    Generate Reports
                </h2>
                <p className="section-desc">Download comprehensive financial reports in PDF format</p>

                <div className="reports-grid">
                    <motion.button
                        className="report-btn weekly"
                        onClick={() => downloadReport('weekly')}
                        disabled={downloading === 'weekly'}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {downloading === 'weekly' ? <Loader className="spinning" size={18} /> : <Download size={18} />}
                        <span>Weekly Report</span>
                        <small>Last 7 days</small>
                    </motion.button>

                    <motion.button
                        className="report-btn monthly"
                        onClick={() => downloadReport('monthly')}
                        disabled={downloading === 'monthly'}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {downloading === 'monthly' ? <Loader className="spinning" size={18} /> : <Download size={18} />}
                        <span>Monthly Report</span>
                        <small>Month to date</small>
                    </motion.button>
                </div>
            </motion.div>

            {/* Charts Row */}
            <div className="charts-grid">
                {/* Monthly Income vs Expenses */}
                <motion.div
                    className="chart-card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h3 className="chart-title">Monthly Income vs Expenses</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={prepareMonthlyData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={CHART_COLORS.income} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={CHART_COLORS.income} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={CHART_COLORS.expense} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={CHART_COLORS.expense} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(15, 23, 42, 0.95)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    borderRadius: 12,
                                    color: '#e5e7eb'
                                }}
                                formatter={(value) => [`${value.toLocaleString()} EGP`, '']}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="Income" stroke={CHART_COLORS.income} fill="url(#incomeGradient)" strokeWidth={2} />
                            <Area type="monotone" dataKey="Expense" stroke={CHART_COLORS.expense} fill="url(#expenseGradient)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Expense Distribution */}
                <motion.div
                    className="chart-card"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <h3 className="chart-title">Expense Distribution</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={preparePieData()}
                                dataKey="amount"
                                nameKey="category"
                                cx="40%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={3}
                                label={({ percent }) => percent > 0.08 ? `${(percent * 100).toFixed(0)}%` : ''}
                                labelLine={false}
                            >
                                {preparePieData().map((entry, index) => (
                                    <Cell key={entry.category} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(15, 23, 42, 0.95)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    borderRadius: 12,
                                    color: '#e5e7eb'
                                }}
                                formatter={(value) => [`${parseFloat(value).toLocaleString()} EGP`, '']}
                            />
                            <Legend
                                layout="vertical"
                                align="right"
                                verticalAlign="middle"
                                wrapperStyle={{ paddingLeft: 10, fontSize: 12 }}
                                formatter={(value) => <span style={{ color: '#e5e7eb' }}>{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
