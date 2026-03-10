import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { Upload, Calendar, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

const UploadExamSchedule = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dashboardPath = location.pathname.startsWith('/admin') ? '/admin/dashboard' : '/faculty/dashboard';
    const [years, setYears] = useState([]); // Changed classes -> years
    const [selectedYear, setSelectedYear] = useState(''); // Changed selectedClass -> selectedYear
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchYears = async () => {
            try {
                // Fetch Enums from backend
                const res = await api.get('/exams/classes');
                setYears(res.data);
            } catch (e) {
                console.error("Failed to load years");
            }
        };
        fetchYears();
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        const formData = new FormData();
        formData.append('year', selectedYear); // Changed classId -> year
        formData.append('file', file);

        try {
            await api.post('/exams/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
            setStatus({ type: 'success', msg: 'Schedule Uploaded Successfully!' });

            // Auto-hide
            setTimeout(() => setStatus(null), 3000);
            setFile(null);
            setSelectedYear('');
        } catch (e) {
            setStatus({ type: 'error', msg: 'Upload Failed.' });
        } finally {
            setLoading(false);
        }
    };

    // Format Enum for Display
    const formatYear = (str) => str.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());

    return (
        <div className="max-w-3xl mx-auto">
            <button onClick={() => navigate(dashboardPath)} className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Scheduling</h1>
            <p className="text-gray-600 mb-8">Publish exam timetables for specific academic years.</p>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">

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
                            value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
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
                            id="exam-upload"
                            required
                        />
                        <label htmlFor="exam-upload" className="cursor-pointer block w-full h-full">
                            <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <Calendar className="w-8 h-8 text-indigo-600" />
                            </div>
                            <span className="text-gray-900 font-medium block text-lg">
                    {file ? file.name : "Click to Upload Schedule"}
                </span>
                            <span className="text-xs text-gray-500 mt-1 block">PDF Format Only (Max 10MB)</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !file}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Uploading...' : 'Publish Schedule'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadExamSchedule;