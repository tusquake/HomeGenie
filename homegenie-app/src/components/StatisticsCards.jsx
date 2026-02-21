import React from 'react';
import { TrendingUp, AlertCircle, Clock, CheckCircle, Zap } from 'lucide-react';

const StatisticsCard = ({ icon: Icon, label, value, color, trend }) => {
    const colorMap = {
        blue: 'from-blue-500 to-cyan-500 text-white',
        yellow: 'from-yellow-500 to-amber-500 text-white',
        indigo: 'from-indigo-500 to-purple-500 text-white',
        green: 'from-green-500 to-emerald-500 text-white',
        red: 'from-red-500 to-rose-500 text-white',
    };

    return (
        <div className="card group overflow-hidden">
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br ${colorMap[color]} opacity-10 group-hover:scale-110 transition-transform duration-500`}></div>
            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    {trend && (
                        <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                            <TrendingUp className="w-4 h-4" />
                            {trend}
                        </div>
                    )}
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
                <p className="text-4xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
};

const StatisticsCards = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 animate-fade-in">
            <StatisticsCard
                icon={Zap}
                label="Total Requests"
                value={stats.total || 0}
                color="blue"
            />
            <StatisticsCard
                icon={AlertCircle}
                label="Pending"
                value={stats.pending || 0}
                color="yellow"
            />
            <StatisticsCard
                icon={Clock}
                label="In Progress"
                value={stats.inProgress || 0}
                color="indigo"
            />
            <StatisticsCard
                icon={CheckCircle}
                label="Completed"
                value={stats.completed || 0}
                color="green"
            />
            <StatisticsCard
                icon={Zap}
                label="Critical"
                value={stats.critical || 0}
                color="red"
            />
        </div>
    );
};

export default StatisticsCards;