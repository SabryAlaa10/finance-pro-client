import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, Filter, DollarSign, Target, Calendar, BarChart3 } from 'lucide-react';
import api from '../api/axios';
import './PageStyles.css';

const COLORS = ['#10b981', '#34d399', '#059669', '#047857', '#065f46', '#064e3b', '#14b8a6', '#0d9488'];

const Income = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ category: 'all' });

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await api.get('/transactions');
            const income = response.data.transactions.filter(t => t.type === 'Income');
            setTransactions(income);
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

    const totalIncome = filteredData.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const avgTransaction = filteredData.length > 0 ? totalIncome / filteredData.length : 0;
    const categories = [...new Set(transactions.map(t => t.category))];

    const categoryData = categories.map(cat => ({
        category: cat,
        amount: filteredData.filter(t => t.category === cat).reduce((sum, t) => sum + parseFloat(t.amount), 0)
    })).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

    const topSource = categoryData[0]?.category || 'N/A';

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
            <motion.div className="page-hero income" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="hero-icon">💰</div>
                <h1>Income Tracking</h1>
                <p>Monitor and grow your income sources</p>
            </motion.div>

            <motion.div className="filter-bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <Filter size={18} />
                <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}>
                    <option value="all">All Sources</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </motion.div>

            <div className="stats-grid">
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <DollarSign className="stat-icon income" size={24} />
                    <span className="stat-label">Total Income</span>
                    <span className="stat-value income">{totalIncome.toLocaleString()} EGP</span>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <BarChart3 size={24} className="stat-icon" />
                    <span className="stat-label">Avg Transaction</span>
                    <span className="stat-value">{avgTransaction.toLocaleString(undefined, { maximumFractionDigits: 0 })} EGP</span>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Target size={24} className="stat-icon income" />
                    <span className="stat-label">Top Source</span>
                    <span className="stat-value">{topSource}</span>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Calendar size={24} className="stat-icon" />
                    <span className="stat-label">Transactions</span>
                    <span className="stat-value">{filteredData.length}</span>
                </motion.div>
            </div>

            <div className="charts-row">
                <motion.div className="chart-container" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                    <h3>Income by Source</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryData} layout="vertical" margin={{ left: 100 }}>
                            <XAxis type="number" stroke="#64748b" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                            <YAxis type="category" dataKey="category" stroke="#64748b" fontSize={12} />
                            <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, color: '#e5e7eb' }} formatter={v => [`${v.toLocaleString()} EGP`]} />
                            <Bar dataKey="amount" fill="#22c55e" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div className="chart-container" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                    <h3>Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={categoryData} dataKey="amount" nameKey="category" cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={2}>
                                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, color: '#e5e7eb' }} formatter={v => [`${parseFloat(v).toLocaleString()} EGP`]} />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            <motion.div className="chart-container full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <h3>Monthly Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyChartData}>
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, color: '#e5e7eb' }} formatter={v => [`${v.toLocaleString()} EGP`]} />
                        <Line type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', strokeWidth: 2 }} />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>

            <motion.div className="table-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                <h3>Recent Income</h3>
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>Date</th><th>Source</th><th>Amount</th><th>Method</th><th>Description</th></tr></thead>
                        <tbody>
                            {filteredData.slice(0, 15).map((t, i) => (
                                <tr key={i}>
                                    <td>{new Date(t.date).toLocaleDateString()}</td>
                                    <td>{t.category}</td>
                                    <td className="income">{parseFloat(t.amount).toLocaleString()} EGP</td>
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

export default Income;
