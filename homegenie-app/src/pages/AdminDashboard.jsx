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
            <div className="min-h-screen bg-gray-50">
                <Header user={user} onLogout={logout} role="ADMIN" />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={user} onLogout={logout} role="ADMIN" />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="w-7 h-7 text-indigo-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
                </div>

                {stats.total !== undefined && <StatisticsCards stats={stats} />}

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <ClipboardList className="w-6 h-6 text-gray-600" />
                        <h3 className="text-xl font-bold text-gray-800">All Maintenance Requests</h3>
                    </div>

                    <div className="flex gap-2">
                        {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map(f => (
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

                {filteredRequests.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No maintenance requests found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRequests.map(req => (
                            <RequestCard
                                key={req.id}
                                request={req}
                                role="ADMIN"
                                technicians={technicians}
                                onAssign={(request) => { setSelectedRequest(request); setShowAssignModal(true); }}
                                onUpdateStatus={handleUpdateStatus}
                            />
                        ))}
                    </div>
                )}
            </div>

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
