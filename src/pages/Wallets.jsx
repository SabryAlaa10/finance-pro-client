import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, CreditCard, Smartphone, Building2, DollarSign } from 'lucide-react';
import api from '../api/axios';
import './PageStyles.css';

const COLORS = ['#6366f1', '#818cf8', '#8b5cf6', '#a78bfa', '#14b8a6', '#2dd4bf', '#10b981', '#34d399'];

const WALLET_ICONS = {
    'Vodafone Cash': Smartphone,
    'InstaPay': CreditCard,
    'National Bank of Egypt': Building2,
    'Banque Misr': Building2,
    'CIB Bank': Building2,
    'Apple Pay': Smartphone,
    'Cash': DollarSign,
    'Wallet': Wallet,
    'Barq': CreditCard,
};

const Wallets = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await api.get('/transactions');
            setTransactions(response.data.transactions);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate flow per wallet
    const walletData = transactions.reduce((acc, t) => {
        const source = t.source || 'Other';
        if (!acc[source]) acc[source] = { inflow: 0, outflow: 0 };
        if (t.type === 'Income') acc[source].inflow += parseFloat(t.amount);
        else if (t.type === 'Expense') acc[source].outflow += parseFloat(t.amount);
        return acc;
    }, {});

    const walletsArray = Object.entries(walletData)
        .map(([name, data]) => ({
            name,
            inflow: data.inflow,
            outflow: data.outflow,
            balance: data.inflow - data.outflow,
            total: data.inflow + data.outflow
        }))
        .sort((a, b) => b.total - a.total);

    const totalInflow = walletsArray.reduce((sum, w) => sum + w.inflow, 0);
    const totalOutflow = walletsArray.reduce((sum, w) => sum + w.outflow, 0);

    const pieData = walletsArray.filter(w => w.total > 0).map(w => ({ name: w.name, value: w.total }));

    if (loading) {
        return <div className="loading-container"><div className="skeleton" style={{ height: 400, borderRadius: 20 }} /></div>;
    }

    return (
        <div className="analysis-page">
            <motion.div className="page-hero wallet" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="hero-icon">👛</div>
                <h1>Wallets & Banks</h1>
                <p>Track money flow across your payment methods</p>
            </motion.div>

            <div className="stats-grid">
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Wallet className="stat-icon" size={24} />
                    <span className="stat-label">Payment Methods</span>
                    <span className="stat-value">{walletsArray.length}</span>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <DollarSign className="stat-icon income" size={24} />
                    <span className="stat-label">Total Inflow</span>
                    <span className="stat-value income">{totalInflow.toLocaleString()} EGP</span>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <DollarSign className="stat-icon expense" size={24} />
                    <span className="stat-label">Total Outflow</span>
                    <span className="stat-value expense">{totalOutflow.toLocaleString()} EGP</span>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <CreditCard className="stat-icon" size={24} />
                    <span className="stat-label">Most Used</span>
                    <span className="stat-value">{walletsArray[0]?.name || 'N/A'}</span>
                </motion.div>
            </div>

            <div className="charts-row">
                <motion.div className="chart-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <h3>Flow Distribution</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={130} paddingAngle={2} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 12, color: '#e5e7eb' }} formatter={v => [`${parseFloat(v).toLocaleString()} EGP`]} />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div className="wallets-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                    <h3>Payment Methods</h3>
                    {walletsArray.map((wallet, i) => {
                        const Icon = WALLET_ICONS[wallet.name] || Wallet;
                        return (
                            <motion.div
                                key={wallet.name}
                                className="wallet-card"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + i * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="wallet-icon" style={{ color: COLORS[i % COLORS.length] }}>
                                    <Icon size={24} />
                                </div>
                                <div className="wallet-info">
                                    <span className="wallet-name">{wallet.name}</span>
                                    <div className="wallet-flows">
                                        <span className="inflow">+{wallet.inflow.toLocaleString()}</span>
                                        <span className="outflow">-{wallet.outflow.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className={`wallet-balance ${wallet.balance >= 0 ? 'positive' : 'negative'}`}>
                                    {wallet.balance >= 0 ? '+' : ''}{wallet.balance.toLocaleString()} EGP
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
};

export default Wallets;
