import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, Tag, Wallet, FileText, Sparkles, Loader } from 'lucide-react';
import api from '../api/axios';
import './AddTransaction.css';

const TRANSACTION_TYPES = [
    { value: 'Expense', label: '💸 Expense', color: '#ef4444' },
    { value: 'Income', label: '💰 Income', color: '#22c55e' },
    { value: 'Investment', label: '📈 Investment', color: '#8b5cf6' },
    { value: 'Transfer', label: '🔄 Transfer', color: '#3b82f6' },
];

const CATEGORIES = {
    Expense: ['Personal', 'University', 'Food', 'Transport', 'Subscriptions', 'Entertainment', 'Health', 'Books', 'Rent', 'Bills', 'Gifts', 'Other'],
    Income: ['Freelancing (Mostaql)', 'Pocket Money', 'Salary', 'Gift', 'Business', 'Bonus', 'Refund', 'Other'],
    Investment: ['Gold', 'Stock Trading', 'Crypto', 'Real Estate', 'NFT', 'Other'],
    Transfer: ['Transfer'],
};

const SOURCES = [
    'Vodafone Cash', 'InstaPay', 'National Bank of Egypt', 'Banque Misr',
    'CIB Bank', 'Apple Pay', 'Cash', 'Wallet', 'Credit Card (Barq)', 'Other'
];

const AddTransaction = () => {
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'Expense',
        category: 'Personal',
        source: 'Cash',
        amount: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/transactions/stats');
            setStats(response.data.stats);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.amount || parseFloat(form.amount) <= 0) {
            setError('Please enter a valid amount greater than 0');
            return;
        }

        setLoading(true);
        try {
            await api.post('/transactions', form);
            setSuccess(true);
            setForm({
                ...form,
                amount: '',
                description: ''
            });
            fetchStats();
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save transaction');
        } finally {
            setLoading(false);
        }
    };

    const handleTypeChange = (type) => {
        setForm({
            ...form,
            type,
            category: CATEGORIES[type][0]
        });
    };

    return (
        <div className="add-transaction">
            {/* Hero */}
            <motion.div
                className="txn-hero"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="txn-hero-icon">💳</div>
                <h1 className="txn-hero-title">Add New Transaction</h1>
                <p className="txn-hero-subtitle">Track your finances seamlessly • Keep your budget on track</p>
            </motion.div>

            {/* Quick Stats */}
            {stats && (
                <motion.div
                    className="quick-stats"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stat-mini">
                        <span className="stat-icon">📈</span>
                        <span className="stat-label">Total Income</span>
                        <span className="stat-value income">{stats.totalIncome?.toLocaleString() || 0} EGP</span>
                    </div>
                    <div className="stat-mini">
                        <span className="stat-icon">💸</span>
                        <span className="stat-label">Total Expenses</span>
                        <span className="stat-value expense">{stats.totalExpenses?.toLocaleString() || 0} EGP</span>
                    </div>
                    <div className="stat-mini">
                        <span className="stat-icon">💰</span>
                        <span className="stat-label">Net Balance</span>
                        <span className={`stat-value ${stats.netBalance >= 0 ? 'income' : 'expense'}`}>
                            {stats.netBalance?.toLocaleString() || 0} EGP
                        </span>
                    </div>
                </motion.div>
            )}

            {/* Form */}
            <motion.form
                className="txn-form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                {error && (
                    <motion.div
                        className="form-error"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        ❌ {error}
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        className="form-success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        ✅ Transaction saved successfully!
                    </motion.div>
                )}

                {/* Transaction Type */}
                <div className="form-section">
                    <h3 className="section-label">
                        <Tag size={18} />
                        Transaction Type
                    </h3>
                    <div className="type-selector">
                        {TRANSACTION_TYPES.map(type => (
                            <button
                                key={type.value}
                                type="button"
                                className={`type-btn ${form.type === type.value ? 'active' : ''}`}
                                onClick={() => handleTypeChange(type.value)}
                                style={{ '--btn-color': type.color }}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date & Amount */}
                <div className="form-row">
                    <div className="form-group">
                        <label><Calendar size={14} /> Date</label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label><CreditCard size={14} /> Amount (EGP)</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                </div>

                {/* Category & Source */}
                <div className="form-row">
                    <div className="form-group">
                        <label><Tag size={14} /> Category</label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                        >
                            {CATEGORIES[form.type].map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label><Wallet size={14} /> Payment Method</label>
                        <select
                            value={form.source}
                            onChange={(e) => setForm({ ...form, source: e.target.value })}
                        >
                            {SOURCES.map(src => (
                                <option key={src} value={src}>{src}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div className="form-group">
                    <label><FileText size={14} /> Description (Optional)</label>
                    <input
                        type="text"
                        placeholder="Add notes or details..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                </div>

                {/* Submit */}
                <motion.button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {loading ? (
                        <Loader className="spin" size={20} />
                    ) : (
                        <>
                            <Sparkles size={20} />
                            Save Transaction
                        </>
                    )}
                </motion.button>
            </motion.form>

            {/* Tips */}
            <motion.div
                className="tips-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <h4>💡 Quick Tips</h4>
                <ul>
                    <li><strong>Freelancing (Mostaql):</strong> Track your freelance income from Mostaql platform</li>
                    <li><strong>Regular Updates:</strong> Add transactions daily for accurate tracking</li>
                    <li><strong>Categories:</strong> Use specific categories to analyze spending patterns</li>
                </ul>
            </motion.div>
        </div>
    );
};

export default AddTransaction;
