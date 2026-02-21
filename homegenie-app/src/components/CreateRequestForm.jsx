import { Camera, TrendingUp, X, ArrowLeft } from 'lucide-react';
import React from 'react';
import { toast } from 'react-toastify';

const CreateRequestForm = ({ newRequest, setNewRequest, onSubmit, onCancel, loading }) => {
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewRequest(prev => ({ ...prev, imageBase64: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <button
                    onClick={onCancel}
                    className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Requests
                </button>

                <div className="card shadow-xl animate-fade-in">
                    <div className="mb-8">
                        <h2 className="section-title mb-2">Create Maintenance Request</h2>
                        <p className="section-subtitle">Describe your issue in detail for faster resolution</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* Title Field */}
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-3 uppercase tracking-wide">Issue Title</label>
                            <input
                                type="text"
                                placeholder="e.g., Water leakage in kitchen sink"
                                className="input-field"
                                value={newRequest.title}
                                onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                                required
                            />
                        </div>

                        {/* Description Field */}
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-3 uppercase tracking-wide">Description</label>
                            <textarea
                                placeholder="Describe the issue in detail... Include any relevant information that might help with the repair."
                                rows="5"
                                className="input-field resize-none"
                                value={newRequest.description}
                                onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-2">{newRequest.description.length} / 1000 characters</p>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-3 uppercase tracking-wide">Photo Evidence (Optional, Max 5MB)</label>
                            <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-600 hover:bg-blue-50 transition-all duration-300 bg-blue-50/30">
                                {newRequest.imageBase64 ? (
                                    <div className="space-y-4">
                                        <div className="relative inline-block">
                                            <img
                                                src={newRequest.imageBase64}
                                                alt="Preview"
                                                className="max-h-48 rounded-xl shadow-md border-2 border-blue-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setNewRequest({ ...newRequest, imageBase64: '' })}
                                                className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-600">Image uploaded successfully</p>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer block">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-blue-100 rounded-2xl">
                                                <Camera className="w-8 h-8 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-700">Click to upload photo</p>
                                                <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Info Banner */}
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-blue-200 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-blue-700" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-blue-900 mb-2">What happens next?</p>
                                    <ul className="text-xs text-blue-800 space-y-1">
                                        <li>✓ AI will categorize and prioritize your request</li>
                                        <li>✓ Admin will receive instant email notification</li>
                                        <li>✓ You'll get updates via email at each step</li>
                                        <li>✓ A technician will be assigned shortly</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Submit Request</span>
                                        <TrendingUp className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-6 btn-secondary font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateRequestForm;