import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingDown, Filter, DollarSign, Target, Calendar, BarChart3 } from 'lucide-react';
import api from '../api/axios';
import './PageStyles.css';

const COLORS = ['#f43f5e', '#fb7185', '#e11d48', '#be123c', '#9f1239', '#881337', '#ec4899', '#db2777'];

const Expenses = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ category: 'all', dateRange: 'all' });

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await api.get('/transactions');
            const expenses = response.data.transactions.filter(t => t.type === 'Expense');
            setTransactions(expenses);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = transactions.filter(t => {
        if (filter.category !== 'all' && t.category !== filter.category) return false;
        return true;
    });

    const totalExpenses = filteredData.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const avgTransaction = filteredData.length > 0 ? totalExpenses / filteredData.length : 0;
    const categories = [...new Set(transactions.map(t => t.category))];

    const categoryData = categories.map(cat => ({
        category: cat,
        amount: filteredData.filter(t => t.category === cat).reduce((sum, t) => sum + parseFloat(t.amount), 0)
    })).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

    const topCategory = categoryData[0]?.category || 'N/A';

    // Monthly data
    const monthlyData = filteredData.reduce((acc, t) => {
        const month = new Date(t.date).toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + parseFloat(t.amount);
        return acc;
    }, {});

    const monthlyChartData = Object.entries(monthlyData)
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => a.month.localeCompare(b.month));

    if (loading) {
        return <div className="loading-container"><div className="skeleton" style={{ height: 400, borderRadius: 20 }} /></div>;
    }

    return (
        <div className="analysis-page">
            {/* Hero */}
            <motion.div className="page-hero expense" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="hero-icon">💸</div>
                <h1>Expense Analysis</h1>
                <p>Track and control your spending habits</p>
            </motion.div>

            {/* Filters */}
            <motion.div className="filter-bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <Filter size={18} />
                <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}>
                    <option value="all">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </motion.div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <DollarSign className="stat-icon expense" size={24} />
                    <span className="stat-label">Total Expenses</span>
                    <span className="stat-value expense">{totalExpenses.toLocaleString()} EGP</span>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <BarChart3 size={24} className="stat-icon" />
                    <span className="stat-label">Avg Transaction</span>
                    <span className="stat-value">{avgTransaction.toLocaleString(undefined, { maximumFractionDigits: 0 })} EGP</span>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Target size={24} className="stat-icon warning" />
                    <span className="stat-label">Top Category</span>
                    <span className="stat-value">{topCategory}</span>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Calendar size={24} className="stat-icon" />
                    <span className="stat-label">Transactions</span>
                    <span className="stat-value">{filteredData.length}</span>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="charts-row">
                <motion.div className="chart-container" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                    <h3>Expenses by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryData} layout="vertical" margin={{ left: 80 }}>
                            <XAxis type="number" stroke="#64748b" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                            <YAxis type="category" dataKey="category" stroke="#64748b" fontSize={12} />
                            <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, color: '#e5e7eb' }} formatter={v => [`${v.toLocaleString()} EGP`]} />
                            <Bar dataKey="amount" fill="#ef4444" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div className="chart-container" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                    <h3>Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                dataKey="amount"
                                nameKey="category"
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={100}
                                paddingAngle={2}
                                label={({ category, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                            >
                                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, color: '#e5e7eb' }} formatter={v => [`${parseFloat(v).toLocaleString()} EGP`]} />
                            <Legend
                                layout="vertical"
                                align="right"
                                verticalAlign="middle"
                                wrapperStyle={{ paddingLeft: 20 }}
                                formatter={(value) => <span style={{ color: '#e5e7eb', fontSize: 12 }}>{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Monthly Trend */}
            <motion.div className="chart-container full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <h3>Monthly Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyChartData}>
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, color: '#e5e7eb' }} formatter={v => [`${v.toLocaleString()} EGP`]} />
                        <Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', strokeWidth: 2 }} />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div className="table-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                <h3>Recent Transactions</h3>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr><th>Date</th><th>Category</th><th>Amount</th><th>Source</th><th>Description</th></tr>
                        </thead>
                        <tbody>
                            {filteredData.slice(0, 15).map((t, i) => (
                                <tr key={i}>
                                    <td>{new Date(t.date).toLocaleDateString()}</td>
                                    <td>{t.category}</td>
                                    <td className="expense">{parseFloat(t.amount).toLocaleString()} EGP</td>
                                    <td>{t.source}</td>
                                    <td>{t.description || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default Expenses;
