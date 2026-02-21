import { Loader2, Users, Calendar, Tag } from 'lucide-react';
import React, { useState } from 'react';
import { getCategoryIcon, getPriorityColor, getStatusIcon } from '../utils/utils.jsx';

const RequestCard = ({ request, role, onAssign, onUpdateStatus, technicians = [] }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusUpdate = async (status) => {
        if (!onUpdateStatus) return;
        setIsUpdating(true);
        try {
            await onUpdateStatus(request.id, status);
        } finally {
            setIsUpdating(false);
        }
    };

    const assignedTechnician = technicians.find(tech => tech.userId === request.assignedTo);

    const getPriorityBadgeColor = () => {
        switch (request.priority) {
            case 'HIGH': return 'badge-danger';
            case 'MEDIUM': return 'badge-warning';
            case 'LOW': return 'badge-success';
            default: return 'badge-primary';
        }
    };

    return (
        <div className="card group animate-fade-in">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    {getStatusIcon(request.status)}
                    <span className="text-sm font-semibold text-blue-700">
                        {request.status.replace('_', ' ')}
                    </span>
                </div>
                <span className={`${getPriorityBadgeColor()}`}>
                    {request.priority}
                </span>
            </div>

            <div className="flex items-start gap-3 mb-3">
                <span className="text-4xl">{getCategoryIcon(request.category)}</span>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{request.title}</h3>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">{request.category}</p>
                </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{request.description}</p>

            {request.imageUrl && (
                <div className="mb-4 overflow-hidden rounded-xl">
                    <img
                        src={request.imageUrl}
                        alt="Issue"
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>#{String(request.id).slice(0, 8)}</span>
                </div>
            </div>

            {request.assignedTo && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-200 rounded-lg">
                            <Users className="w-5 h-5 text-blue-700" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Assigned To</p>
                            {assignedTechnician ? (
                                <>
                                    <p className="text-sm font-bold text-blue-800 mt-1">{assignedTechnician.fullName}</p>
                                    <p className="text-xs text-blue-600 mt-1">{assignedTechnician.email}</p>
                                    {assignedTechnician.phoneNumber && (
                                        <p className="text-xs text-blue-600">📞 {assignedTechnician.phoneNumber}</p>
                                    )}
                                </>
                            ) : (
                                <p className="text-xs text-blue-700 mt-1">ID: #{request.assignedTo}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isUpdating && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg animate-pulse">
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                        <p className="text-sm font-medium text-green-800">Updating status...</p>
                    </div>
                </div>
            )}

            {role === 'ADMIN' && request.status !== 'COMPLETED' && (
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                    {request.status === 'PENDING' && !request.assignedTo && onAssign && (
                        <button
                            onClick={() => onAssign(request)}
                            disabled={isUpdating}
                            className="flex-1 btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Assign Technician
                        </button>
                    )}
                    {request.assignedTo && request.status === 'IN_PROGRESS' && (
                        <button
                            onClick={() => handleStatusUpdate('COMPLETED')}
                            disabled={isUpdating}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Completing...</span>
                                </>
                            ) : '✓ Mark Complete'}
                        </button>
                    )}
                </div>
            )}

            {role === 'TECHNICIAN' && request.status === 'IN_PROGRESS' && (
                <button
                    onClick={() => handleStatusUpdate('COMPLETED')}
                    disabled={isUpdating}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                >
                    {isUpdating ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Completing...</span>
                        </>
                    ) : '✓ Mark Complete'}
                </button>
            )}
        </div>
    );
};

export default RequestCard;