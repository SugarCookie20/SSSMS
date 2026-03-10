import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { ChevronDown, ChevronUp, BookOpen, Star, Download, FileText, ArrowLeft } from 'lucide-react';

const StudentResults = () => {
    const navigate = useNavigate();
    const [sgpaResults, setSgpaResults] = useState([]);
    const [assessments, setAssessments] = useState({});
    const [scorecard, setScorecard] = useState(null);
    const [loading, setLoading] = useState(true);

    // State to track which subject is expanded
    const [expandedSubject, setExpandedSubject] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Final Ledger Results (SGPA)
                const sgpaRes = await api.get('/student/my-results');
                setSgpaResults(sgpaRes.data);

                // 2. Fetch Internal Assessments (raw marks)
                const assessRes = await api.get('/student/my-assessments');

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

                // 3. Fetch Cumulative Scorecard (calculated marks)
                const scorecardRes = await api.get('/student/scorecard');
                setScorecard(scorecardRes.data);

            } catch {
                console.error("Error loading results");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleSubject = (subject) => {
        if (expandedSubject === subject) {
            setExpandedSubject(null);
        } else {
            setExpandedSubject(subject);
        }
    };

    const downloadScorecard = () => {
        if (!scorecard) return;

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Academic Scorecard - ${scorecard.studentName}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 900px; margin: 0 auto; color: #374151; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #c7d2fe; padding-bottom: 20px; }
        .header h1 { color: #3730a3; margin: 0; font-size: 24px; letter-spacing: 1px; }
        .header p { color: #6b7280; margin: 5px 0; }
        .student-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e5e7eb; }
        .student-info table { width: 100%; }
        .student-info td { padding: 8px; }
        .student-info td:first-child, .student-info td:nth-child(3), .student-info td:nth-child(5) { font-weight: 600; color: #6b7280; }
        .subject-card { margin-bottom: 25px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
        .subject-header { background: #eef2ff; padding: 15px; font-weight: bold; font-size: 17px; color: #3730a3; border-bottom: 1px solid #c7d2fe; }
        .marks-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 20px; }
        .marks-section-internal { background: #eff6ff; padding: 15px; border-radius: 6px; border: 1px solid #dbeafe; }
        .marks-section-external { background: #eef2ff; padding: 15px; border-radius: 6px; border: 1px solid #e0e7ff; }
        .marks-section-internal h3 { margin: 0 0 15px 0; color: #2563eb; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
        .marks-section-external h3 { margin: 0 0 15px 0; color: #4f46e5; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
        .mark-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .mark-row-total-internal { display: flex; justify-content: space-between; padding: 8px 0; border-top: 2px solid #bfdbfe; font-weight: bold; color: #1d4ed8; }
        .mark-row-total-external { display: flex; justify-content: space-between; padding: 8px 0; border-top: 2px solid #c7d2fe; font-weight: bold; color: #4338ca; }
        .mark-label { color: #6b7280; }
        .mark-value { font-weight: 600; color: #374151; }
        .summary { background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 30px; border: 1px solid #e5e7eb; }
        .summary h2 { text-align: center; color: #374151; margin-bottom: 20px; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center; }
        .summary-internal { background: #eff6ff; padding: 15px; border-radius: 6px; border: 1px solid #dbeafe; }
        .summary-external { background: #eef2ff; padding: 15px; border-radius: 6px; border: 1px solid #e0e7ff; }
        .summary-total { background: #f0fdf4; padding: 15px; border-radius: 6px; border: 1px solid #dcfce7; }
        .summary-label { font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
        .summary-internal .summary-label { color: #2563eb; }
        .summary-external .summary-label { color: #4f46e5; }
        .summary-total .summary-label { color: #15803d; }
        .summary-internal .summary-value { color: #1d4ed8; font-size: 24px; font-weight: bold; }
        .summary-external .summary-value { color: #4338ca; font-size: 24px; font-weight: bold; }
        .summary-total .summary-value { color: #15803d; font-size: 24px; font-weight: bold; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; }
        @media print { body { padding: 20px; } .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>CUMULATIVE ACADEMIC SCORECARD</h1>
        <p>Session: ${new Date().getFullYear()}</p>
    </div>

    <div class="student-info">
        <table>
            <tr>
                <td>Student Name:</td>
                <td><strong>${scorecard.studentName}</strong></td>
                <td>PRN:</td>
                <td><strong>${scorecard.prn}</strong></td>
                <td>Academic Year:</td>
                <td><strong>${scorecard.academicYear}</strong></td>
            </tr>
        </table>
    </div>

    ${scorecard.subjects.map(subject => `
    <div class="subject-card">
        <div class="subject-header">
            ${subject.subjectName} (${subject.subjectCode})
        </div>
        <div class="marks-grid">
            <div class="marks-section-internal">
                <h3>Internal Assessment (ISE/ICA)</h3>
                <div class="mark-row">
                    <span class="mark-label">Best of 2 Unit Tests</span>
                    <span class="mark-value">${subject.utBestOf2 || 0}</span>
                </div>
                <div class="mark-row">
                    <span class="mark-label">ICA (Assignments + Jury)</span>
                    <span class="mark-value">${subject.ica || 0}</span>
                </div>
                <div class="mark-row-total-internal">
                    <span>Total Internal</span>
                    <span>${subject.internalMarks || 0}</span>
                </div>
            </div>
            <div class="marks-section-external">
                <h3>External Assessment (ESE)</h3>
                <div class="mark-row">
                    <span class="mark-label">Theory</span>
                    <span class="mark-value">${subject.theoryMarks || 0}</span>
                </div>
                <div class="mark-row">
                    <span class="mark-label">Practical</span>
                    <span class="mark-value">${subject.practicalMarks || 0}</span>
                </div>
                <div class="mark-row">
                    <span class="mark-label">Sessional</span>
                    <span class="mark-value">${subject.sessionalMarks || 0}</span>
                </div>
                <div class="mark-row-total-external">
                    <span>Total External</span>
                    <span>${subject.externalMarks || 0}</span>
                </div>
            </div>
        </div>
        <div style="padding: 15px; background: #eef2ff; border-top: 1px solid #c7d2fe; text-align: center; color: #3730a3;">
            <strong>Subject Total: ${subject.total || 0}</strong>
        </div>
    </div>
    `).join('')}

    <div class="summary">
        <h2>OVERALL SUMMARY</h2>
        <div class="summary-grid">
            <div class="summary-internal">
                <div class="summary-label">Total Internal</div>
                <div class="summary-value">${scorecard.totalInternal.toFixed(2)}</div>
            </div>
            <div class="summary-external">
                <div class="summary-label">Total External</div>
                <div class="summary-value">${scorecard.totalExternal.toFixed(2)}</div>
            </div>
            <div class="summary-total">
                <div class="summary-label">Grand Total</div>
                <div class="summary-value">${scorecard.grandTotal.toFixed(2)}</div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
        <p>This is a system-generated document. No signature is required.</p>
    </div>
</body>
</html>
        `;

        // Create a blob and download
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Scorecard_${scorecard.prn}_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    if (loading) return <div className="p-8 text-gray-500">Loading academic data...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <button onClick={() => navigate('/student/dashboard')} className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Academic Performance</h1>

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

            {/* SECTION 2: CUMULATIVE SCORECARD */}
            {scorecard && scorecard.subjects && scorecard.subjects.length > 0 && (
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                            Cumulative Semester Scorecard
                        </h2>
                        <button
                            onClick={downloadScorecard}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm"
                        >
                            <Download className="w-4 h-4" />
                            Download Scorecard
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 shadow-sm">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 font-medium">Student Name</p>
                                <p className="text-sm font-semibold text-gray-800">{scorecard.studentName}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 font-medium">PRN</p>
                                <p className="text-sm font-semibold text-gray-800">{scorecard.prn}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 font-medium">Year</p>
                                <p className="text-sm font-semibold text-gray-800">{scorecard.academicYear}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 font-medium">Total Subjects</p>
                                <p className="text-sm font-semibold text-gray-800">{scorecard.totalSubjects}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
                                <p className="text-xs text-blue-600 font-semibold mb-1">TOTAL INTERNAL</p>
                                <p className="text-2xl font-bold text-blue-700">{scorecard.totalInternal.toFixed(2)}</p>
                            </div>
                            <div className="bg-indigo-50 rounded-lg p-4 text-center border border-indigo-100">
                                <p className="text-xs text-indigo-600 font-semibold mb-1">TOTAL EXTERNAL</p>
                                <p className="text-2xl font-bold text-indigo-700">{scorecard.totalExternal.toFixed(2)}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
                                <p className="text-xs text-green-600 font-semibold mb-1">GRAND TOTAL</p>
                                <p className="text-2xl font-bold text-green-700">{scorecard.grandTotal.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Subject-wise breakdown in scorecard */}
                    <div className="space-y-3">
                        {scorecard.subjects.map((subject, idx) => (
                            <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{subject.subjectName}</h3>
                                        <p className="text-xs text-gray-400">{subject.subjectCode}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 font-medium">Total</p>
                                        <p className="text-2xl font-bold text-indigo-600">{subject.total || 0}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                        <p className="text-xs text-blue-600 font-semibold mb-1.5">Internal (ISE/ICA)</p>
                                        <div className="space-y-1 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Best of 2 UTs:</span>
                                                <span className="font-semibold text-gray-700">{subject.utBestOf2 || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">ICA:</span>
                                                <span className="font-semibold text-gray-700">{subject.ica || 0}</span>
                                            </div>
                                            <div className="flex justify-between border-t border-blue-100 pt-1 mt-1">
                                                <span className="font-semibold text-blue-700">Total:</span>
                                                <span className="font-bold text-blue-700">{subject.internalMarks || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                                        <p className="text-xs text-indigo-600 font-semibold mb-1.5">External (ESE)</p>
                                        <div className="space-y-1 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Theory:</span>
                                                <span className="font-semibold text-gray-700">{subject.theoryMarks || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Practical:</span>
                                                <span className="font-semibold text-gray-700">{subject.practicalMarks || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Sessional:</span>
                                                <span className="font-semibold text-gray-700">{subject.sessionalMarks || 0}</span>
                                            </div>
                                            <div className="flex justify-between border-t border-indigo-100 pt-1 mt-1">
                                                <span className="font-semibold text-indigo-700">Total:</span>
                                                <span className="font-bold text-indigo-700">{subject.externalMarks || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SECTION 3: SUBJECT WISE ASSESSMENTS (RAW MARKS) */}
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