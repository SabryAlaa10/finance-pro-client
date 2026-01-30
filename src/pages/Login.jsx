import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Sparkles, ShieldCheck } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(username, password);

        if (!result.success) {
            setError(result.error);
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Animated Background */}
            <div className="login-bg">
                <div className="login-bg-gradient" />
                <div className="login-bg-orbs">
                    <motion.div
                        className="orb orb-1"
                        animate={{
                            y: [0, -30, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="orb orb-2"
                        animate={{
                            y: [0, 20, 0],
                            x: [0, -20, 0]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="orb orb-3"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
            </div>

            {/* Login Container */}
            <motion.div
                className="login-container"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Icon */}
                <motion.div
                    className="login-icon"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                    💎
                </motion.div>

                {/* Title */}
                <motion.h1
                    className="login-title"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    Finance PRO
                </motion.h1>
                <p className="login-subtitle">Secure access to your financial dashboard</p>

                {/* Form */}
                <motion.form
                    className="login-form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {error && (
                        <motion.div
                            className="login-error"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                        >
                            ❌ {error}
                        </motion.div>
                    )}

                    <div className="form-group">
                        <div className="input-wrapper">
                            <User className="input-icon" size={18} />
                            <input
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        className="login-btn"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading ? (
                            <span className="loading-dots">
                                <span>.</span><span>.</span><span>.</span>
                            </span>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                Login
                            </>
                        )}
                    </motion.button>
                </motion.form>

                {/* Security Badge */}
                <motion.div
                    className="security-badge"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <ShieldCheck size={16} />
                    <span>Secured with end-to-end encryption</span>
                </motion.div>

                <p className="login-footer">
                    Finance PRO Dashboard © 2026 | All rights reserved
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
