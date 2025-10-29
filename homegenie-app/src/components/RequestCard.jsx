// RequestCard.jsx
import { Users } from 'lucide-react';
import React from 'react';
import { getCategoryIcon, getPriorityColor, getStatusIcon } from '../../src/utils/utils.jsx';

const RequestCard = ({ request, currentUser, onAssign, onUpdateStatus }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    {getStatusIcon(request.status)}
                    <span className="text-sm font-medium text-gray-700">
                        {request.status.replace('_', ' ')}
                    </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getCategoryIcon(request.category)}</span>
                <h3 className="text-lg font-bold text-gray-800">{request.title}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{request.description}</p>

            {request.imageUrl && (
                <img
                    src={request.imageUrl}
                    alt="Issue"
                    className="w-full h-32 object-cover rounded-lg mb-4"
                    onError={(e) => e.target.style.display = 'none'}
                />
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span className="bg-gray-100 px-2 py-1 rounded">{request.category}</span>
                <span>{new Date(request.createdAt).toLocaleDateString()}</span>
            </div>

            {request.assignedTo && (
                <div className="mb-4 p-2 bg-blue-50 rounded-lg flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-blue-700">Assigned to Technician #{request.assignedTo}</span>
                </div>
            )}

            {currentUser.role === 'ADMIN' && request.status !== 'COMPLETED' && (
                <div className="flex gap-2">
                    {request.status === 'PENDING' && !request.assignedTo && (
                        <button
                            onClick={() => onAssign(request)}
                            className="flex-1 bg-indigo-100 text-indigo-700 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 transition"
                        >
                            Assign Technician
                        </button>
                    )}
                    {request.assignedTo && request.status === 'IN_PROGRESS' && (
                        <button
                            onClick={() => onUpdateStatus(request.id, 'COMPLETED')}
                            className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition"
                        >
                            Mark Complete
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default RequestCard;