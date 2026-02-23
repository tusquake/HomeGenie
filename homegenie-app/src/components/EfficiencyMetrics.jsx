import React from 'react';
import { Clock, CheckCircle2, TrendingUp, AlertTriangle, FileSpreadsheet, MessageCircle, Zap } from 'lucide-react';

const EfficiencyMetrics = () => {
    return (
        <div className="mb-10 w-full animate-fade-in shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-6 text-white">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    Impact & Efficiency Metrics
                </h3>
                <p className="opacity-90 mt-1 text-sm">Comparing traditional manual workflows against HomeGenie automation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-slate-800">
                {/* Manual Process Side */}
                <div className="p-8 bg-slate-50 dark:bg-slate-950/50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Traditional Workflow</h4>
                            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                <FileSpreadsheet className="w-4 h-4" /> Excel + <MessageCircle className="w-4 h-4 ml-1" /> WhatsApp
                            </p>
                        </div>
                    </div>

                    <ul className="space-y-4">
                        <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                            <Clock className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="block font-semibold">Slow Request Routing</span>
                                <span className="text-sm text-gray-500">Average 45-60 mins to manually assign tasks to technicians via chat.</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                            <FileSpreadsheet className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="block font-semibold">Data Fragmentation</span>
                                <span className="text-sm text-gray-500">Spreadsheets get lost, corrupted, or are difficult to search historically.</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                            <MessageCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="block font-semibold">Poor Tracking completely manual</span>
                                <span className="text-sm text-gray-500">Residents have to constantly message for updates. "Is someone coming?"</span>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* HomeGenie Side */}
                <div className="p-8 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">HomeGenie Platform</h4>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                                Automated & Intelligent
                            </p>
                        </div>
                    </div>

                    <ul className="space-y-4">
                        <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="block font-semibold">Instant Automatic Routing</span>
                                <span className="text-sm text-gray-500">Technicians are alerted instantly with context. Routing time drops to &lt; 1 second.</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="block font-semibold">Centralized Source of Truth</span>
                                <span className="text-sm text-gray-500">All request history, states, and technician assignments tracked automatically.</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="block font-semibold">Real-Time Event Driven Updates</span>
                                <span className="text-sm text-gray-500">Residents are automatically emailed instantly on status changes. No manual messages needed.</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default EfficiencyMetrics;
