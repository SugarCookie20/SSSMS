import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import {
    Clock, Calendar, BookOpen, GraduationCap,
    CheckCircle, XCircle, Users, User, Trash2, Eye
} from 'lucide-react';

const TABS = [
    { key: 'timetable', label: 'Class Timetable', icon: Clock, color: 'blue' },
    { key: 'exam', label: 'Exam Schedule', icon: Calendar, color: 'indigo' },
    { key: 'calendar', label: 'College Calendar', icon: GraduationCap, color: 'green' },
    { key: 'academic', label: 'Academic Schedule', icon: BookOpen, color: 'purple' },
];

const colorMap = {
    blue: { active: 'border-blue-500 bg-blue-50 text-blue-700', icon: 'text-blue-600' },
    indigo: { active: 'border-indigo-500 bg-indigo-50 text-indigo-700', icon: 'text-indigo-600' },
    green: { active: 'border-green-500 bg-green-50 text-green-700', icon: 'text-green-600' },
    purple: { active: 'border-purple-500 bg-purple-50 text-purple-700', icon: 'text-purple-600' },
};

const formatYear = (str) => str.replace(/_/g, ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

const AdminScheduleManager = () => {
    const [activeTab, setActiveTab] = useState('timetable');

    // Shared data
    const [years, setYears] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [scheduleStatus, setScheduleStatus] = useState([]);

    // Form state
    const [selectedId, setSelectedId] = useState('');
    const [uploadSubType, setUploadSubType] = useState('CLASS'); // for timetable tab: CLASS or FACULTY
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            const [yearRes, facRes, statusRes] = await Promise.all([
                api.get('/exams/classes'),
                api.get('/admin/faculty/all'),
                api.get('/schedules/status'),
            ]);
            setYears(yearRes.data);
            setFacultyList(facRes.data);
            setScheduleStatus(statusRes.data);
        } catch {
            console.error('Failed to load data');
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Reset form when switching tabs
    useEffect(() => {
        setSelectedId('');
        setFile(null);
        setStatus(null);
        setUploadSubType('CLASS');
        // Reset file input
        const el = document.getElementById('admin-schedule-upload');
        if (el) el.value = '';
    }, [activeTab]);

    const handleUpload = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        const formData = new FormData();
        formData.append('file', file);

        let url;
        if (activeTab === 'timetable') {
            if (uploadSubType === 'CLASS') {
                url = '/timetable/upload/class';
                formData.append('year', selectedId);
            } else {
                url = '/timetable/upload/faculty';
                formData.append('facultyId', selectedId);
            }
        } else if (activeTab === 'exam') {
            url = '/exams/upload';
            formData.append('year', selectedId);
        } else if (activeTab === 'calendar') {
            url = '/schedules/upload/college-calendar';
            formData.append('year', selectedId);
        } else {
            url = '/schedules/upload/academic-schedule';
            formData.append('year', selectedId);
        }

        try {
            await api.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setStatus({ type: 'success', msg: 'Uploaded successfully!' });
            setFile(null);
            setSelectedId('');
            const el = document.getElementById('admin-schedule-upload');
            if (el) el.value = '';
            await fetchData();
            setTimeout(() => setStatus(null), 3000);
        } catch {
            setStatus({ type: 'error', msg: 'Upload failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (year, type) => {
        const labels = { calendar: 'College Calendar', academic: 'Academic Schedule' };
        if (!window.confirm(`Delete ${labels[type]} for ${formatYear(year)}?`)) return;
        try {
            const url = type === 'calendar'
                ? `/schedules/college-calendar/${year}`
                : `/schedules/academic-schedule/${year}`;
            await api.delete(url);
            setStatus({ type: 'success', msg: 'Deleted successfully!' });
            await fetchData();
            setTimeout(() => setStatus(null), 3000);
        } catch {
            setStatus({ type: 'error', msg: 'Delete failed.' });
        }
    };

    const tabObj = TABS.find((t) => t.key === activeTab);

    // Label for select dropdown
    const getSelectLabel = () => {
        if (activeTab === 'timetable' && uploadSubType === 'FACULTY') return 'Select Faculty Member';
        return 'Select Academic Year';
    };

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Manager</h1>
            <p className="text-gray-600 mb-8">Upload and manage timetables, exam schedules, college calendar, and academic schedules.</p>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-8">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    const colors = colorMap[tab.color];
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center px-4 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${
                                isActive ? colors.active : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <Icon className={`w-4 h-4 mr-2 ${isActive ? colors.icon : 'text-gray-400'}`} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Upload Card */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm mb-8">

                {/* Timetable sub-toggle: CLASS vs FACULTY */}
                {activeTab === 'timetable' && (
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={() => { setUploadSubType('CLASS'); setSelectedId(''); }}
                            className={`flex-1 p-4 rounded-lg border-2 flex items-center justify-center font-bold transition-all ${
                                uploadSubType === 'CLASS'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                        >
                            <Users className="w-5 h-5 mr-2" /> Class Timetable
                        </button>
                        <button
                            onClick={() => { setUploadSubType('FACULTY'); setSelectedId(''); }}
                            className={`flex-1 p-4 rounded-lg border-2 flex items-center justify-center font-bold transition-all ${
                                uploadSubType === 'FACULTY'
                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                        >
                            <User className="w-5 h-5 mr-2" /> Faculty Timetable
                        </button>
                    </div>
                )}

                {/* Status Banner */}
                {status && (
                    <div className={`p-4 mb-6 rounded-lg flex items-center border ${
                        status.type === 'success'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        {status.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <XCircle className="w-5 h-5 mr-3" />}
                        <span className="font-medium">{status.msg}</span>
                    </div>
                )}

                <form onSubmit={handleUpload} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{getSelectLabel()}</label>
                        <select
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                            className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        >
                            <option value="">-- Select --</option>
                            {activeTab === 'timetable' && uploadSubType === 'FACULTY'
                                ? facultyList.map((f) => (
                                    <option key={f.id} value={f.id}>{f.name} ({f.designation})</option>
                                ))
                                : years.map((y, i) => (
                                    <option key={i} value={y}>{formatYear(y)}</option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-gray-50 hover:border-indigo-500 transition-colors cursor-pointer group">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="hidden"
                            id="admin-schedule-upload"
                            required
                        />
                        <label htmlFor="admin-schedule-upload" className="cursor-pointer block w-full h-full">
                            <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <tabObj.icon className={`w-8 h-8 ${colorMap[tabObj.color].icon}`} />
                            </div>
                            <span className="text-gray-900 font-medium block text-lg">
                                {file ? file.name : 'Click to Upload PDF'}
                            </span>
                            <span className="text-xs text-gray-500 mt-1 block">PDF Format Only (Max 10MB)</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !file || !selectedId}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Uploading...' : `Publish ${tabObj.label}`}
                    </button>
                </form>
            </div>

            {/* Status Table for Calendar & Academic Schedule */}
            {(activeTab === 'calendar' || activeTab === 'academic') && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900">
                            Published {activeTab === 'calendar' ? 'College Calendars' : 'Academic Schedules'}
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Year</th>
                                    <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {scheduleStatus.map((item) => {
                                    const hasFile = activeTab === 'calendar' ? item.collegeCalendar : item.academicSchedule;
                                    const fileName = activeTab === 'calendar' ? item.collegeCalendarFile : item.academicScheduleFile;
                                    const delType = activeTab === 'calendar' ? 'calendar' : 'academic';
                                    return (
                                        <tr key={item.year} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{formatYear(item.year)}</td>
                                            <td className="px-6 py-4 text-center">
                                                {hasFile ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">Uploaded</span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">Not uploaded</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {hasFile && (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <a
                                                            href={`http://localhost:8080/api/schedules/view/${fileName}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </a>
                                                        <button
                                                            onClick={() => handleDelete(item.year, delType)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminScheduleManager;



