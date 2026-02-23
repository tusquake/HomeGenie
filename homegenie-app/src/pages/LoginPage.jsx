import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ROLE_ROUTES = { ADMIN: '/admin', RESIDENT: '/resident', TECHNICIAN: '/technician' };

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(email, password);
            navigate(ROLE_ROUTES[user.role] || '/');
        } catch (err) {
            toast.error(err.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="backdrop-blur-xl bg-white/95 w-full max-w-4xl rounded-2xl shadow-2xl relative z-10 animate-fade-in flex flex-col md:flex-row overflow-hidden">
                {/* Branding Section */}
                <div className="hidden md:flex md:w-1/2 bg-slate-50 p-12 flex-col justify-center items-center text-center border-r border-gray-100">
                    <img src="/logo_homeginie.png" alt="HomeGenie Logo" className="w-48 h-48 object-contain drop-shadow-xl mb-6" />
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">Welcome Back</h2>
                    <p className="text-slate-600">Enter your credentials to access your intelligent home management dashboard.</p>
                </div>

                {/* Form Section */}
                <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
                    {/* Header (Mobile Only) */}
                    <div className="text-center md:hidden mb-8">
                        <img src="/logo_homeginie.png" alt="HomeGenie Logo" className="w-20 h-20 mx-auto object-contain mb-4 drop-shadow-md" />
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            HomeGenie
                        </h1>
                        <p className="text-gray-600 font-medium">Smart Home Maintenance</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 block">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    className="input-field pl-12"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 block">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="input-field pl-12 pr-12"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-6"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        {/* Register Link */}
                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-center text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                                    Create one
                                </Link>
                            </p>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default LoginPage;
