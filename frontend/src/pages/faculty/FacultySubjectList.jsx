import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../auth/useAuth';
import { BookOpen, ArrowRight, BarChart3, Upload, Target, ShieldCheck, ArrowLeft } from 'lucide-react';

const FacultySubjectList = ({ mode }) => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                // Determine Endpoint
                const endpoint = user?.role === 'ROLE_ADMIN'
                    ? '/admin/allocations/all'
                    : '/faculty/my-subjects';

                console.log("Fetching subjects from:", endpoint); // DEBUG LOG

                const response = await api.get(endpoint);

                const normalizedData = response.data.map(item => ({
                    ...item,
                    className: item.className || item.year || "N/A",
                    division: item.division || (user?.role === 'ROLE_ADMIN' ? item.facultyName : "")
                }));

                setSubjects(normalizedData);
            } catch (error) {
                console.error("Failed to load subjects:", error);
                if (error.response?.status === 403) {
                    console.error("Permission Denied. Check Role:", user?.role);
                }
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchSubjects();
        }
    }, [user]);

    const handleNavigate = (id) => {
        if (mode === 'attendance') navigate(`/faculty/attendance/${id}`);
        else if (mode === 'upload') navigate(`/faculty/resources/${id}`);
        else if (mode === 'results') navigate(`/faculty/grading/${id}`);
        else if (mode === 'report') navigate(`/faculty/report/${id}`);
    };

    const getPageTitle = () => {
        switch (mode) {
            case 'attendance': return 'Mark Attendance';
            case 'upload': return 'Upload Resources';
            case 'results': return 'Enter Exam Marks';
            case 'report': return 'Attendance Analytics';
            default: return 'Select Subject';
        }
    };

    const getIconColor = () => {
        switch (mode) {
            case 'attendance': return 'bg-blue-50 text-blue-600';
            case 'upload': return 'bg-purple-50 text-purple-600';
            case 'results': return 'bg-green-50 text-green-600';
            case 'report': return 'bg-indigo-50 text-indigo-600';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <button onClick={() => navigate(user?.role === 'ROLE_ADMIN' ? '/admin/dashboard' : '/faculty/dashboard')} className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{getPageTitle()}</h1>
                    <p className="text-gray-600">Select a subject to proceed.</p>
                </div>
                {user?.role === 'ROLE_ADMIN' && (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                        <ShieldCheck className="w-3 h-3 mr-1"/> Admin View
                    </span>
                )}
            </div>

            {loading ? (
                <div className="text-gray-500">Loading subjects...</div>
            ) : subjects.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
                    <p className="text-gray-500 mb-4">No subjects found.</p>
                    <p className="text-sm text-gray-400">Ensure the admin has allocated subjects to you.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((sub) => (
                        <div
                            key={sub.id}
                            onClick={() => handleNavigate(sub.id)}
                            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-lg ${getIconColor()}`}>
                                    {mode === 'report' ? <BarChart3 className="w-6 h-6" /> :
                                        mode === 'results' ? <Target className="w-6 h-6" /> :
                                            mode === 'upload' ? <Upload className="w-6 h-6" /> :
                                                <BookOpen className="w-6 h-6" />}
                                </div>
                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                                    {sub.subjectCode}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                {sub.subjectName}
                            </h3>
                            <p className="text-gray-500 text-sm mb-2">
                                {sub.className}
                                {sub.division && <span> • {sub.division}</span>}
                            </p>
                            <div className="flex items-center text-sm font-medium text-gray-400 group-hover:text-gray-900 transition-colors mt-4">
                                <span>Proceed</span>
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FacultySubjectList;