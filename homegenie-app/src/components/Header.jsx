import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, LogOut, Plus } from 'lucide-react';

const Header = ({ user, onLogout, role, onNavigate }) => {
    const navigate = useNavigate();

    const dashboardRoute = role === 'ADMIN' ? '/admin'
        : role === 'TECHNICIAN' ? '/technician' : '/resident';

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate ? onNavigate() : navigate(dashboardRoute)}>
                    <Home className="w-8 h-8 text-indigo-600" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">HomeGenie</h1>
                        <p className="text-sm text-gray-600">{user.fullName} • {role}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => onNavigate ? onNavigate() : navigate(dashboardRoute)}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;