import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axiosConfig';
import {
    Upload, BookOpen, CheckCircle, XCircle,
    Trash2, Eye, GraduationCap, ArrowLeft
} from 'lucide-react';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const ManageSchedules = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dashboardPath = location.pathname.startsWith('/admin') ? '/admin/dashboard' : '/faculty/dashboard';
    const [years, setYears] = useState([]);
    const [scheduleType, setScheduleType] = useState('CALENDAR');
    const [selectedYear, setSelectedYear] = useState('');
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [scheduleStatus, setScheduleStatus] = useState([]);
    const [confirm, setConfirm] = useState(null);

    const fetchData = async () => {
        try {
            const [yearRes, statusRes] = await Promise.all([
                api.get('/exams/classes'),
                api.get('/schedules/status'),
            ]);
            setYears(yearRes.data);
            setScheduleStatus(statusRes.data);
        } catch {
            console.error('Failed to load data');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        const formData = new FormData();
        formData.append('year', selectedYear);
        formData.append('file', file);

        const url = scheduleType === 'CALENDAR'
            ? '/schedules/upload/college-calendar'
            : '/schedules/upload/academic-schedule';

        try {
            await api.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setStatus({ type: 'success', msg: `${scheduleType === 'CALENDAR' ? 'College Calendar' : 'Academic Schedule'} uploaded successfully!` });
            setFile(null);
            setSelectedYear('');
            // Reset file input
            const fileInput = document.getElementById('schedule-upload');
            if (fileInput) fileInput.value = '';
            await fetchData();
            setTimeout(() => setStatus(null), 3000);
        } catch {
            setStatus({ type: 'error', msg: 'Upload Failed.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (year, type) => {
        setConfirm({
            message: `Delete the ${type === 'CALENDAR' ? 'College Calendar' : 'Academic Schedule'} for ${formatYear(year)}?`,
            onConfirm: async () => {
                try {
                    const url = type === 'CALENDAR'
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

    const formatYear = (str) => str.replace(/_/g, ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

    return (
        <div className="max-w-5xl mx-auto">
            <button onClick={() => navigate(dashboardPath)} className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Management</h1>
            <p className="text-gray-600 mb-8">Upload and manage College Calendar and Academic Schedules for each academic year.</p>

            {/* Upload Section */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm mb-8">

                {/* Toggle */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => { setScheduleType('CALENDAR'); setSelectedYear(''); setFile(null); }}
                        className={`flex-1 p-4 rounded-lg border-2 flex items-center justify-center font-bold transition-all ${
                            scheduleType === 'CALENDAR'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                    >
                        <GraduationCap className="w-5 h-5 mr-2" /> College Calendar
                    </button>
                    <button
                        onClick={() => { setScheduleType('ACADEMIC'); setSelectedYear(''); setFile(null); }}
                        className={`flex-1 p-4 rounded-lg border-2 flex items-center justify-center font-bold transition-all ${
                            scheduleType === 'ACADEMIC'
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                    >
                        <BookOpen className="w-5 h-5 mr-2" /> Academic Schedule
                    </button>
                </div>

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
                            {years.map((y, index) => (
                                <option key={index} value={y}>{formatYear(y)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-gray-50 hover:border-indigo-500 transition-colors cursor-pointer group">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="hidden"
                            id="schedule-upload"
                            required
                        />
                        <label htmlFor="schedule-upload" className="cursor-pointer block w-full h-full">
                            <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-indigo-600" />
                            </div>
                            <span className="text-gray-900 font-medium block text-lg">
                                {file ? file.name : 'Click to Upload PDF'}
                            </span>
                            <span className="text-xs text-gray-500 mt-1 block">PDF Format Only (Max 10MB)</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !file || !selectedYear}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Uploading...' : `Publish ${scheduleType === 'CALENDAR' ? 'College Calendar' : 'Academic Schedule'}`}
                    </button>
                </form>
            </div>

            {/* Current Status Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Published Schedules</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Year</th>
                                <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">College Calendar</th>
                                <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Academic Schedule</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {scheduleStatus.map((item) => (
                                <tr key={item.year} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{formatYear(item.year)}</td>
                                    <td className="px-6 py-4 text-center">
                                        {item.collegeCalendar ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                    Uploaded
                                                </span>
                                                <a
                                                    href={`http://localhost:8080/api/schedules/view/${item.collegeCalendarFile}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(item.year, 'CALENDAR')}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Not uploaded</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {item.academicSchedule ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                    Uploaded
                                                </span>
                                                <a
                                                    href={`http://localhost:8080/api/schedules/view/${item.academicScheduleFile}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(item.year, 'ACADEMIC')}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Not uploaded</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmDialog config={confirm} onClose={() => setConfirm(null)} />
        </div>
    );
};

export default ManageSchedules;





