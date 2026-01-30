import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    PlusCircle,
    TrendingDown,
    TrendingUp,
    PieChart,
    Wallet,
    LogOut,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    BarChart3
} from 'lucide-react';
import './Layout.css';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/add-transaction', icon: PlusCircle, label: 'Add Transaction' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/expenses', icon: TrendingDown, label: 'Expenses' },
    { path: '/income', icon: TrendingUp, label: 'Income' },
    { path: '/investments', icon: PieChart, label: 'Investments' },
    { path: '/wallets', icon: Wallet, label: 'Wallets' },
];

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`app-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Sidebar */}
            <motion.aside
                className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Toggle Button */}
                <button className="sidebar-toggle" onClick={toggleSidebar}>
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>

                {/* Logo */}
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span className="logo-icon">💎</span>
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.span
                                    className="logo-text"
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    Finance PRO
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navItems.map((item, index) => (
                        <motion.div
                            key={item.path}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                end={item.path === '/'}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <item.icon size={20} />
                                <AnimatePresence>
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </NavLink>
                        </motion.div>
                    ))}
                </nav>

                {/* User Info & Actions */}
                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.div
                                    className="user-details"
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <span className="user-name">{user?.name || 'User'}</span>
                                    <span className="user-id">ID: {user?.userId}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="sidebar-actions">
                        <button className="action-btn" onClick={handleRefresh} title="Refresh">
                            <RefreshCw size={18} />
                        </button>
                        <button className="action-btn logout" onClick={handleLogout} title="Logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="main-content">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="content-wrapper"
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
};

export default Layout;
