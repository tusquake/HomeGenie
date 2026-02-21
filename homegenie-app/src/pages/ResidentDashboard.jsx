import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchRequests, createRequest } from '../services/api';
import RequestCard from '../components/RequestCard';
import CreateRequestForm from '../components/CreateRequestForm';
import VoiceAssistant from '../components/VoiceAssistant';
import Header from '../components/Header';
import { AlertCircle, Loader2, Plus, ClipboardList } from 'lucide-react';
import { toast } from 'react-toastify';

const ResidentDashboard = () => {
    const { user, authFetch, logout } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newRequest, setNewRequest] = useState({ title: '', description: '', imageBase64: '' });
    const [submitting, setSubmitting] = useState(false);

    const loadRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchRequests(authFetch, user);
            setRequests(data);
        } catch {
            toast.error('Failed to load your requests');
        }
        setLoading(false);
    }, [authFetch, user]);

    useEffect(() => { loadRequests(); }, [loadRequests]);

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createRequest(authFetch, user.userId, newRequest);
            toast.success('Request created! AI is analyzing and admin will be notified.');
            setNewRequest({ title: '', description: '', imageBase64: '' });
            setShowCreateForm(false);
            loadRequests();
        } catch {
            toast.error('Failed to create request');
        }
        setSubmitting(false);
    };

    if (showCreateForm) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header user={user} onLogout={logout} role="RESIDENT" onNavigate={() => setShowCreateForm(false)} />
                <CreateRequestForm
                    newRequest={newRequest}
                    setNewRequest={setNewRequest}
                    onSubmit={handleCreateRequest}
                    onCancel={() => setShowCreateForm(false)}
                    loading={submitting}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Header user={user} onLogout={logout} role="RESIDENT" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <VoiceAssistant currentUser={user} onRequestCreated={loadRequests} />

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 animate-fade-in">
                    <div>
                        <h2 className="section-title flex items-center gap-3 mb-2">
                            <ClipboardList className="w-8 h-8" />
                            My Requests
                        </h2>
                        <p className="section-subtitle">Manage all your maintenance requests in one place</p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        New Request
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin">
                            <div className="w-12 h-12 border-4 border-blue-200 rounded-full border-t-blue-600"></div>
                        </div>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="card text-center py-16 animate-fade-in">
                        <div className="mb-4">
                            <AlertCircle className="w-20 h-20 text-gray-300 mx-auto" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-700 mb-2">No requests yet</h3>
                        <p className="text-gray-600 mb-6">Create your first maintenance request to get started</p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Request
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requests.map((req, index) => (
                            <div key={req.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
                                <RequestCard request={req} role="RESIDENT" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResidentDashboard;
