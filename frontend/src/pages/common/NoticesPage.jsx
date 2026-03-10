import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../auth/useAuth';
import { Bell, Megaphone, Send, Clock, User, CheckCircle, XCircle, Paperclip, Download, Camera, Trash2, Timer, ArrowLeft } from 'lucide-react';
import CameraCapture from '../../components/ui/CameraCapture';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const NoticesPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notices, setNotices] = useState([]);
    const [showCamera, setShowCamera] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Updated State for File
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetRole, setTargetRole] = useState('ALL');
    const [visibility, setVisibility] = useState('FOREVER');
    const [file, setFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ type: '', message: '' });

    const canPost = user.role === 'ROLE_ADMIN' || user.role === 'ROLE_FACULTY';
    const canDelete = user.role === 'ROLE_ADMIN' || user.role === 'ROLE_FACULTY';
    const dashboardPath = user.role === 'ROLE_ADMIN' ? '/admin/dashboard' : user.role === 'ROLE_FACULTY' ? '/faculty/dashboard' : '/student/dashboard';

    const fetchNotices = async () => {
        try {
            const response = await api.get('/notices');
            setNotices(response.data);
        } catch (error) {
            console.error("Failed to load notices");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handlePost = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        // Use FormData for File Upload
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('targetRole', targetRole);
        formData.append('visibility', visibility);
        if (file) {
            formData.append('file', file);
        }

        try {
            await api.post('/notices', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus({ type: 'success', message: 'Notice Posted Successfully!' });

            // Reset Form
            setTitle('');
            setContent('');
            setTargetRole('ALL');
            setVisibility('FOREVER');
            setFile(null);

            fetchNotices();
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to post notice.' });
        }
    };

    const handleDownload = async (fileName) => {
        try {
            const response = await api.get(`/notices/download/${fileName}`, { responseType: 'blob' });
            const ext = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : '';
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', "attachment" + ext);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert("Download failed");
        }
    };

    const handleDelete = async (noticeId) => {
        setConfirmDelete({
            message: 'Are you sure you want to delete this notice? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    await api.delete(`/notices/${noticeId}`);
                    setStatus({ type: 'success', message: 'Notice deleted successfully!' });
                    fetchNotices();
                    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
                } catch (error) {
                    setStatus({ type: 'error', message: error.response?.data || 'Failed to delete notice.' });
                    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
                }
            },
        });
    };

    const getVisibilityLabel = (expiresAt) => {
        if (!expiresAt) return 'Forever';
        const expires = new Date(expiresAt);
        const now = new Date();
        const diffMs = expires - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return 'Expired';
        if (diffDays === 1) return '1 day left';
        return `${diffDays} days left`;
    };

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate(dashboardPath)} className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Digital Notice Board</h1>
                    <p className="text-gray-600 mt-1">Updates and announcements.</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-full">
                    <Bell className="w-6 h-6 text-orange-600" />
                </div>
            </div>

            {/* Status Toast Banner */}
            {status.message && (
                <div className={`p-4 mb-6 rounded-lg flex items-center border ${
                    status.type === 'success'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                    {status.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 mr-3" />
                    ) : (
                        <XCircle className="w-5 h-5 mr-3" />
                    )}
                    <span className="font-medium">{status.message}</span>
                </div>
            )}

            {canPost && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Megaphone className="w-5 h-5 mr-2 text-blue-600" /> Post New Announcement
                    </h2>

                    <form onSubmit={handlePost} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <input
                                    placeholder="Notice Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <select
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    className="w-full p-2.5 border rounded-lg bg-gray-50"
                                >
                                    <option value="ALL">Everyone</option>
                                    <option value="STUDENT">Students Only</option>
                                    <option value="FACULTY">Faculty Only</option>
                                </select>
                            </div>
                            <div>
                                <select
                                    value={visibility}
                                    onChange={(e) => setVisibility(e.target.value)}
                                    className="w-full p-2.5 border rounded-lg bg-gray-50"
                                >
                                    <option value="1_DAY">1 Day</option>
                                    <option value="1_WEEK">1 Week</option>
                                    <option value="15_DAYS">15 Days</option>
                                    <option value="1_MONTH">1 Month</option>
                                    <option value="FOREVER">Forever</option>
                                </select>
                            </div>
                        </div>

                        <textarea
                            placeholder="Write your message here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full p-2.5 border rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />

                        <div className="flex justify-between items-center">
                            {/* File Input */}
                            <div className="flex items-center gap-2">
                                <label htmlFor="notice-file" className="cursor-pointer flex items-center text-gray-500 hover:text-blue-600 text-sm">
                                    <Paperclip className="w-4 h-4 mr-1.5" />
                                    {file ? file.name : "Attach File"}
                                </label>
                                <input
                                    id="notice-file"
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCamera(true)}
                                    className="flex items-center text-gray-500 hover:text-blue-600 text-sm border border-gray-200 rounded-lg px-2 py-1"
                                >
                                    <Camera className="w-4 h-4 mr-1" /> Camera
                                </button>
                                {file && (
                                    <button type="button" onClick={() => setFile(null)} className="text-red-500 hover:text-red-700">
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center">
                                <Send className="w-4 h-4 mr-2" /> Publish
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {notices.map((notice) => (
                    <div key={notice.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{notice.title}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                    {notice.target}
                                </span>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${
                                    notice.expiresAt ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                                }`}>
                                    <Timer className="w-3 h-3" />
                                    {getVisibilityLabel(notice.expiresAt)}
                                </span>
                                {canDelete && (
                                    <button
                                        onClick={() => handleDelete(notice.id)}
                                        className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                                        title="Delete Notice"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-600 mb-4 whitespace-pre-wrap">{notice.content}</p>

                        {/* Attachment Button */}
                        {notice.attachment && (
                            <button
                                onClick={() => handleDownload(notice.attachment)}
                                className="mb-4 flex items-center text-sm text-blue-600 hover:underline bg-blue-50 w-fit px-3 py-1.5 rounded-lg"
                            >
                                <Paperclip className="w-4 h-4 mr-2" />
                                Download Attachment
                            </button>
                        )}

                        <div className="flex items-center text-xs text-gray-400 pt-4 border-t border-gray-100">
                            <div className="flex items-center mr-4">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(notice.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                {notice.author}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <CameraCapture
                open={showCamera}
                onClose={() => setShowCamera(false)}
                onCapture={(f) => { setFile(f); setShowCamera(false); }}
            />

            <ConfirmDialog
                config={confirmDelete}
                onClose={() => setConfirmDelete(null)}
            />
        </div>
    );
};

export default NoticesPage;