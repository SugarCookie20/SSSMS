//check

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../auth/useAuth';
import {
    CalendarDays,
    Target,
    Book,
    Bell,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Banknote
} from 'lucide-react';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [latestNotice, setLatestNotice] = useState(null);
    const [attendanceReport, setAttendanceReport] = useState([]);
    const [feeStatus, setFeeStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const noticeRes = await api.get('/notices');
                if (noticeRes.data && noticeRes.data.length > 0) {
                    setLatestNotice(noticeRes.data[0]);
                }
                const attRes = await api.get('/student/my-attendance');
                setAttendanceReport(attRes.data);

                try {
                    const feeRes = await api.get('/student/my-fee-status');
                    setFeeStatus(feeRes.data);
                } catch {
                    // Fee status not available, that's OK
                }
            } catch (error) {
                console.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const overallPercentage = attendanceReport.length > 0
        ? Math.round(attendanceReport.reduce((acc, curr) => acc + curr.percentage, 0) / attendanceReport.length)
        : 0;

    const quickAccessCards = [
        { title: 'Schedules', subtitle: 'Timetable, exams, calendar & more', icon: CalendarDays, color: 'blue', href: '/student/schedules' },
        { title: 'Results', subtitle: 'Check your examination results', icon: Target, color: 'green', href: '/student/results' },
        { title: 'Resources', subtitle: 'Access study materials', icon: Book, color: 'indigo', href: '/student/notices' },
        { title: 'Notice Board', subtitle: 'Check the latest announcements', icon: Bell, color: 'orange', href: '/student/notices' },
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

    const formatYear = (str) => {
        if (!str) return '1';
        return str.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());
    };

    if (loading) return <div className="p-8 text-gray-500">Loading Dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="mb-8 md:mb-10">
                <h1 className="text-2xl md:text-3xl font-bold text-blue-700 mb-2">
                    Welcome, {user?.name || user?.email?.split('@')[0] || "Student"}
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                    Architecture | Year {formatYear(user?.currentYear)}
                </p>
            </div>

            {/* Fee Reminder Alert */}
            {feeStatus && feeStatus.status === 'PENDING' && feeStatus.reminders && feeStatus.reminders.length > 0 && (
                <div className="mb-8 space-y-3">
                    {feeStatus.reminders.map((reminder) => (
                        <div key={reminder.id} className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-5 shadow-sm">
                            <div className="flex items-start">
                                <div className="p-2.5 bg-red-100 rounded-lg mr-4 mt-0.5 shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <h3 className="text-base font-bold text-red-800">{reminder.title}</h3>
                                        {reminder.dueDate && (
                                            <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ml-3">
                                                Due: {new Date(reminder.dueDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-red-700 text-sm mt-1">{reminder.message}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-red-200 text-sm">
                                            <Banknote className="w-4 h-4 text-red-500 mr-1.5" />
                                            <span className="text-gray-500 mr-1">Balance:</span>
                                            <span className="font-bold text-red-700">₹{feeStatus.balance?.toLocaleString()}</span>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(reminder.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Fee Pending Banner (if pending but no active reminders) */}
            {feeStatus && feeStatus.status === 'PENDING' && (!feeStatus.reminders || feeStatus.reminders.length === 0) && (
                <div className="mb-8 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center">
                        <div className="p-2.5 bg-amber-100 rounded-lg mr-4 shrink-0">
                            <Banknote className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-base font-bold text-amber-800">Fee Payment Pending</h3>
                            <p className="text-amber-700 text-sm mt-0.5">
                                You have an outstanding balance of <span className="font-bold">₹{feeStatus.balance?.toLocaleString()}</span>. Please clear your dues at the earliest.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Access Grid */}
            <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Access</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {quickAccessCards.map((card, index) => {
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

            {/* Attendance Section */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">My Academic Status</h2>
                    <div className="flex items-center bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                        <span className="text-gray-500 text-sm mr-2">Overall Attendance:</span>
                        <span className={`font-bold ${overallPercentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                    {overallPercentage}%
                </span>
                    </div>
                </div>

                {attendanceReport.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
                        No subjects assigned to your class yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {attendanceReport.map((item, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between mb-4">
                                    <span className="bg-gray-100 text-xs px-2 py-1 rounded font-mono text-gray-600">{item.subjectCode}</span>
                                    <span className={`text-sm font-bold flex items-center ${item.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                                {item.percentage >= 75 ? <TrendingUp className="w-4 h-4 mr-1"/> : <TrendingDown className="w-4 h-4 mr-1"/>}
                                        {item.percentage}%
                            </span>
                                </div>

                                <h4 className="font-bold text-gray-900 mb-2">{item.subjectName}</h4>

                                <div className="text-sm text-gray-500 space-y-1 mb-4">
                                    <div className="flex justify-between"><span>Lectures:</span> <span>{item.totalSessions}</span></div>
                                    <div className="flex justify-between"><span>Attended:</span> <span>{item.attendedSessions}</span></div>
                                </div>

                                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                                    <div className={`h-2 rounded-full ${item.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${item.percentage}%` }}></div>
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                    <button
                                        onClick={() => navigate(`/student/resources/${item.subjectCode}`)}
                                        className="w-full text-blue-600 font-medium text-sm hover:bg-blue-50 py-2.5 rounded-lg transition-colors flex items-center justify-center"
                                    >
                                        <Book className="w-4 h-4 mr-2" /> Study Materials
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Notices */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Notices</h2>
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    {latestNotice ? (
                        <div className="flex items-start">
                            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg mr-4 mt-1">
                                <Bell className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{latestNotice.title}</h3>
                                <p className="text-gray-600 mb-2">{latestNotice.content}</p>
                                <div className="flex items-center text-xs text-gray-400">
                                    <span>{new Date(latestNotice.date).toLocaleDateString()}</span>
                                    <span className="mx-2">•</span>
                                    <span>{latestNotice.author}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-4">No recent notices found.</div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default StudentDashboard;