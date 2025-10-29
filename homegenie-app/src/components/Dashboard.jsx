// Dashboard.jsx
import React from 'react';
import RequestsList from './RequestsList';
import StatisticsCards from './StatisticsCards';

const Dashboard = ({
    currentUser,
    stats,
    requests,
    loading,
    onAssign,
    onUpdateStatus,
    setView
}) => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Statistics (Admin Only) */}
            {currentUser.role === 'ADMIN' && stats.total !== undefined && (
                <StatisticsCards stats={stats} />
            )}

            {/* Requests List */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {currentUser.role === 'ADMIN' ? 'All Maintenance Requests' : 'My Requests'}
            </h2>

            <RequestsList
                requests={requests}
                loading={loading}
                currentUser={currentUser}
                onAssign={onAssign}
                onUpdateStatus={onUpdateStatus}
                setView={setView}
            />
        </div>
    );
};

export default Dashboard;