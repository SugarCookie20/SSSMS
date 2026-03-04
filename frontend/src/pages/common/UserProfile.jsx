import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import api from '../../api/axiosConfig';
import { User, Mail, BookOpen, Calendar, Phone, ArrowLeft, GraduationCap, ShieldCheck, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Determine Role Colors
    const isFaculty = user?.role?.includes('FACULTY');
    const roleColor = isFaculty ? 'purple' : 'blue';
    const bgClass = isFaculty ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600';

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (isFaculty) {
                    // CALL THE API WE JUST FIXED
                    const response = await api.get('/faculty/profile/me');
                    setProfile(response.data);
                } else {
                    // Admin has no profile table, so we use session data
                    setProfile({
                        firstName: "Administrator",
                        lastName: "",
                        email: user.email,
                        department: "Management",
                        designation: "System Admin",
                        qualification: "N/A",
                        joiningDate: new Date().toISOString(),
                        subjects: []
                    });
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchProfile();
    }, [user, isFaculty]);

    if (loading) return <div className="p-8 text-gray-500">Loading Profile...</div>;
    if (!profile) return <div className="p-8 text-red-500">Profile unavailable.</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>

            {/* 1. Hero Section (Clean White) */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6 flex items-center gap-6 shadow-sm">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center shrink-0 ${bgClass}`}>
                    <User className="w-10 h-10" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h2>
                    <p className="text-gray-500">{profile.designation} • {profile.department}</p>
                    <div className="flex gap-6 mt-3 text-sm text-gray-600">
                        <span className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400"/> {profile.email}
                        </span>
                        {profile.phoneNumber && (
                            <span className="flex items-center">
                                <Phone className="w-4 h-4 mr-2 text-gray-400"/> {profile.phoneNumber}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Qualification Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm h-full">
                    <h3 className="text-lg font-bold mb-4 flex items-center text-gray-900">
                        <GraduationCap className={`w-5 h-5 mr-2 text-${roleColor}-600`}/> Qualification
                    </h3>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {profile.qualification || "Not Provided"}
                    </p>

                    <h3 className="text-lg font-bold mb-4 flex items-center text-gray-900">
                        <Calendar className={`w-5 h-5 mr-2 text-${roleColor}-600`}/> Date of Joining
                    </h3>
                    <p className="text-gray-600">
                        {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : "N/A"}
                    </p>
                </div>

                {/* Workload Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm h-full">
                    <h3 className="text-lg font-bold mb-6 flex items-center text-gray-900">
                        <BookOpen className={`w-5 h-5 mr-2 text-${roleColor}-600`}/> Current Teaching Load
                    </h3>

                    {profile.subjects && profile.subjects.length > 0 ? (
                        <div className="space-y-3">
                            {profile.subjects.map((sub, i) => (
                                <div key={i} className="p-4 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 border border-gray-100 flex items-center">
                                    <div className={`w-2 h-2 bg-${roleColor}-500 rounded-full mr-3`}></div>
                                    {sub}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <p className="text-gray-400 text-sm italic">No active subjects assigned.</p>
                        </div>
                    )}
                </div>

                {/* COA Registration - Faculty only */}
                {isFaculty && (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm h-full">
                        <h3 className="text-lg font-bold mb-4 flex items-center text-gray-900">
                            <ShieldCheck className={`w-5 h-5 mr-2 text-${roleColor}-600`}/> COA Registration
                        </h3>
                        <div className="space-y-4">
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
                )}

                {/* ID Documents - Faculty only */}
                {isFaculty && (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm h-full">
                        <h3 className="text-lg font-bold mb-4 flex items-center text-gray-900">
                            <FileText className={`w-5 h-5 mr-2 text-${roleColor}-600`}/> ID Documents
                        </h3>
                        <div className="space-y-4">
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
                )}
            </div>
        </div>
    );
};

export default UserProfile;