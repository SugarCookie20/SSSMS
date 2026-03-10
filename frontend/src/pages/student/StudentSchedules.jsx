import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { Calendar, Clock, GraduationCap, BookOpen, Download, ArrowLeft } from 'lucide-react';

const TABS = [
    { key: 'exam', label: 'Exam Schedule', icon: Calendar, color: 'blue' },
    { key: 'timetable', label: 'Class Timetable', icon: Clock, color: 'indigo' },
    { key: 'calendar', label: 'College Calendar', icon: GraduationCap, color: 'green' },
    { key: 'academic', label: 'Academic Schedule', icon: BookOpen, color: 'purple' },
];

const colorClasses = {
    blue: { active: 'border-blue-500 text-blue-700 bg-blue-50', icon: 'text-blue-600' },
    indigo: { active: 'border-indigo-500 text-indigo-700 bg-indigo-50', icon: 'text-indigo-600' },
    green: { active: 'border-green-500 text-green-700 bg-green-50', icon: 'text-green-600' },
    purple: { active: 'border-purple-500 text-purple-700 bg-purple-50', icon: 'text-purple-600' },
};

const StudentSchedules = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('exam');
    const [loading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState({
        exam: null,
        timetable: null,
        calendar: null,
        academic: null,
    });

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [examRes, timetableRes, schedulesRes] = await Promise.all([
                    api.get('/exams/student/me'),
                    api.get('/timetable/student/me'),
                    api.get('/schedules/student/me'),
                ]);

                setSchedules({
                    exam: examRes.data.exists
                        ? `http://localhost:8080/api/exams/view/${examRes.data.fileName}`
                        : null,
                    timetable: timetableRes.data.exists
                        ? `http://localhost:8080/api/timetable/view/${timetableRes.data.fileName}`
                        : null,
                    calendar: schedulesRes.data.collegeCalendar?.exists
                        ? `http://localhost:8080/api/schedules/view/${schedulesRes.data.collegeCalendar.fileName}`
                        : null,
                    academic: schedulesRes.data.academicSchedule?.exists
                        ? `http://localhost:8080/api/schedules/view/${schedulesRes.data.academicSchedule.fileName}`
                        : null,
                });
            } catch {
                console.error('Failed to load schedules');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const activeTabData = TABS.find((t) => t.key === activeTab);
    const pdfUrl = schedules[activeTab];

    const emptyMessages = {
        exam: 'No exam schedule announced yet.',
        timetable: 'No timetable uploaded for your class yet.',
        calendar: 'No college calendar published yet.',
        academic: 'No academic schedule published yet.',
    };

    if (loading) return <div className="p-8 text-gray-500">Loading Schedules...</div>;

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
            <button onClick={() => navigate('/student/dashboard')} className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Schedules</h1>
                    <p className="text-sm text-gray-500 mt-1">View your exam schedule, timetable, college calendar and academic schedule</p>
                </div>
                {pdfUrl && (
                    <a
                        href={pdfUrl}
                        download
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg flex items-center hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                        <Download className="w-4 h-4 mr-2" /> Download
                    </a>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    const colors = colorClasses[tab.color];
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center px-4 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${
                                isActive
                                    ? colors.active
                                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <Icon className={`w-4 h-4 mr-2 ${isActive ? colors.icon : 'text-gray-400'}`} />
                            {tab.label}
                            {schedules[tab.key] && (
                                <span className={`ml-2 w-2 h-2 rounded-full ${isActive ? 'bg-current' : 'bg-green-400'}`} />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0">
                {pdfUrl ? (
                    <div className="w-full h-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <iframe src={pdfUrl} className="w-full h-full" title={activeTabData.label} />
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-xl p-16 text-center shadow-sm">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <activeTabData.icon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg">{emptyMessages[activeTab]}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentSchedules;


