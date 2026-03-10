import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { GraduationCap, Save, CheckCircle, XCircle, Filter, ArrowLeft } from 'lucide-react';

const GPALedger = () => {
    const navigate = useNavigate();
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSemester, setSelectedSemester] = useState(1);
    const [students, setStudents] = useState([]);
    const [sgpaValues, setSgpaValues] = useState({});
    const [statusValues, setStatusValues] = useState({});
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Max semesters allowed per academic year (2 sems per year)
    const maxSemesterMap = {
        FIRST_YEAR: 2,
        SECOND_YEAR: 4,
        THIRD_YEAR: 6,
        FOURTH_YEAR: 8,
        FIFTH_YEAR: 10,
    };

    const maxSemester = maxSemesterMap[selectedYear] || 10;
    const availableSemesters = Array.from({ length: maxSemester }, (_, i) => i + 1);

    // Fetch academic years
    useEffect(() => {
        const fetchYears = async () => {
            try {
                const res = await api.get('/admin/years');
                setYears(res.data);
            } catch {
                console.error('Failed to load years');
            }
        };
        fetchYears();
    }, []);

    // Fetch students when year and semester change
    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/gpa/students', {
                params: {
                    year: selectedYear,
                    semester: selectedSemester
                }
            });
            setStudents(res.data);

            // Pre-fill existing SGPA and status values
            const sgpaMap = {};
            const statusMap = {};
            res.data.forEach(student => {
                if (student.sgpa) {
                    sgpaMap[student.id] = student.sgpa;
                }
                if (student.status) {
                    statusMap[student.id] = student.status;
                } else {
                    statusMap[student.id] = 'PASS'; // Default status
                }
            });
            setSgpaValues(sgpaMap);
            setStatusValues(statusMap);
        } catch {
            setMessage({ type: 'error', text: 'Failed to load students' });
        } finally {
            setLoading(false);
        }
    }, [selectedYear, selectedSemester]);

    useEffect(() => {
        if (selectedYear && selectedSemester) {
            fetchStudents();
        }
    }, [selectedYear, selectedSemester, fetchStudents]);

    const handleYearChange = (year) => {
        setSelectedYear(year);
        const newMax = maxSemesterMap[year] || 10;
        if (selectedSemester > newMax) {
            setSelectedSemester(1);
        }
    };

    const handleSGPAChange = (studentId, value) => {
        setSgpaValues(prev => ({
            ...prev,
            [studentId]: value
        }));
    };

    const handleStatusChange = (studentId, value) => {
        setStatusValues(prev => ({
            ...prev,
            [studentId]: value
        }));
    };

    const handleSaveAll = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        const batch = students
            .filter(student => sgpaValues[student.id]) // Only send students with SGPA entered
            .map(student => ({
                studentId: student.id,
                semester: selectedSemester,
                sgpa: parseFloat(sgpaValues[student.id]),
                status: statusValues[student.id] || 'PASS'
            }));

        if (batch.length === 0) {
            setMessage({ type: 'error', text: 'No SGPA values entered' });
            setSaving(false);
            return;
        }

        try {
            await api.post('/admin/gpa/batch', batch);
            setMessage({ type: 'success', text: `SGPA saved for ${batch.length} students` });
            // Refresh to show updated CGPA
            fetchStudents();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || err.response?.data || 'Failed to save SGPA' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <button onClick={() => navigate('/admin/dashboard')} className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="w-8 h-8 text-blue-600" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">GPA Ledger</h1>
                    <p className="text-gray-600">Enter semester-wise SGPA for students</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-bold text-gray-900">Select Year & Semester</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Academic Year
                        </label>
                        <select
                            value={selectedYear}
                            onChange={(e) => handleYearChange(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Year</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Semester
                        </label>
                        <select
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {availableSemesters.map(sem => (
                                <option key={sem} value={sem}>Semester {sem}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Status Message */}
            {message.text && (
                <div className={`p-4 mb-6 rounded-lg flex items-center border ${
                    message.type === 'success' 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <XCircle className="w-5 h-5 mr-3" />}
                    {message.text}
                </div>
            )}

            {/* Students Table */}
            {selectedYear && selectedSemester && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-gray-900">
                                Students - {selectedYear.replace(/_/g, ' ')} - Semester {selectedSemester}
                            </h3>
                            <p className="text-sm text-gray-600">{students.length} students</p>
                        </div>
                        <button
                            onClick={handleSaveAll}
                            disabled={saving || loading}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save All'}
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading students...</div>
                    ) : students.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No students found for this year</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full table-fixed">
                                <colgroup>
                                    <col className="w-[15%]" />
                                    <col className="w-[25%]" />
                                    <col className="w-[20%]" />
                                    <col className="w-[20%]" />
                                    <col className="w-[20%]" />
                                </colgroup>
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">PRN</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">SGPA (Sem {selectedSemester})</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Overall CGPA</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {students.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-600">{student.prn}</td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-gray-900">
                                                    {student.firstName} {student.lastName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="10"
                                                    placeholder="0.00"
                                                    value={sgpaValues[student.id] || ''}
                                                    onChange={(e) => handleSGPAChange(student.id, e.target.value)}
                                                    className="w-24 p-2 border border-gray-300 rounded text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <select
                                                    value={statusValues[student.id] || 'PASS'}
                                                    onChange={(e) => handleStatusChange(student.id, e.target.value)}
                                                    className="w-full max-w-[120px] mx-auto p-2 border border-gray-300 rounded text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="PASS">PASS</option>
                                                    <option value="FAIL">FAIL</option>
                                                    <option value="ATKT">ATKT</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {student.overallCgpa > 0 ? (
                                                    <span className="font-bold text-blue-600 text-lg">
                                                        {student.overallCgpa.toFixed(2)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

export default GPALedger;