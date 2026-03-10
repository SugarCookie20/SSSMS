import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { User, Mail, Briefcase, BookOpen, Calendar, Phone, ArrowLeft, GraduationCap, ShieldCheck, FileText, Award } from 'lucide-react';

const FacultyProfileView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get(`/admin/faculty/${id}/profile`);
                setProfile(response.data);
            } catch (error) {
                console.error("Failed");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (loading) return <div className="p-8 text-gray-500">Loading Profile...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-gray-600 hover:text-blue-600">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>

            {/* Hero */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6 flex items-center gap-6 shadow-sm">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    <User className="w-12 h-12" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h2>
                    <p className="text-gray-500">{profile.designation} • {profile.department}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center"><Mail className="w-4 h-4 mr-1"/> {profile.email}</span>
                        <span className="flex items-center"><Phone className="w-4 h-4 mr-1"/> {profile.phoneNumber}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic Details */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center"><GraduationCap className="w-5 h-5 mr-2 text-purple-600"/> Qualification</h3>
                    <p className="text-gray-700">{profile.qualification || "Not Provided"}</p>

                    <h3 className="text-lg font-bold mt-6 mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2 text-purple-600"/> Date of Birth</h3>
                    <p className="text-gray-700">{profile.dob ? new Date(profile.dob).toLocaleDateString() : "Not Provided"}</p>

                    <h3 className="text-lg font-bold mt-6 mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2 text-purple-600"/> Date of Joining</h3>
                    <p className="text-gray-700">{new Date(profile.joiningDate).toLocaleDateString()}</p>
                </div>

                {/* Workload */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center"><BookOpen className="w-5 h-5 mr-2 text-blue-600"/> Current Teaching Load</h3>
                    {profile.subjects.length === 0 ? (
                        <p className="text-gray-500">No subjects assigned.</p>
                    ) : (
                        <ul className="space-y-2">
                            {profile.subjects.map((sub, i) => (
                                <li key={i} className="p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 border border-gray-100">
                                    {sub}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* COA Registration */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-purple-600"/> COA Registration</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Registration No.</p>
                            <p className="text-gray-700 font-medium">{profile.coaRegistrationNo || "Not Provided"}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Valid From</p>
                                <p className="text-gray-700">{profile.coaValidFrom ? new Date(profile.coaValidFrom).toLocaleDateString() : "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Valid Till</p>
                                <p className="text-gray-700">{profile.coaValidTill ? new Date(profile.coaValidTill).toLocaleDateString() : "—"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ID Documents */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center"><FileText className="w-5 h-5 mr-2 text-purple-600"/> ID Documents</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Aadhar No.</p>
                            <p className="text-gray-700 font-mono">{profile.aadharNo || "Not Provided"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">PAN Card No.</p>
                            <p className="text-gray-700 font-mono">{profile.panCardNo || "Not Provided"}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Professional Development */}
            {profile.professionalDevelopment && profile.professionalDevelopment.length > 0 && (
                <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                        <Award className="w-5 h-5 mr-2 text-purple-600"/> Professional Development
                        <span className="ml-2 text-sm font-normal text-gray-400">({profile.professionalDevelopment.length})</span>
                    </h3>
                    <div className="space-y-2">
                        {profile.professionalDevelopment.slice(0, 5).map((pd, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center min-w-0">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full mr-3 shrink-0 ${
                                        pd.type === 'WORKSHOP' ? 'bg-blue-100 text-blue-700' :
                                        pd.type === 'QIP' ? 'bg-purple-100 text-purple-700' :
                                        pd.type === 'FDP' ? 'bg-indigo-100 text-indigo-700' :
                                        pd.type === 'CONFERENCE' ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>{pd.type}</span>
                                    <span className="text-sm font-medium text-gray-800 truncate">{pd.title}</span>
                                    {pd.organization && <span className="text-xs text-gray-400 ml-2 shrink-0">• {pd.organization}</span>}
                                </div>
                                {pd.startDate && (
                                    <span className="text-xs text-gray-400 shrink-0 ml-3">{new Date(pd.startDate).toLocaleDateString()}</span>
                                )}
                            </div>
                        ))}
                        {profile.professionalDevelopment.length > 5 && (
                            <p className="text-xs text-gray-400 text-center pt-1">+ {profile.professionalDevelopment.length - 5} more entries</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
export default FacultyProfileView;