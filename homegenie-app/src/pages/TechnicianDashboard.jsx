import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchRequests, updateRequest } from '../services/api';
import RequestCard from '../components/RequestCard';
import Header from '../components/Header';
import { AlertCircle, Loader2, Wrench, ClipboardList } from 'lucide-react';
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
        <div className="min-h-screen bg-gray-50">
            <Header user={user} onLogout={logout} role="TECHNICIAN" />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <Wrench className="w-7 h-7 text-indigo-600" />
                    <h2 className="text-2xl font-bold text-gray-800">My Assignments</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
                        <p className="text-gray-600 text-sm">Total Assigned</p>
                        <p className="text-3xl font-bold text-gray-800">{requests.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
                        <p className="text-gray-600 text-sm">Active Tasks</p>
                        <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                        <p className="text-gray-600 text-sm">Completed</p>
                        <p className="text-3xl font-bold text-green-600">{completedCount}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <ClipboardList className="w-6 h-6 text-gray-600" />
                        <h3 className="text-xl font-bold text-gray-800">Tasks</h3>
                    </div>
                    <div className="flex gap-2">
                        {['ALL', 'IN_PROGRESS', 'COMPLETED'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === f
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border'
                                    }`}
                            >
                                {f.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No assignments found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRequests.map(req => (
                            <RequestCard
                                key={req.id}
                                request={req}
                                role="TECHNICIAN"
                                onUpdateStatus={handleUpdateStatus}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TechnicianDashboard;
