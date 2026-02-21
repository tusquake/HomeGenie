import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

const Header = ({ user, onLogout, role, onNavigate }) => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const dashboardRoute = role === 'ADMIN' ? '/admin'
        : role === 'TECHNICIAN' ? '/technician' : '/resident';

    const handleLogout = () => {
        setMobileMenuOpen(false);
        onLogout();
    };

    return (
        <header className="sticky top-0 z-50 bg-gradient-to-r from-white via-blue-50 to-indigo-50 border-b-2 border-blue-100 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo Section */}
                    <div 
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity duration-300"
                        onClick={() => {
                            setMobileMenuOpen(false);
                            onNavigate ? onNavigate() : navigate(dashboardRoute);
                        }}
                    >
                        <div className="p-2 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl shadow-lg">
                            <Home className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                HomeGenie
                            </h1>
                            <p className="text-xs text-gray-600 font-medium">{role}</p>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <p className="text-sm font-semibold text-gray-800">{user.fullName}</p>
                            <p className="text-xs text-gray-500">{role}</p>
                        </div>
                        <button
                            onClick={() => onNavigate ? onNavigate() : navigate(dashboardRoute)}
                            className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-all duration-300 border border-blue-200 hover:border-blue-400"
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-300 border border-red-200 hover:border-red-400 font-semibold"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Menu className="w-6 h-6 text-gray-700" />
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pt-4 border-t border-gray-200 space-y-3 animate-slide-down">
                        <div className="px-4 py-2 bg-blue-50 rounded-lg">
                            <p className="text-sm font-semibold text-gray-800">{user.fullName}</p>
                            <p className="text-xs text-gray-500">{role}</p>
                        </div>
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                onNavigate ? onNavigate() : navigate(dashboardRoute);
                            }}
                            className="w-full px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-all"
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all font-semibold"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;