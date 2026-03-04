import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { Upload, FileText, Download, ArrowLeft, CheckCircle, XCircle, Trash2, Camera } from 'lucide-react';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import CameraCapture from '../../components/ui/CameraCapture';

const ResourceCenter = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [resources, setResources] = useState([]);
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [confirm, setConfirm] = useState(null);
    const [showCamera, setShowCamera] = useState(false);

    const fetchResources = async () => {
        try {
            const response = await api.get(`/resources/allocation/${id}`);
            setResources(response.data);
        } catch (error) {
            console.error("Failed to load resources");
        }
    };

    useEffect(() => {
        fetchResources();
    }, [id]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !title) return;

        setUploading(true);
        setStatus({ type: '', message: '' }); // Clear old messages

        const formData = new FormData();
        formData.append('file', file);
        formData.append('allocationId', id);
        formData.append('title', title);

        try {
            await api.post('/resources/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Success Message
            setStatus({ type: 'success', message: 'File Uploaded Successfully!' });

            setTitle('');
            setFile(null);
            fetchResources();

            // Auto-hide success message after 3 seconds
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);

        } catch (error) {
            setStatus({ type: 'error', message: 'Upload Failed. File might be too large (>10MB).' });
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (fileName, displayTitle) => {
        try {
            const response = await api.get(`/resources/download/${fileName}`, {
                responseType: 'blob',
            });

            const ext = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : '';
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', displayTitle + ext);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Download failed");
            setStatus({ type: 'error', message: 'Download failed.' });
        }
    };

    const handleDelete = (resourceId) => {
        setConfirm({
            message: 'Delete this resource? This cannot be undone.',
            onConfirm: async () => {
                try {
                    await api.delete(`/resources/${resourceId}`);
                    setStatus({ type: 'success', message: 'Resource deleted successfully.' });
                    fetchResources();
                    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
                } catch {
                    setStatus({ type: 'error', message: 'Failed to delete resource.' });
                }
            },
        });
    };

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-gray-600 hover:text-purple-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>

            {/* Status Banner */}
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

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-purple-600" /> Upload New Material
                </h2>

                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Unit 1 Lecture Notes"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            required
                        />
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors bg-gray-50">
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="hidden"
                            id="file-upload"
                            accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png"
                            required
                        />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm font-medium text-purple-600 hover:text-purple-500">
                {file ? file.name : "Click to select a file"}
              </span>
                            <span className="text-xs text-gray-500 mt-1">PDF, PPT, DOCX, Images (Max 10MB)</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowCamera(true)}
                            className="inline-flex items-center mt-3 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors"
                        >
                            <Camera className="w-4 h-4 mr-1.5" /> Take Photo
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                        {uploading ? 'Uploading...' : 'Upload File'}
                    </button>
                </form>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-4">Uploaded Resources</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100 shadow-sm">
                {resources.length === 0 ? (
                    <p className="p-8 text-gray-500 text-center bg-gray-50">No files uploaded yet.</p>
                ) : (
                    resources.map((res) => (
                        <div key={res.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-4 border border-blue-100">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">{res.title}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Uploaded on {new Date(res.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleDownload(res.fileName, res.title)}
                                    className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
                                    title="Download"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(res.id)}
                                    className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                                    title="Delete"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ConfirmDialog config={confirm} onClose={() => setConfirm(null)} />
            <CameraCapture
                open={showCamera}
                onClose={() => setShowCamera(false)}
                onCapture={(f) => { setFile(f); setShowCamera(false); }}
            />
        </div>
    );
};

export default ResourceCenter;