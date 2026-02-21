import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchRequests, updateRequest } from '../services/api';
import RequestCard from '../components/RequestCard';
import Header from '../components/Header';
import { AlertCircle, Loader2, Wrench, ClipboardList, Zap, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const TechnicianDashboard = () => {
    const { user, authFetch, logout } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    const loadRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchRequests(authFetch, user);
            setRequests(data);
        } catch {
            toast.error('Failed to load assignments');
        }
        setLoading(false);
    }, [authFetch, user]);

    useEffect(() => { loadRequests(); }, [loadRequests]);

    const handleUpdateStatus = async (id, status) => {
        try {
            await updateRequest(authFetch, id, { status });
            toast.success('Status updated successfully!');
            loadRequests();
        } catch {
            toast.error('Failed to update status');
        }
    };

    const filteredRequests = filter === 'ALL'
        ? requests
        : requests.filter(r => r.status === filter);

    const pendingCount = requests.filter(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS').length;
    const completedCount = requests.filter(r => r.status === 'COMPLETED').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Header user={user} onLogout={logout} role="TECHNICIAN" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8 animate-fade-in">
                    <h2 className="section-title flex items-center gap-3 mb-2">
                        <Wrench className="w-8 h-8" />
                        My Assignments
                    </h2>
                    <p className="section-subtitle">Complete your assigned tasks efficiently</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
                    <div className="card">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl text-white">
                                <Zap className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm font-medium mb-1">Total Assigned</p>
                        <p className="text-4xl font-bold text-gray-900">{requests.length}</p>
                    </div>
                    <div className="card">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl text-white">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm font-medium mb-1">Active Tasks</p>
                        <p className="text-4xl font-bold text-yellow-600">{pendingCount}</p>
                    </div>
                    <div className="card">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl text-white">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
                        <p className="text-4xl font-bold text-green-600">{completedCount}</p>
                    </div>
                </div>

                {/* Tasks Section */}
                <div className="mb-8 animate-fade-in">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                                <ClipboardList className="w-7 h-7 text-blue-600" />
                                Tasks
                            </h3>
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex flex-wrap gap-2">
                            {['ALL', 'IN_PROGRESS', 'COMPLETED'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${filter === f
                                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                                            : 'bg-white text-gray-700 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    {f.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tasks Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin">
                                <div className="w-12 h-12 border-4 border-blue-200 rounded-full border-t-blue-600"></div>
                            </div>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="card text-center py-16">
                            <AlertCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">No assignments found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredRequests.map((req, index) => (
                                <div key={req.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
                                    <RequestCard
                                        request={req}
                                        role="TECHNICIAN"
                                        onUpdateStatus={handleUpdateStatus}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TechnicianDashboard;
