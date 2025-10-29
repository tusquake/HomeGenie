// App.jsx
import React, { useEffect, useState } from 'react';
import AuthForm from './components//AuthForm';
import AssignmentModal from "./components/AssignmentModal.jsx";
import CreateRequestForm from './components/CreateRequestForm';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import { API_BASE_MAINTENANCE, API_BASE_USER, TECHNICIANS } from './utils/constants';

const HomeGenieApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('login');
  const [requests, setRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    flatNumber: ''
  });

  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    imageBase64: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('homegenieUser');
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUser(user);
      setView('dashboard');
      loadRequests(user);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_USER}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password
        })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('homegenieUser', JSON.stringify(data));
        setCurrentUser(data);
        setView('dashboard');
        loadRequests(data);
      } else {
        alert('Login failed. Check credentials.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_USER}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('homegenieUser', JSON.stringify(data));
        setCurrentUser(data);
        setView('dashboard');
        loadRequests(data);
      } else {
        alert('Registration failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  const loadRequests = async (user) => {
    setLoading(true);
    try {
      const endpoint = user.role === 'ADMIN'
        ? `${API_BASE_MAINTENANCE}/maintenance`
        : `${API_BASE_MAINTENANCE}/maintenance/user/${user.userId}`;

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }

      if (user.role === 'ADMIN') {
        const statsRes = await fetch(`${API_BASE_MAINTENANCE}/maintenance/statistics`);
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }

        loadTechnicians();
      }
    } catch (err) {
      console.error('Failed to load requests', err);
    }
    setLoading(false);
  };

  const loadTechnicians = () => {
    setTechnicians(TECHNICIANS);
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_MAINTENANCE}/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.userId.toString()
        },
        body: JSON.stringify(newRequest)
      });

      if (res.ok) {
        alert('✅ Request created! AI is analyzing and admin will be notified via email.');
        setNewRequest({ title: '', description: '', imageBase64: '' });
        setView('dashboard');
        loadRequests(currentUser);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  const updateRequestStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE_MAINTENANCE}/maintenance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      loadRequests(currentUser);
      alert('✅ Status updated! Resident will be notified via email.');
    } catch (err) {
      alert('Failed to update');
    }
  };

  const assignTechnician = async (requestId, technicianId) => {
    try {
      await fetch(`${API_BASE_MAINTENANCE}/maintenance/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedTo: technicianId,
          status: 'IN_PROGRESS'
        })
      });
      setShowAssignModal(false);
      setSelectedRequest(null);
      loadRequests(currentUser);
      alert('✅ Technician assigned! They will receive an email notification.');
    } catch (err) {
      alert('Failed to assign technician');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('homegenieUser');
    setCurrentUser(null);
    setView('login');
    setRequests([]);
  };

  const handleAssignRequest = (request) => {
    setSelectedRequest(request);
    setShowAssignModal(true);
  };

  if (!currentUser) {
    return (
      <AuthForm
        view={view}
        setView={setView}
        authForm={authForm}
        setAuthForm={setAuthForm}
        onLogin={handleLogin}
        onRegister={handleRegister}
        loading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        setView={setView}
      />

      {view === 'dashboard' && (
        <Dashboard
          currentUser={currentUser}
          stats={stats}
          requests={requests}
          loading={loading}
          onAssign={handleAssignRequest}
          onUpdateStatus={updateRequestStatus}
          setView={setView}
        />
      )}

      {view === 'create' && (
        <CreateRequestForm
          newRequest={newRequest}
          setNewRequest={setNewRequest}
          onSubmit={handleCreateRequest}
          onCancel={() => setView('dashboard')}
          loading={loading}
        />
      )}

      {showAssignModal && (
        <AssignmentModal
          request={selectedRequest}
          technicians={technicians}
          onAssign={assignTechnician}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
};

export default HomeGenieApp;