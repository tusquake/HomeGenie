import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchRequests, fetchStatistics, fetchTechnicians, updateRequest } from '../services/api';
import StatisticsCards from '../components/StatisticsCards';
import RequestCard from '../components/RequestCard';
import AssignmentModal from '../components/AssignmentModal';
import Header from '../components/Header';
import { AlertCircle, Loader2, Users, BarChart3, ClipboardList } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const { user, authFetch, logout } = useAuth();
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState({});
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [filter, setFilter] = useState('ALL');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [reqData, statsData, techData] = await Promise.all([
                fetchRequests(authFetch, user),
                fetchStatistics(authFetch),
                fetchTechnicians(authFetch)
            ]);
            setRequests(reqData);
            setStats(statsData);
            setTechnicians(techData);
        } catch (err) {
            toast.error('Failed to load dashboard data');
        }
        setLoading(false);
    }, [authFetch, user]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleUpdateStatus = async (id, status) => {
        try {
            await updateRequest(authFetch, id, { status });
            toast.success('Status updated! Resident will be notified via email.');
            loadData();
        } catch {
            toast.error('Failed to update status');
        }
    };

    const handleAssign = async (requestId, technicianId) => {
        try {
            await updateRequest(authFetch, requestId, { assignedTo: technicianId, status: 'IN_PROGRESS' });
            setShowAssignModal(false);
            setSelectedRequest(null);
            toast.success('Technician assigned! They will receive an email notification.');
            loadData();
        } catch {
            toast.error('Failed to assign technician');
        }
    };

    const filteredRequests = filter === 'ALL'
        ? requests
        : requests.filter(r => r.status === filter);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <Header user={user} onLogout={logout} role="ADMIN" />
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin">
                        <div className="w-12 h-12 border-4 border-blue-200 rounded-full border-t-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Header user={user} onLogout={logout} role="ADMIN" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8 animate-fade-in">
                    <h2 className="section-title flex items-center gap-3 mb-2">
                        <BarChart3 className="w-8 h-8" />
                        Admin Dashboard
                    </h2>
                    <p className="section-subtitle">Monitor all maintenance requests and manage your team</p>
                </div>

                {/* Statistics Cards */}
                {stats.total !== undefined && <StatisticsCards stats={stats} />}

                {/* Requests Section */}
                <div className="mb-8 animate-fade-in">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                                <ClipboardList className="w-7 h-7 text-blue-600" />
                                All Requests
                            </h3>
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex flex-wrap gap-2">
                            {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map(f => (
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

                    {/* Requests Grid */}
                    {filteredRequests.length === 0 ? (
                        <div className="card text-center py-16">
                            <AlertCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">No maintenance requests found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredRequests.map((req, index) => (
                                <div key={req.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
                                    <RequestCard
                                        request={req}
                                        role="ADMIN"
                                        technicians={technicians}
                                        onAssign={(request) => { setSelectedRequest(request); setShowAssignModal(true); }}
                                        onUpdateStatus={handleUpdateStatus}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Assignment Modal */}
            {showAssignModal && (
                <AssignmentModal
                    request={selectedRequest}
                    technicians={technicians}
                    onAssign={handleAssign}
                    onClose={() => { setShowAssignModal(false); setSelectedRequest(null); }}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
