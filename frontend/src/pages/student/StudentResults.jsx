import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { ChevronDown, ChevronUp, BookOpen, Star, ArrowLeft, Archive } from 'lucide-react';

const formatYear = (str) => str ? str.replace(/_/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()) : '';

const StudentResults = () => {
    const navigate = useNavigate();
    const [sgpaResults, setSgpaResults] = useState([]);
    const [assessments, setAssessments] = useState({});
    const [loading, setLoading] = useState(true);

    // Archives
    const [archivedYears, setArchivedYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null); // null = current year

    // State to track which subject is expanded
    const [expandedSubject, setExpandedSubject] = useState(null);

    // Fetch archived years on mount
    useEffect(() => {
        api.get('/student/archived-years').then(res => setArchivedYears(res.data)).catch(() => {});
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Final Ledger Results (SGPA) — always all semesters
                const sgpaRes = await api.get('/student/my-results');
                setSgpaResults(sgpaRes.data);

                // 2. Fetch Internal Assessments (raw marks) — filtered by year
                const yearParam = selectedYear ? `?year=${selectedYear}` : '';
                const assessRes = await api.get(`/student/my-assessments${yearParam}`);

                // Group assessments by Subject Name
                const grouped = assessRes.data.reduce((acc, curr) => {
                    const subject = curr.subjectName;
                    if (!acc[subject]) {
                        acc[subject] = [];
                    }
                    acc[subject].push(curr);
                    return acc;
                }, {});

                setAssessments(grouped);

            } catch {
                console.error("Error loading results");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedYear]);

    const toggleSubject = (subject) => {
        if (expandedSubject === subject) {
            setExpandedSubject(null);
        } else {
            setExpandedSubject(subject);
        }
    };

    if (loading) return <div className="p-8 text-gray-500">Loading academic data...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <button onClick={() => navigate('/student/dashboard')} className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Academic Performance</h1>

            {/* Year Selector — Current + Archives */}
            {archivedYears.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-8">
                    <button
                        onClick={() => setSelectedYear(null)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            selectedYear === null
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        Current Year
                    </button>
                    {archivedYears.map(y => (
                        <button
                            key={y}
                            onClick={() => setSelectedYear(y)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                                selectedYear === y
                                    ? 'bg-amber-600 text-white shadow-sm'
                                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-amber-50'
                            }`}
                        >
                            <Archive className="w-3.5 h-3.5" />
                            {formatYear(y)}
                        </button>
                    ))}
                </div>
            )}

            {selectedYear && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-amber-800 text-sm">
                    <Archive className="w-4 h-4" />
                    Viewing archived data from <strong>{formatYear(selectedYear)}</strong>
                </div>
            )}

            {/* SECTION 1: SEMESTER-WISE SGPA/CGPA RESULTS */}
            <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Semester-wise SGPA & CGPA
                </h2>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Semester</th>
                            <th className="p-4 font-semibold text-gray-600">SGPA</th>
                            <th className="p-4 font-semibold text-gray-600">CGPA (Cumulative)</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-gray-600">Date Declared</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {sgpaResults.length === 0 ? (
                            <tr><td colSpan="5" className="p-6 text-center text-gray-500">No semester results declared yet.</td></tr>
                        ) : (
                            sgpaResults.map((res) => (
                                <tr key={res.id} className="hover:bg-gray-50">
                                    <td className="p-4 text-gray-900 font-semibold">Semester {res.semester}</td>
                                    <td className="p-4 font-bold text-blue-600 text-lg">{res.sgpa ? res.sgpa.toFixed(2) : '-'}</td>
                                    <td className="p-4 font-bold text-purple-600 text-lg">{res.cgpa ? res.cgpa.toFixed(2) : '-'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            res.status === 'PASS' ? 'bg-green-100 text-green-700' : 
                                            res.status === 'FAIL' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {res.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {res.resultDate ? new Date(res.resultDate).toLocaleDateString() : '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>

            {/* SECTION 2: SUBJECT WISE ASSESSMENTS (RAW MARKS) */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                    Subject-wise Assessments
                </h2>

                {Object.keys(assessments).length === 0 ? (
                    <div className="p-6 bg-white rounded-xl border border-gray-200 text-gray-500 text-center">
                        No assessment marks uploaded yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.keys(assessments).map((subject, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                {/* Subject Header (Clickable) */}
                                <div
                                    onClick={() => toggleSubject(subject)}
                                    className="p-4 flex justify-between items-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{subject}</h3>
                                        <p className="text-xs text-gray-500">{assessments[subject][0]?.subjectCode}</p>
                                    </div>
                                    <div className="text-gray-400">
                                        {expandedSubject === subject ? <ChevronUp /> : <ChevronDown />}
                                    </div>
                                </div>

                                {/* Expanded Marks Table */}
                                {expandedSubject === subject && (
                                    <div className="p-4 bg-white border-t border-gray-200">
                                        <table className="w-full text-sm">
                                            <thead>
                                            <tr className="text-left text-gray-500 border-b border-gray-100">
                                                <th className="pb-2 font-medium">Exam Type</th>
                                                <th className="pb-2 font-medium text-right">Scored</th>
                                                <th className="pb-2 font-medium text-right">Total</th>
                                                <th className="pb-2 font-medium text-right">Percentage</th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                            {assessments[subject].map((mark) => {
                                                const percentage = ((mark.obtained / mark.max) * 100).toFixed(1);
                                                let colorClass = "text-gray-900";
                                                if (percentage < 35) colorClass = "text-red-600 font-bold";
                                                else if (percentage >= 75) colorClass = "text-green-600 font-bold";

                                                return (
                                                    <tr key={mark.id}>
                                                        <td className="py-3 text-gray-800">{mark.examType}</td>
                                                        <td className={`py-3 text-right ${colorClass}`}>{mark.obtained}</td>
                                                        <td className="py-3 text-right text-gray-500">{mark.max}</td>
                                                        <td className={`py-3 text-right ${colorClass}`}>{percentage}%</td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
export default StudentResults;