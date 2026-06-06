import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Mode: 'login' | 'forgot' | 'reset'
    const [viewMode, setViewMode] = useState('login');
    const [role, setRole] = useState('User');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Forgot/Reset Password states
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [devResetCode, setDevResetCode] = useState(''); // Developer convenience helper

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        try {
            await login(email, password, role);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        try {
            const res = await axios.post('/api/auth/forgot-password', { email: forgotEmail });
            setSuccessMessage(res.data.message);
            if (res.data.devResetCode) {
                setDevResetCode(res.data.devResetCode);
            }
            setViewMode('reset');
        } catch (err) {
            setError(err.response?.data?.message || 'Error requesting reset code');
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (newPassword !== confirmNewPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            const res = await axios.post('/api/auth/reset-password', {
                email: forgotEmail,
                token: resetCode,
                newPassword
            });
            setSuccessMessage(res.data.message);
            // Clear states
            setResetCode('');
            setNewPassword('');
            setConfirmNewPassword('');
            setDevResetCode('');
            setViewMode('login');
        } catch (err) {
            setError(err.response?.data?.message || 'Password reset failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-background dark:bg-gray-900 transition-colors duration-200">
            <div className="glass-panel p-8 w-full max-w-md dark:bg-gray-800/70 dark:border-gray-700">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-dark dark:text-white">
                        {viewMode === 'login' && 'Welcome Back'}
                        {viewMode === 'forgot' && 'Forgot Password'}
                        {viewMode === 'reset' && 'Reset Password'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        {viewMode === 'login' && 'Login to manage your events'}
                        {viewMode === 'forgot' && 'Enter your email to receive a code'}
                        {viewMode === 'reset' && 'Enter verification code and your new password'}
                    </p>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl mb-4 text-center text-sm font-semibold border border-red-200 dark:border-red-900/50">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-xl mb-4 text-center text-sm font-semibold border border-green-200 dark:border-green-900/50">
                        {successMessage}
                    </div>
                )}

                {/* Dev Code Helper Alert */}
                {viewMode === 'reset' && devResetCode && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-3 rounded-xl mb-4 text-center text-xs border border-blue-100 dark:border-blue-900/30">
                        🔑 <strong>Development Mode:</strong> Your verification code is <strong className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded text-sm text-primary">{devResetCode}</strong>
                    </div>
                )}

                {/* View 1: Login */}
                {viewMode === 'login' && (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Login As</label>
                            <select 
                                value={role} 
                                onChange={(e) => setRole(e.target.value)} 
                                className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700"
                            >
                                <option value="User">Attendee (User)</option>
                                <option value="Organizer">Event Organizer</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Email Address</label>
                            <input 
                                type="email" 
                                placeholder="name@example.com" 
                                className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400">Password</label>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setError('');
                                        setSuccessMessage('');
                                        setForgotEmail(email); // Autofill email
                                        setViewMode('forgot');
                                    }}
                                    className="text-xs text-primary font-bold hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full py-3 mt-4">Login</button>
                    </form>
                )}

                {/* View 2: Forgot Password */}
                {viewMode === 'forgot' && (
                    <form onSubmit={handleForgotSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Email Address</label>
                            <input 
                                type="email" 
                                placeholder="name@example.com" 
                                className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                required 
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full py-3 mt-4">Send Reset Code</button>
                        <div className="text-center pt-2">
                            <button 
                                type="button" 
                                onClick={() => {
                                    setError('');
                                    setSuccessMessage('');
                                    setViewMode('login');
                                }}
                                className="text-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary font-semibold hover:underline"
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                )}

                {/* View 3: Reset Password */}
                {viewMode === 'reset' && (
                    <form onSubmit={handleResetSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">6-Digit Verification Code</label>
                            <input 
                                type="text" 
                                placeholder="e.g. 123456" 
                                maxLength="6"
                                className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700 text-center tracking-widest text-lg font-bold"
                                value={resetCode}
                                onChange={(e) => setResetCode(e.target.value)}
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">New Password</label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Confirm New Password</label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                required 
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full py-3 mt-4">Reset Password</button>
                        <div className="text-center pt-2">
                            <button 
                                type="button" 
                                onClick={() => {
                                    setError('');
                                    setSuccessMessage('');
                                    setViewMode('login');
                                }}
                                className="text-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary font-semibold hover:underline"
                            >
                                Cancel and Back to Login
                            </button>
                        </div>
                    </form>
                )}

                {/* Demo Accounts Quick-Login */}
                {viewMode === 'login' && (
                    <div className="mt-8 pt-6 border-t border-gray-150 dark:border-gray-700">
                        <p className="text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Quick Login Demo Accounts</p>
                        <div className="grid grid-cols-3 gap-2">
                            <button 
                                type="button" 
                                onClick={() => {
                                    setRole('User');
                                    setEmail('user@ems.com');
                                    setPassword('password123');
                                }}
                                className="px-2 py-1.5 text-xs bg-gray-50 hover:bg-primary/10 text-gray-600 hover:text-primary dark:bg-gray-900 dark:text-gray-400 dark:hover:text-primary font-bold rounded-lg border border-gray-100 dark:border-gray-800 transition-colors"
                            >
                                User
                            </button>
                            <button 
                                type="button" 
                                onClick={() => {
                                    setRole('Organizer');
                                    setEmail('organizer@ems.com');
                                    setPassword('password123');
                                }}
                                className="px-2 py-1.5 text-xs bg-gray-50 hover:bg-primary/10 text-gray-600 hover:text-primary dark:bg-gray-900 dark:text-gray-400 dark:hover:text-primary font-bold rounded-lg border border-gray-100 dark:border-gray-800 transition-colors"
                            >
                                Organizer
                            </button>
                            <button 
                                type="button" 
                                onClick={() => {
                                    setRole('Admin');
                                    setEmail('admin@ems.com');
                                    setPassword('password123');
                                }}
                                className="px-2 py-1.5 text-xs bg-gray-50 hover:bg-primary/10 text-gray-600 hover:text-primary dark:bg-gray-900 dark:text-gray-400 dark:hover:text-primary font-bold rounded-lg border border-gray-100 dark:border-gray-800 transition-colors"
                            >
                                Admin
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer Signup Link */}
                {viewMode === 'login' && (
                    <p className="text-center mt-6 text-gray-500 dark:text-gray-400">
                        Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Sign up</Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Login;
