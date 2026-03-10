import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { Upload, User, Users, CheckCircle, XCircle, Camera, ArrowLeft } from 'lucide-react';
import CameraCapture from '../../components/ui/CameraCapture';

const ManageTimetables = () => {
    const navigate = useNavigate();
    // Data
    const [showCamera, setShowCamera] = useState(false);
    const [facultyList, setFacultyList] = useState([]);
    const [years, setYears] = useState([]); // Replaced classes with years

    // Selection
    const [uploadType, setUploadType] = useState('CLASS'); // CLASS or FACULTY
    const [selectedId, setSelectedId] = useState('');
    const [file, setFile] = useState(null);

    // UI
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [facRes, yearRes] = await Promise.all([
                    api.get('/admin/faculty/all'),
                    api.get('/admin/years') // Updated Endpoint
                ]);
                setFacultyList(facRes.data);
                setYears(yearRes.data);
            } catch (e) {
                console.error("Failed to load dropdowns");
            }
        };
        loadData();
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        const formData = new FormData();
        formData.append('file', file);

        let url = '';
        if(uploadType === 'CLASS') {
            url = '/timetable/upload/class';
            formData.append('year', selectedId); // Changed 'classId' to 'year'
        } else {
            url = '/timetable/upload/faculty';
            formData.append('facultyId', selectedId);
        }

        try {
            await api.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
            setStatus({ type: 'success', msg: 'Timetable Uploaded Successfully!' });
            setFile(null);
            setSelectedId('');
            setTimeout(() => setStatus(null), 3000);
        } catch(e) {
            setStatus({ type: 'error', msg: 'Upload Failed.' });
        } finally {
            setLoading(false);
        }
    };

    // Helper
    const formatYear = (str) => str.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate('/admin/dashboard')} className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Timetable Management</h1>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">

                {/* Toggle */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => { setUploadType('CLASS'); setSelectedId(''); }}
                        className={`flex-1 p-4 rounded-lg border-2 flex items-center justify-center font-bold transition-all ${uploadType === 'CLASS' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                        <Users className="w-5 h-5 mr-2" /> Class Timetable
                    </button>
                    <button
                        onClick={() => { setUploadType('FACULTY'); setSelectedId(''); }}
                        className={`flex-1 p-4 rounded-lg border-2 flex items-center justify-center font-bold transition-all ${uploadType === 'FACULTY' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                        <User className="w-5 h-5 mr-2" /> Faculty Timetable
                    </button>
                </div>

                {/* Status Banner */}
                {status && (
                    <div className={`p-4 mb-6 rounded-lg flex items-center border ${
                        status.type === 'success'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        {status.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <XCircle className="w-5 h-5 mr-3" />}
                        <span className="font-medium">{status.msg}</span>
                    </div>
                )}

                <form onSubmit={handleUpload} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select {uploadType === 'CLASS' ? 'Academic Year' : 'Faculty Member'}
                        </label>
                        <select
                            value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
                            className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none" required
                        >
                            <option value="">-- Select --</option>
                            {uploadType === 'CLASS'
                                ? years.map((y, i) => <option key={i} value={y}>{formatYear(y)}</option>)
                                : facultyList.map(f => <option key={f.id} value={f.id}>{f.name} ({f.designation})</option>)
                            }
                        </select>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-gray-50 hover:border-indigo-500 transition-colors cursor-pointer group">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="tt-upload" required />
                        <label htmlFor="tt-upload" className="cursor-pointer block w-full h-full">
                            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                            <span className="text-gray-900 font-medium block text-lg">{file ? file.name : "Click to select file"}</span>
                            <span className="text-xs text-gray-500 mt-1 block">PDF or Images (Max 10MB)</span>
                        </label>
                        <button type="button" onClick={() => setShowCamera(true)} className="inline-flex items-center mt-3 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                            <Camera className="w-4 h-4 mr-1.5" /> Take Photo
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !file || !selectedId}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Uploading...' : 'Publish Timetable'}
                    </button>
                </form>
            </div>

            <CameraCapture
                open={showCamera}
                onClose={() => setShowCamera(false)}
                onCapture={(f) => { setFile(f); setShowCamera(false); }}
            />
        </div>
    );
};
export default ManageTimetables;