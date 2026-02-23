import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Mail, Lock, User, Phone, Building2, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';
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
    const [showPassword, setShowPassword] = useState(false);

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

            <div className="backdrop-blur-xl bg-white/95 w-full max-w-4xl rounded-2xl shadow-2xl relative z-10 animate-fade-in flex flex-col md:flex-row overflow-hidden max-h-[95vh]">
                {/* Branding Section */}
                <div className="hidden md:flex md:w-[40%] bg-slate-50 p-8 flex-col justify-center items-center text-center border-r border-gray-100">
                    <img src="/logo_homeginie.png" alt="HomeGenie Logo" className="w-40 h-40 object-contain drop-shadow-xl mb-6" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Join HomeGenie</h2>
                    <p className="text-slate-600 text-sm">Create an account to manage your smart home and maintenance requests effortlessly.</p>
                </div>

                {/* Form Section */}
                <div className="w-full md:w-[60%] p-6 sm:p-10 flex flex-col justify-center overflow-y-auto">
                    {/* Header (Mobile Only) */}
                    <div className="text-center md:hidden mb-6">
                        <img src="/logo_homeginie.png" alt="HomeGenie Logo" className="w-16 h-16 mx-auto object-contain mb-2 drop-shadow-md" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            HomeGenie
                        </h1>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-6 hidden md:block">Create Account</h2>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 block">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        placeholder="tushar@gmail.com"
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
                                        placeholder="Tushar Seth"
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
                                        placeholder="+91 9836935802"
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
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="input-field pl-12 pr-12"
                                        value={form.password}
                                        onChange={updateField('password')}
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
        </div>
    );
};

export default RegisterPage;
