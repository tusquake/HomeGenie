import { Loader2, X, User, Phone, Mail, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';

const AssignmentModal = ({ request, technicians, onAssign, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [selectedTechId, setSelectedTechId] = useState(null);

    if (!request) return null;

    const handleAssign = async (techId) => {
        setLoading(true);
        setSelectedTechId(techId);
        try {
            await onAssign(request.id, techId);
        } finally {
            setLoading(false);
            setSelectedTechId(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="card rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Assign Technician</h3>
                        <p className="text-gray-600 text-sm mt-1">Choose a technician for this request</p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Request Info */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-blue-900">Request Details</p>
                                <p className="text-lg font-bold text-gray-900 mt-1">{request.title}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-semibold">{request.category}</span>
                                    <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full font-semibold">{request.priority}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technicians List */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Available Technicians</label>

                    {technicians.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-600 font-medium">No technicians available</p>
                            <p className="text-gray-500 text-sm">Please add technicians to the system</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {technicians.map(tech => {
                                const techId = tech.userId || tech.id;
                                const isSelected = selectedTechId === techId && loading;
                                return (
                                    <button
                                        key={techId}
                                        onClick={() => handleAssign(techId)}
                                        disabled={loading && selectedTechId !== techId}
                                        className={`w-full text-left px-4 py-4 border-2 rounded-xl transition-all duration-300 ${
                                            isSelected
                                                ? 'bg-blue-50 border-blue-500 shadow-md'
                                                : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                                        } ${loading && selectedTechId !== techId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <User className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <p className="font-bold text-gray-900">{tech.fullName}</p>
                                                </div>
                                                <div className="space-y-1 ml-11">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail className="w-4 h-4" />
                                                        {tech.email}
                                                    </div>
                                                    {tech.phoneNumber && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Phone className="w-4 h-4" />
                                                            {tech.phoneNumber}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="mb-4 p-4 bg-green-50 border-2 border-green-300 rounded-xl animate-pulse">
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                            <div>
                                <p className="text-sm font-bold text-green-900">Assigning Technician</p>
                                <p className="text-xs text-green-700">Sending email notification...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cancel Button */}
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="w-full btn-secondary py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default AssignmentModal;