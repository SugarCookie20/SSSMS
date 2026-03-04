import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { ArrowLeft, FileSpreadsheet, FileDown, Edit3, Calendar, Users } from 'lucide-react';

const AttendanceReport = () => {
    const { id } = useParams(); // Allocation ID
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'datewise'

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchReport = async () => {
        setLoading(true);
        try {
            let url = `/faculty/report/${id}`;
            if (startDate && endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }
            const response = await api.get(url);
            setData(response.data);
        } catch {
            console.error("Error fetching report");
        } finally {
            setLoading(false);
        }
    };

    const fetchSessions = async () => {
        try {
            const res = await api.get(`/faculty/attendance/${id}/sessions`);
            setSessions(res.data);
        } catch {
            console.error("Error fetching sessions");
        }
    };

    useEffect(() => {
        fetchReport();
        fetchSessions();
    }, []);

    const handleDownload = async () => {
        try {
            let url = `/faculty/report/download/${id}`;
            if (startDate && endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }

            const response = await api.get(url, { responseType: 'blob' });

            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `${data?.subjectName || 'Attendance'}_Report.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            alert("Download failed. Please try again.");
        }
    };

    const handleDownloadPDF = async () => {
        try {
            let url = `/faculty/report/pdf/${id}`;
            if (startDate && endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }

            const response = await api.get(url, { responseType: 'blob' });

            const downloadUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'text/html; charset=utf-8' }));
            const printWindow = window.open(downloadUrl, '_blank');
            if (printWindow) {
                printWindow.addEventListener('load', () => {
                    printWindow.print();
                });
            }
        } catch {
            alert("PDF download failed. Please try again.");
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-10">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>

            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Attendance Report</h1>
                    <p className="text-gray-600 mt-1">
                        {data ? `${data.subjectName} (${data.className})` : 'Loading...'}
                    </p>
                </div>

                {/* Filters */}
                <div className="flex gap-2 items-center bg-white p-2 rounded-lg border shadow-sm flex-wrap">
                    <span className="text-xs font-bold text-gray-500 uppercase px-2">Filter:</span>
                    <input
                        type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        className="border rounded p-1 text-sm outline-none"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                        type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                        className="border rounded p-1 text-sm outline-none"
                    />
                    <button
                        onClick={fetchReport}
                        className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                        Apply
                    </button>
                    <button
                        onClick={() => {setStartDate(''); setEndDate(''); fetchReport();}}
                        className="text-red-500 text-xs hover:underline px-2"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="p-10 text-center text-gray-500">Generating Analysis...</div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-gray-500 text-xs font-bold uppercase">Total Sessions</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{data?.totalSessionsHeld}</p>
                            <p className="text-xs text-gray-400 mt-1">{data?.range}</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-gray-500 text-xs font-bold uppercase">Average Attendance</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">
                                {data?.studentStats.length > 0
                                    ? Math.round(data.studentStats.reduce((acc, s) => acc + s.percentage, 0) / data.studentStats.length)
                                    : 0}%
                            </p>
                        </div>

                        {/* Download Card */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase">Export Data</p>
                                <p className="text-xs text-gray-400 mt-1">Download report as CSV or print as PDF</p>
                            </div>
                            <div className="mt-3 w-full flex gap-2">
                                <button
                                    onClick={handleDownload}
                                    className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center transition-colors border border-green-200"
                                >
                                    <FileSpreadsheet className="w-4 h-4 mr-1.5" /> CSV
                                </button>
                                <button
                                    onClick={handleDownloadPDF}
                                    className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center transition-colors border border-blue-200"
                                >
                                    <FileDown className="w-4 h-4 mr-1.5" /> PDF
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeTab === 'summary' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Users className="w-4 h-4 inline mr-1.5" />Student Summary
                        </button>
                        <button
                            onClick={() => setActiveTab('datewise')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeTab === 'datewise' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Calendar className="w-4 h-4 inline mr-1.5" />Date-wise Sessions
                        </button>
                    </div>

                    {/* Student Summary Table */}
                    {activeTab === 'summary' && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600 uppercase">
                                    <tr>
                                        <th className="p-4">Student Name</th>
                                        <th className="p-4">PRN</th>
                                        <th className="p-4">Present / Total</th>
                                        <th className="p-4">Percentage</th>
                                        <th className="p-4">Status</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                    {data?.studentStats.map((s, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-medium text-gray-900">{s.studentName}</td>
                                            <td className="p-4 text-gray-500 font-mono">{s.prn}</td>
                                            <td className="p-4 text-gray-700">
                                                <span className="font-bold">{s.sessionsAttended}</span> / {data.totalSessionsHeld}
                                            </td>
                                            <td className="p-4 font-bold">{s.percentage}%</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    s.percentage >= 75 ? 'bg-green-100 text-green-700' :
                                                        s.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                }`}>
                                                    {s.percentage >= 75 ? 'Good' : s.percentage >= 50 ? 'Warning' : 'Critical'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Date-wise Sessions */}
                    {activeTab === 'datewise' && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600 uppercase">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Present</th>
                                        <th className="p-4">Absent</th>
                                        <th className="p-4">Total</th>
                                        <th className="p-4">Action</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                    {sessions.length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-gray-400">No sessions recorded yet.</td></tr>
                                    ) : sessions.map((s) => (
                                        <tr key={s.sessionId} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-medium text-gray-900">
                                                <Calendar className="w-4 h-4 inline mr-2 text-gray-400" />
                                                {new Date(s.date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">{s.presentCount}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">{s.absentCount}</span>
                                            </td>
                                            <td className="p-4 text-gray-600">{s.totalStudents}</td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => navigate(`/faculty/attendance/${id}?editDate=${s.date}`)}
                                                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AttendanceReport;