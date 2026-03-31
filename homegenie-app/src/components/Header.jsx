import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, LogOut, Menu, User as UserIcon, ChevronDown } from 'lucide-react';
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
                    <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity duration-300" onClick={() => { setMobileMenuOpen(false); onNavigate ? onNavigate() : navigate(dashboardRoute); }}>
                        <img src="/logo_homeginie.png" alt="HomeGenie" className="w-10 h-10 rounded-lg shadow-sm object-contain" />
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">HomeGenie</h1>
                            <p className="text-xs text-gray-600 font-medium">{role}</p>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <div className="flex items-center gap-6">
                            <button onClick={() => navigate('/privacy')} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Privacy</button>
                            <button onClick={() => navigate('/terms')} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Terms</button>
                            <button onClick={() => { setMobileMenuOpen(false); navigate('/#contact'); }} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Contact</button>
                        </div>

                        <div className="h-8 w-px bg-gray-200"></div>

                        {/* Profile Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 transition-all duration-300">
                                <div className="w-10 h-10 rounded-full border-2 border-blue-200 overflow-hidden shadow-sm bg-white">
                                    {user.profilePictureUrl ? (
                                        <img src={user.profilePictureUrl} alt={user.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                                            <UserIcon className="w-6 h-6 text-blue-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-left hidden lg:block">
                                    <p className="text-sm font-bold text-gray-800 leading-tight">{user.fullName}</p>
                                    <p className="text-xs text-gray-500">{role}</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right translate-y-2 group-hover:translate-y-0 z-[100]">
                                <div className="px-4 py-2 border-b border-gray-50 mb-1 lg:hidden">
                                     <p className="text-sm font-bold text-gray-800">{user.fullName}</p>
                                     <p className="text-xs text-gray-500">{role}</p>
                                </div>
                                <button 
                                    onClick={() => onNavigate ? onNavigate() : navigate(dashboardRoute)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                                >
                                    <Home className="w-4 h-4" />
                                    Dashboard
                                </button>
                                <button 
                                    onClick={onLogout}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium border-t border-gray-50 mt-1"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
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