import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { FileText, Download, ArrowLeft, Eye, X } from 'lucide-react';

const StudentResources = () => {
    const { subjectCode } = useParams();
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    const [previewFile, setPreviewFile] = useState(null);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const response = await api.get(`/resources/student/${subjectCode}`);
                setResources(response.data);
            } catch (error) {
                console.error("Failed to load resources");
            } finally {
                setLoading(false);
            }
        };
        fetchResources();
    }, [subjectCode]);

    const handleDownload = async (fileName, title) => {
        try {
            const response = await api.get(`/resources/download/${fileName}`, { responseType: 'blob' });
            const ext = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : '';
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', title + ext);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert("Download failed");
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-gray-600 hover:text-blue-600">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-6">Study Materials: {subjectCode}</h1>

            {loading ? (
                <div className="text-gray-500">Loading...</div>
            ) : resources.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
                    No materials uploaded for this subject yet.
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-sm">
                    {resources.map((res, index) => (
                        <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-4">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">{res.title}</h4>
                                    <p className="text-xs text-gray-500">{new Date(res.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Preview Button */}
                                <button
                                    onClick={() => setPreviewFile(res.fileName)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Preview"
                                >
                                    <Eye className="w-5 h-5" />
                                </button>
                                {/* Download Button */}
                                <button
                                    onClick={() => handleDownload(res.fileName, res.title)}
                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Download"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* PDF Preview Modal */}
            {previewFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4">
                    <div className="bg-white w-full h-full max-w-5xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-gray-700">Document Preview</h3>
                            <button onClick={() => setPreviewFile(null)} className="text-gray-500 hover:text-red-500 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-100 p-1">
                            <iframe
                                src={`http://localhost:8080/api/resources/view/${previewFile}`}
                                className="w-full h-full border-none rounded-lg bg-white"
                                title="PDF Preview"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentResources;