import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Mail, Lock, User, Phone, Building2, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ROLE_ROUTES = { ADMIN: '/admin', RESIDENT: '/resident', TECHNICIAN: '/technician' };

const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        flatNumber: '',
        role: 'RESIDENT'
    });

    const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await register(form);
            toast.success('Account created successfully!');
            navigate(ROLE_ROUTES[user.role] || '/');
        } catch (err) {
            toast.error(err.message);
        }
        setLoading(false);
    };

    const roleIcons = {
        RESIDENT: <Building2 className="w-5 h-5" />,
        TECHNICIAN: <Shield className="w-5 h-5" />,
        ADMIN: <Shield className="w-5 h-5" />,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="card backdrop-blur-xl bg-white/95 w-full max-w-md shadow-2xl relative z-10 animate-fade-in max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl mb-4 shadow-lg">
                        <Home className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        HomeGenie
                    </h1>
                    <p className="text-gray-600 font-medium">Join our community</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 block">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="input-field pl-12"
                                value={form.email}
                                onChange={updateField('email')}
                                required
                            />
                        </div>
                    </div>

                    {/* Full Name Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 block">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="John Doe"
                                className="input-field pl-12"
                                value={form.fullName}
                                onChange={updateField('fullName')}
                                required
                            />
                        </div>
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 block">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                className="input-field pl-12"
                                value={form.phoneNumber}
                                onChange={updateField('phoneNumber')}
                                required
                            />
                        </div>
                    </div>

                    {/* Flat Number Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 block">Flat Number (Optional)</label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="A-101"
                                className="input-field pl-12"
                                value={form.flatNumber}
                                onChange={updateField('flatNumber')}
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 block">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="input-field pl-12"
                                value={form.password}
                                onChange={updateField('password')}
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500">Minimum 6 characters</p>
                    </div>

                    {/* Role Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 block">Register As</label>
                        <div className="relative">
                            <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <select
                                className="input-field pl-12 appearance-none cursor-pointer bg-gray-50"
                                value={form.role}
                                onChange={updateField('role')}
                            >
                                <option value="RESIDENT">Resident</option>
                                <option value="TECHNICIAN">Technician</option>
                                <option value="ADMIN">Admin</option>
                            </select>
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
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            <>
                                <span>Register</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>

                    {/* Login Link */}
                    <div className="pt-4 border-t border-gray-100">
                        <p className="text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
