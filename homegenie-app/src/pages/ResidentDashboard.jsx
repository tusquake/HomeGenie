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
        <div className="min-h-screen bg-gray-50">
            <Header user={user} onLogout={logout} role="RESIDENT" />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <VoiceAssistant currentUser={user} onRequestCreated={loadRequests} />

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <ClipboardList className="w-6 h-6 text-gray-600" />
                        <h2 className="text-2xl font-bold text-gray-800">My Requests</h2>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Request
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No maintenance requests yet</p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                        >
                            Create Your First Request
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requests.map(req => (
                            <RequestCard key={req.id} request={req} role="RESIDENT" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResidentDashboard;
