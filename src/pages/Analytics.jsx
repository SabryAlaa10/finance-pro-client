import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
    AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ComposedChart, RadialBarChart, RadialBar, Treemap,
    ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Activity, Layers, Target } from 'lucide-react';
import api from '../api/axios';
import './Analytics.css';

// Professional color palette
const COLORS = {
    primary: ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'],
    income: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
    expense: ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3'],
    mixed: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6']
};

const Analytics = () => {
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [txnRes, statsRes] = await Promise.all([
                api.get('/transactions'),
                api.get('/transactions/stats')
            ]);
            setTransactions(txnRes.data.transactions);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Prepare data for various charts
    const getMonthlyData = () => {
        const data = {};
        transactions.forEach(t => {
            const month = t.date.slice(0, 7);
            if (!data[month]) data[month] = { month, income: 0, expense: 0, investment: 0, net: 0 };
            const amount = parseFloat(t.amount);
            if (t.type === 'Income') data[month].income += amount;
            else if (t.type === 'Expense') data[month].expense += amount;
            else if (t.type === 'Investment') data[month].investment += amount;
            data[month].net = data[month].income - data[month].expense;
        });
        return Object.values(data).sort((a, b) => a.month.localeCompare(b.month));
    };

    const getCategoryBreakdown = (type) => {
        const data = {};
        transactions.filter(t => t.type === type).forEach(t => {
            data[t.category] = (data[t.category] || 0) + parseFloat(t.amount);
        });
        return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    };

    const getSourceBreakdown = () => {
        const data = {};
        transactions.forEach(t => {
            const source = t.source || 'Other';
            if (!data[source]) data[source] = { name: source, income: 0, expense: 0 };
            if (t.type === 'Income') data[source].income += parseFloat(t.amount);
            else if (t.type === 'Expense') data[source].expense += parseFloat(t.amount);
        });
        return Object.values(data).filter(s => s.income > 0 || s.expense > 0);
    };

    const getDailyTrend = () => {
        const data = {};
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        transactions.filter(t => new Date(t.date) >= last30Days).forEach(t => {
            const day = t.date.slice(0, 10);
            if (!data[day]) data[day] = { day: day.slice(5), income: 0, expense: 0 };
            if (t.type === 'Income') data[day].income += parseFloat(t.amount);
            else if (t.type === 'Expense') data[day].expense += parseFloat(t.amount);
        });
        return Object.values(data).sort((a, b) => a.day.localeCompare(b.day)).slice(-15);
    };

    const getTypeDistribution = () => {
        const data = { Income: 0, Expense: 0, Investment: 0, Transfer: 0 };
        transactions.forEach(t => {
            data[t.type] = (data[t.type] || 0) + parseFloat(t.amount);
        });
        return Object.entries(data).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value }));
    };

    const getWeekdayPattern = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data = days.map(d => ({ day: d, expense: 0, count: 0 }));
        transactions.filter(t => t.type === 'Expense').forEach(t => {
            const dayIdx = new Date(t.date).getDay();
            data[dayIdx].expense += parseFloat(t.amount);
            data[dayIdx].count += 1;
        });
        return data.map(d => ({ ...d, average: d.count > 0 ? Math.round(d.expense / d.count) : 0 }));
    };

    const getRadarData = () => {
        const categories = getCategoryBreakdown('Expense').slice(0, 6);
        const maxVal = Math.max(...categories.map(c => c.value));
        return categories.map(c => ({
            category: c.name,
            value: Math.round((c.value / maxVal) * 100)
        }));
    };

    if (loading) {
        return (
            <div className="analytics-page">
                <div className="skeleton" style={{ height: 120, borderRadius: 20, marginBottom: 24 }} />
                <div className="analytics-grid">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="skeleton" style={{ height: 350, borderRadius: 20 }} />
                    ))}
                </div>
            </div>
        );
    }

    const monthlyData = getMonthlyData();
    const expenseCategories = getCategoryBreakdown('Expense');
    const incomeCategories = getCategoryBreakdown('Income');
    const sourceData = getSourceBreakdown();
    const dailyTrend = getDailyTrend();
    const typeDistribution = getTypeDistribution();
    const weekdayPattern = getWeekdayPattern();
    const radarData = getRadarData();

    return (
        <div className="analytics-page">
            {/* Hero */}
            <motion.div
                className="analytics-hero"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="hero-icon">📊</div>
                <h1>Financial Analytics</h1>
                <p>Comprehensive insights into your financial data with interactive visualizations</p>
            </motion.div>

            {/* Summary Stats */}
            <div className="summary-row">
                <motion.div className="summary-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <TrendingUp size={20} className="icon income" />
                    <span className="label">Total Income</span>
                    <span className="value income">{stats?.stats?.totalIncome?.toLocaleString() || 0} EGP</span>
                </motion.div>
                <motion.div className="summary-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Activity size={20} className="icon expense" />
                    <span className="label">Total Expenses</span>
                    <span className="value expense">{stats?.stats?.totalExpenses?.toLocaleString() || 0} EGP</span>
                </motion.div>
                <motion.div className="summary-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Target size={20} className="icon primary" />
                    <span className="label">Net Balance</span>
                    <span className={`value ${stats?.stats?.netBalance >= 0 ? 'income' : 'expense'}`}>
                        {stats?.stats?.netBalance?.toLocaleString() || 0} EGP
                    </span>
                </motion.div>
                <motion.div className="summary-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Layers size={20} className="icon violet" />
                    <span className="label">Transactions</span>
                    <span className="value">{transactions.length}</span>
                </motion.div>
            </div>

            {/* Charts Grid */}
            <div className="analytics-grid">
                {/* 1. Monthly Trend - Area Chart */}
                <motion.div className="chart-box large" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                    <h3><BarChart3 size={18} /> Monthly Financial Overview</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <ComposedChart data={monthlyData}>
                            <defs>
                                <linearGradient id="incomeArea" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="expenseArea" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                            <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                            <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                            <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, color: '#e5e7eb' }} />
                            <Legend />
                            <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fill="url(#incomeArea)" strokeWidth={2} />
                            <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" fill="url(#expenseArea)" strokeWidth={2} />
                            <Line type="monotone" dataKey="net" name="Net" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6' }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* 2. Type Distribution - Pie */}
                <motion.div className="chart-box" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                    <h3><PieIcon size={18} /> Transaction Types</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={typeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}>
                                {typeDistribution.map((_, i) => <Cell key={i} fill={COLORS.mixed[i % COLORS.mixed.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, color: '#e5e7eb' }} formatter={v => `${v.toLocaleString()} EGP`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* 3. Expense Categories - Horizontal Bar */}
                <motion.div className="chart-box" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                    <h3><Layers size={18} /> Top Expense Categories</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={expenseCategories.slice(0, 6)} layout="vertical" margin={{ left: 80 }}>
                            <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                            <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} />
                            <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, color: '#e5e7eb' }} formatter={v => `${v.toLocaleString()} EGP`} />
                            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                                {expenseCategories.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS.expense[i % COLORS.expense.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* 4. Daily Trend - Line */}
                <motion.div className="chart-box" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
                    <h3><Activity size={18} /> Last 15 Days Activity</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={dailyTrend}>
                            <defs>
                                <linearGradient id="dailyIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="dailyExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                            <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                            <YAxis stroke="#64748b" fontSize={10} />
                            <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, color: '#e5e7eb' }} />
                            <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#dailyIncome)" strokeWidth={2} />
                            <Area type="monotone" dataKey="expense" stroke="#f43f5e" fill="url(#dailyExpense)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* 5. Weekday Spending Pattern */}
                <motion.div className="chart-box" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
                    <h3><Target size={18} /> Weekday Spending Pattern</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={weekdayPattern}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                            <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                            <YAxis stroke="#64748b" fontSize={11} />
                            <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, color: '#e5e7eb' }} />
                            <Bar dataKey="expense" name="Total Spent" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* 6. Income Sources - Pie */}
                <motion.div className="chart-box" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}>
                    <h3><PieIcon size={18} /> Income Sources</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={incomeCategories.slice(0, 6)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => percent > 0.1 ? `${(percent * 100).toFixed(0)}%` : ''}>
                                {incomeCategories.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS.income[i % COLORS.income.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, color: '#e5e7eb' }} formatter={v => `${v.toLocaleString()} EGP`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* 7. Payment Methods Comparison */}
                <motion.div className="chart-box large" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}>
                    <h3><BarChart3 size={18} /> Payment Methods Flow</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={sourceData.slice(0, 8)} margin={{ left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-20} textAnchor="end" height={60} />
                            <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                            <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, color: '#e5e7eb' }} formatter={v => `${v.toLocaleString()} EGP`} />
                            <Legend />
                            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* 8. Expense Radar */}
                {radarData.length > 0 && (
                    <motion.div className="chart-box" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 }}>
                        <h3><Target size={18} /> Expense Radar</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="rgba(100,116,139,0.3)" />
                                <PolarAngleAxis dataKey="category" stroke="#64748b" fontSize={10} />
                                <PolarRadiusAxis angle={30} stroke="#64748b" fontSize={10} />
                                <Radar name="Spending" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} strokeWidth={2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
