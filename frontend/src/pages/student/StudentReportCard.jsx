//check

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { BookOpen, Award, TrendingUp, ArrowLeft } from 'lucide-react';

const StudentReportCard = () => {
    const navigate = useNavigate();
    const [report, setReport] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await api.get('/student/report-card');
                setReport(res.data);
            } catch {
                console.error("Failed to load report card");
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, []);

    if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <button onClick={() => navigate('/student/dashboard')} className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            <div className="flex items-center gap-3 mb-8">
                <Award className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Academic Report Card</h1>
            </div>

            {report.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
                    No assessment data available yet.
                </div>
            ) : (
                <div className="space-y-6">
                    {report.map((subject, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Subject Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{subject.subjectName}</h2>
                                        <p className="text-sm text-gray-600 mt-1">Code: {subject.subjectCode}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600 uppercase font-semibold">Total Score</p>
                                        <p className="text-4xl font-bold text-blue-600">{subject.total || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Marks Breakdown */}
                            <div className="p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Internal Assessment */}
                                    <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <BookOpen className="w-5 h-5 text-blue-600" />
                                            <h3 className="text-lg font-bold text-blue-900">Internal Assessment (ISE/ICA)</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-blue-700">Best of 2 Unit Tests</span>
                                                <span className="font-bold text-blue-900">{subject.utBestOf2 || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-blue-700">ICA (Assignments + Jury)</span>
                                                <span className="font-bold text-blue-900">{subject.ica || 0}</span>
                                            </div>
                                            <div className="pt-3 border-t-2 border-blue-200 flex justify-between items-center">
                                                <span className="font-semibold text-blue-800">Total Internal</span>
                                                <span className="text-xl font-bold text-blue-900">{subject.internalMarks || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* External Assessment */}
                                    <div className="bg-purple-50 rounded-lg p-5 border border-purple-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <TrendingUp className="w-5 h-5 text-purple-600" />
                                            <h3 className="text-lg font-bold text-purple-900">External Assessment (ESE)</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-purple-700">Theory</span>
                                                <span className="font-bold text-purple-900">{subject.theoryMarks || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-purple-700">Practical</span>
                                                <span className="font-bold text-purple-900">{subject.practicalMarks || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-purple-700">Sessional/Studio</span>
                                                <span className="font-bold text-purple-900">{subject.sessionalMarks || 0}</span>
                                            </div>
                                            <div className="pt-3 border-t-2 border-purple-200 flex justify-between items-center">
                                                <span className="font-semibold text-purple-800">Total External</span>
                                                <span className="text-xl font-bold text-purple-900">{subject.externalMarks || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentReportCard;