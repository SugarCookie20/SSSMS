import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { ArrowLeft } from 'lucide-react';

const FacultyTimetable = () => {
    const navigate = useNavigate();
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/timetable/faculty/me');
                if (res.data.exists) {
                    setPdfUrl(`http://localhost:8080/api/timetable/view/${res.data.fileName}`);
                }
            } catch (e) {}
        };
        fetch();
    }, []);

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-100px)]">
            <button onClick={() => navigate('/faculty/dashboard')} className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Schedule</h1>

            {pdfUrl ? (
                <div className="w-full h-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <iframe src={pdfUrl} className="w-full h-full" title="Timetable"></iframe>
                </div>
            ) : (
                <div className="p-10 text-center text-gray-500 bg-white border rounded-xl">
                    No personal timetable uploaded yet.
                </div>
            )}
        </div>
    );
};
export default FacultyTimetable;