import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PiggyBank, TrendingUp, Coins, BarChart3 } from 'lucide-react';
import api from '../api/axios';
import './PageStyles.css';

const COLORS = ['#8b5cf6', '#a78bfa', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#c084fc', '#a855f7'];

const Investments = () => {
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvestments();
    }, []);

    const fetchInvestments = async () => {
        try {
            const response = await api.get('/transactions');
            const inv = response.data.transactions.filter(t => t.type === 'Investment');
            setInvestments(inv);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalValue = investments.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const categories = [...new Set(investments.map(t => t.category))];

    const categoryData = categories.map(cat => ({
        name: cat,
        value: investments.filter(t => t.category === cat).reduce((sum, t) => sum + parseFloat(t.amount), 0)
    })).filter(c => c.value > 0).sort((a, b) => b.value - a.value);

    if (loading) {
        return <div className="loading-container"><div className="skeleton" style={{ height: 400, borderRadius: 20 }} /></div>;
    }

    return (
        <div className="analysis-page">
            <motion.div className="page-hero investment" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="hero-icon">📈</div>
                <h1>Investment Portfolio</h1>
                <p>Track and manage your investments</p>
            </motion.div>

            <div className="stats-grid">
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <PiggyBank className="stat-icon investment" size={24} />
                    <span className="stat-label">Total Invested</span>
                    <span className="stat-value investment">{totalValue.toLocaleString()} EGP</span>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Coins size={24} className="stat-icon" />
                    <span className="stat-label">Asset Types</span>
                    <span className="stat-value">{categories.length}</span>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <TrendingUp size={24} className="stat-icon income" />
                    <span className="stat-label">Top Asset</span>
                    <span className="stat-value">{categoryData[0]?.name || 'N/A'}</span>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <BarChart3 size={24} className="stat-icon" />
                    <span className="stat-label">Transactions</span>
                    <span className="stat-value">{investments.length}</span>
                </motion.div>
            </div>

            {investments.length > 0 ? (
                <>
                    <div className="charts-row">
                        <motion.div className="chart-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                            <h3>Portfolio Allocation</h3>
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={130} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12, color: '#e5e7eb' }} formatter={v => [`${parseFloat(v).toLocaleString()} EGP`]} />
                                </PieChart>
                            </ResponsiveContainer>
                        </motion.div>

                        <motion.div className="portfolio-breakdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                            <h3>Investment Breakdown</h3>
                            <div className="breakdown-list">
                                {categoryData.map((item, i) => (
                                    <div key={item.name} className="breakdown-item">
                                        <div className="breakdown-header">
                                            <span className="color-dot" style={{ background: COLORS[i % COLORS.length] }} />
                                            <span className="breakdown-name">{item.name}</span>
                                            <span className="breakdown-percent">{((item.value / totalValue) * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="breakdown-bar">
                                            <motion.div
                                                className="breakdown-fill"
                                                style={{ background: COLORS[i % COLORS.length] }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(item.value / totalValue) * 100}%` }}
                                                transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
                                            />
                                        </div>
                                        <span className="breakdown-value">{item.value.toLocaleString()} EGP</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <motion.div className="table-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                        <h3>Investment History</h3>
                        <div className="table-wrapper">
                            <table>
                                <thead><tr><th>Date</th><th>Asset</th><th>Amount</th><th>Source</th><th>Notes</th></tr></thead>
                                <tbody>
                                    {investments.slice(0, 15).map((t, i) => (
                                        <tr key={i}>
                                            <td>{new Date(t.date).toLocaleDateString()}</td>
                                            <td>{t.category}</td>
                                            <td className="investment">{parseFloat(t.amount).toLocaleString()} EGP</td>
                                            <td>{t.source}</td>
                                            <td>{t.description || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </>
            ) : (
                <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <PiggyBank size={64} />
                    <h3>No Investments Yet</h3>
                    <p>Start tracking your investments by adding your first investment transaction.</p>
                </motion.div>
            )}
        </div>
    );
};

export default Investments;
