import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import {
    Clock, Calendar, BookOpen, GraduationCap, Download,
    CheckCircle, XCircle, Trash2, Eye, Camera, ArrowLeft
} from 'lucide-react';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import CameraCapture from '../../components/ui/CameraCapture';

const TABS = [
    { key: 'myTimetable', label: 'My Timetable', icon: Clock, color: 'blue', mode: 'view' },
    { key: 'exam', label: 'Exam Schedule', icon: Calendar, color: 'indigo', mode: 'upload' },
    { key: 'calendar', label: 'College Calendar', icon: GraduationCap, color: 'green', mode: 'upload' },
    { key: 'academic', label: 'Academic Schedule', icon: BookOpen, color: 'purple', mode: 'upload' },
];

const colorMap = {
    blue: { active: 'border-blue-500 bg-blue-50 text-blue-700', icon: 'text-blue-600' },
    indigo: { active: 'border-indigo-500 bg-indigo-50 text-indigo-700', icon: 'text-indigo-600' },
    green: { active: 'border-green-500 bg-green-50 text-green-700', icon: 'text-green-600' },
    purple: { active: 'border-purple-500 bg-purple-50 text-purple-700', icon: 'text-purple-600' },
};

const formatYear = (str) => str.replace(/_/g, ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

const FacultySchedules = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('myTimetable');
    const [confirm, setConfirm] = useState(null);
    const [showCamera, setShowCamera] = useState(false);

    // View state (My Timetable)
    const [myTimetableUrl, setMyTimetableUrl] = useState(null);

    // Upload state
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [scheduleStatus, setScheduleStatus] = useState([]);

    const fetchData = async () => {
        try {
            const [timetableRes, yearRes, statusRes] = await Promise.all([
                api.get('/timetable/faculty/me'),
                api.get('/exams/classes'),
                api.get('/schedules/status'),
            ]);
            if (timetableRes.data.exists) {
                setMyTimetableUrl(`http://localhost:8080/api/timetable/view/${timetableRes.data.fileName}`);
            }
            setYears(yearRes.data);
            setScheduleStatus(statusRes.data);
        } catch {
            console.error('Failed to load schedule data');
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        setSelectedYear('');
        setFile(null);
        setStatus(null);
        const el = document.getElementById('faculty-schedule-upload');
        if (el) el.value = '';
    }, [activeTab]);

    const handleUpload = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        const formData = new FormData();
        formData.append('year', selectedYear);
        formData.append('file', file);

        let url;
        if (activeTab === 'exam') url = '/exams/upload';
        else if (activeTab === 'calendar') url = '/schedules/upload/college-calendar';
        else url = '/schedules/upload/academic-schedule';

        try {
            await api.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setStatus({ type: 'success', msg: 'Uploaded successfully!' });
            setFile(null);
            setSelectedYear('');
            const el = document.getElementById('faculty-schedule-upload');
            if (el) el.value = '';
            await fetchData();
            setTimeout(() => setStatus(null), 3000);
        } catch {
            setStatus({ type: 'error', msg: 'Upload failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (year, type) => {
        const labels = { calendar: 'College Calendar', academic: 'Academic Schedule' };
        setConfirm({
            message: `Delete ${labels[type]} for ${formatYear(year)}?`,
            onConfirm: async () => {
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
            },
        });
    };

    const tabObj = TABS.find((t) => t.key === activeTab);

    // ======================== RENDER ========================
    return (
        <div className="max-w-5xl mx-auto">
            <button onClick={() => navigate('/faculty/dashboard')} className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Schedules</h1>
                {activeTab === 'myTimetable' && myTimetableUrl && (
                    <a href={myTimetableUrl} download className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg flex items-center hover:bg-blue-100 text-sm font-medium">
                        <Download className="w-4 h-4 mr-2" /> Download
                    </a>
                )}
            </div>
            <p className="text-gray-600 mb-8">View your timetable and manage exam schedules, college calendar &amp; academic schedules.</p>

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

            {/* ===== My Timetable (View Only) ===== */}
            {activeTab === 'myTimetable' && (
                <div className="h-[calc(100vh-320px)]">
                    {myTimetableUrl ? (
                        <div className="w-full h-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <iframe src={myTimetableUrl} className="w-full h-full" title="My Timetable" />
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center shadow-sm">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                <Clock className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-lg">No personal timetable uploaded yet.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ===== Upload tabs (Exam / Calendar / Academic) ===== */}
            {activeTab !== 'myTimetable' && (
                <>
                    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm mb-8">
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Academic Year</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                >
                                    <option value="">-- Select Year --</option>
                                    {years.map((y, i) => (
                                        <option key={i} value={y}>{formatYear(y)}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-gray-50 hover:border-indigo-500 transition-colors cursor-pointer group">
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="hidden"
                                    id="faculty-schedule-upload"
                                    required
                                />
                                <label htmlFor="faculty-schedule-upload" className="cursor-pointer block w-full h-full">
                                    <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                        <tabObj.icon className={`w-8 h-8 ${colorMap[tabObj.color].icon}`} />
                                    </div>
                                    <span className="text-gray-900 font-medium block text-lg">
                                        {file ? file.name : 'Click to Upload File'}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1 block">PDF or Images (Max 10MB)</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowCamera(true)}
                                    className="inline-flex items-center mt-3 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                                >
                                    <Camera className="w-4 h-4 mr-1.5" /> Take Photo
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !file || !selectedYear}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Uploading...' : `Publish ${tabObj.label}`}
                            </button>
                        </form>
                    </div>

                    {/* Status table for Calendar & Academic */}
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
                </>
            )}

            <ConfirmDialog config={confirm} onClose={() => setConfirm(null)} />
            <CameraCapture
                open={showCamera}
                onClose={() => setShowCamera(false)}
                onCapture={(f) => { setFile(f); setShowCamera(false); }}
            />
        </div>
    );
};

export default FacultySchedules;



