import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import {
    LayoutDashboard, User, LogOut, CalendarDays, Target,
    Bell, Menu, X
} from 'lucide-react';

const StudentLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
        { name: 'Schedules', href: '/student/schedules', icon: CalendarDays },
        { name: 'Results', href: '/student/results', icon: Target },
        { name: 'Notices', href: '/student/notices', icon: Bell },
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

            {/* 1. Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* 2. Sidebar Component */}
            <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:inset-auto
      `}>

                {/* Logo Section */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <img src="/sssms-logo.png" alt="Logo" className="w-8 h-8 object-contain mr-3" />
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 leading-tight">SSSMS</h1>
                            <p className="text-xs text-gray-500">Student Portal</p>
                        </div>
                    </div>
                    {/* Close Button (Mobile Only) */}
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* User Profile Section */}
                <Link to="/student/profile" className="block px-6 py-6 border-b border-gray-200 hover:bg-gray-50 transition-colors group cursor-pointer">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                                {user?.name || "Student"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Year {user?.currentYear || '1'}</p>
                        </div>
                    </div>
                </Link>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setSidebarOpen(false)} // Close menu on click (Mobile)
                            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                isActive(item.href)
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 mr-3 ${isActive(item.href) ? 'text-indigo-600' : 'text-gray-400'}`} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50"
                    >
                        <LogOut className="w-5 h-5 mr-3 text-gray-400" />
                        Sign out
                    </button>
                </div>
            </div>

            {/* 3. Main Content Wrapper */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Mobile Header (Hamburger Menu) */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 lg:hidden">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-600 p-2">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="ml-3 font-bold text-gray-900">SSSMS Portal</span>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;