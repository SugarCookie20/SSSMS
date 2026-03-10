import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../auth/useAuth';
import {
    CalendarDays,
    Target,
    Book,
    UserCheck,
    Bell,
    BarChart3,
    Award
} from 'lucide-react';

const FacultyDashboard = () => {
    const { user } = useAuth();
    const [recentNotices, setRecentNotices] = useState([]);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const response = await api.get('/notices');
                if (response.data && response.data.length > 0) {
                    setRecentNotices(response.data);
                }
            } catch (error) {
                console.error("Failed to load notices");
            }
        };
        fetchNotices();
    }, []);

    // Configuration for the Dashboard Cards
    const quickActions = [
        {
            title: 'Manage Attendance',
            subtitle: 'Record daily student attendance',
            icon: UserCheck,
            color: 'blue',
            href: '/faculty/attendance'
        },
        {
            title: 'Upload Study Materials',
            subtitle: 'Share notes and PDFs with students',
            icon: Book,
            color: 'purple',
            href: '/faculty/upload'
        },
        {
            title: 'Upload Results',
            subtitle: 'Enter internal assessment marks',
            icon: Target,
            color: 'green',
            href: '/faculty/results'
        },
        {
            title: 'Post Notices',
            subtitle: 'Create class announcements',
            icon: Bell,
            color: 'orange',
            href: '/faculty/notices'
        },
        {
            title: 'Schedules',
            subtitle: 'Timetable, exams, calendar & more',
            icon: CalendarDays,
            color: 'indigo',
            href: '/faculty/schedules'
        },
        {
            title: 'Professional Development',
            subtitle: 'Log workshops, QIPs & certifications',
            icon: Award,
            color: 'purple',
            href: '/faculty/professional-development'
        },
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            purple: 'bg-purple-50 text-purple-600',
            indigo: 'bg-indigo-50 text-indigo-600',
            orange: 'bg-orange-50 text-orange-600',
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="mb-8 md:mb-10">
                <h1 className="text-2xl md:text-3xl font-bold text-blue-700 mb-2">
                    Welcome, {user?.name || "Professor"}
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                    Faculty Portal | Architecture Department
                </p>

            </div>

            {/* Quick Actions Grid */}
            <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quickActions.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                key={index}
                                to={card.href}
                                className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 group block"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-lg ${getColorClasses(card.color)}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                    {card.title}
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {card.subtitle}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Recent Notices */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Notices</h2>
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    {recentNotices.length > 0 ? (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {recentNotices.map((notice) => (
                                <div key={notice.id} className="flex items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                    <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg mr-4 mt-1 shrink-0">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base font-bold text-gray-900 mb-1">{notice.title}</h3>
                                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{notice.content}</p>
                                        <div className="flex items-center text-xs text-gray-400">
                                            <span>{new Date(notice.date).toLocaleDateString()}</span>
                                            <span className="mx-2">•</span>
                                            <span>{notice.author}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-4">No recent notices found.</div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default FacultyDashboard;