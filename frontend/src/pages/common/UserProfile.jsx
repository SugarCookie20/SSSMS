import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import api from '../../api/axiosConfig';
import { User, Mail, BookOpen, Calendar, Phone, ArrowLeft, GraduationCap, ShieldCheck, FileText, Award, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Change Password State
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
    const [changingPassword, setChangingPassword] = useState(false);

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

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordStatus({ type: '', message: '' });
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters.' });
            return;
        }
        setChangingPassword(true);
        try {
            await api.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setPasswordStatus({ type: 'success', message: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setPasswordStatus({ type: 'error', message: error.response?.data || 'Failed to change password.' });
        } finally {
            setChangingPassword(false);
        }
    };

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

                {/* Qualification & Dates Card - Faculty only */}
                {isFaculty && (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm h-full">
                        <h3 className="text-lg font-bold mb-4 flex items-center text-gray-900">
                            <GraduationCap className={`w-5 h-5 mr-2 text-${roleColor}-600`}/> Qualification
                        </h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            {profile.qualification || "Not Provided"}
                        </p>

                        <h3 className="text-lg font-bold mb-4 flex items-center text-gray-900">
                            <Calendar className={`w-5 h-5 mr-2 text-${roleColor}-600`}/> Date of Birth
                        </h3>
                        <p className="text-gray-600 mb-8">
                            {profile.dob ? new Date(profile.dob).toLocaleDateString() : "Not Provided"}
                        </p>

                        <h3 className="text-lg font-bold mb-4 flex items-center text-gray-900">
                            <Calendar className={`w-5 h-5 mr-2 text-${roleColor}-600`}/> Date of Joining
                        </h3>
                        <p className="text-gray-600">
                            {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : "N/A"}
                        </p>
                    </div>
                )}

                {/* Workload Card - Faculty only */}
                {isFaculty && (
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
                )}

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

            {/* Professional Development - Faculty only */}
            {isFaculty && profile.professionalDevelopment && profile.professionalDevelopment.length > 0 && (
                <div className="mt-6 bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center text-gray-900">
                        <Award className={`w-5 h-5 mr-2 text-${roleColor}-600`}/> Professional Development
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

            {/* Change Password Section */}
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center text-gray-900">
                    <Lock className={`w-5 h-5 mr-2 text-${roleColor}-600`}/> Change Password
                </h3>
                {passwordStatus.message && (
                    <div className={`p-3 mb-4 rounded-lg text-sm ${
                        passwordStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {passwordStatus.message}
                    </div>
                )}
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                            minLength={6}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={changingPassword}
                        className={`flex items-center px-5 py-2.5 rounded-lg text-white font-medium shadow-sm transition-colors disabled:opacity-50 ${
                            isFaculty ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        <Lock className="w-4 h-4 mr-2" />
                        {changingPassword ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserProfile;