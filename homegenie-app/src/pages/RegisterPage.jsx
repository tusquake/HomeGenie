import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <Home className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800">HomeGenie</h1>
                    <p className="text-gray-600 mt-2">Create your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="email" placeholder="Email" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={form.email} onChange={updateField('email')} required />
                    <input type="password" placeholder="Password (min 6 chars)" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={form.password} onChange={updateField('password')} required />
                    <input type="text" placeholder="Full Name" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={form.fullName} onChange={updateField('fullName')} required />
                    <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={form.phoneNumber} onChange={updateField('phoneNumber')} required />
                    <input type="text" placeholder="Flat Number (optional)" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={form.flatNumber} onChange={updateField('flatNumber')} />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Register as</label>
                        <select
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                            value={form.role}
                            onChange={updateField('role')}
                        >
                            <option value="RESIDENT">Resident</option>
                            <option value="TECHNICIAN">Technician</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
