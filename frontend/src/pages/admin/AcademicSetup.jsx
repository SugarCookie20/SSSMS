import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { BookOpen, Plus, CheckCircle, XCircle, Trash2, ArrowLeft } from 'lucide-react';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const AcademicSetup = () => {
    const navigate = useNavigate();
    const [subject, setSubject] = useState({
        name: '',
        code: '',
        department: 'Architecture',
        academicYear: 'FIRST_YEAR'
    });

    const [existingSubjects, setExistingSubjects] = useState([]);
    const [status, setStatus] = useState(null);
    const [confirm, setConfirm] = useState(null);

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/admin/subjects');
            setExistingSubjects(res.data);
        } catch (e) {
            console.error("Failed to load subjects");
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleSubject = async (e) => {
        e.preventDefault();
        setStatus(null);
        try {
            await api.post('/admin/subjects', subject);
            setStatus({ type: 'success', msg: 'Subject Created Successfully!' });
            setSubject({ name: '', code: '', department: 'Architecture', academicYear: 'FIRST_YEAR' });
            fetchSubjects(); // Refresh List
            setTimeout(() => setStatus(null), 3000);
        } catch(e) {
            setStatus({ type: 'error', msg: 'Failed to create subject.' });
        }
    };

    const handleDelete = (id) => {
        setConfirm({
            message: 'Are you sure you want to delete this subject?',
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/subject/${id}`);
                    fetchSubjects();
                } catch {
                    setStatus({ type: 'error', msg: 'Failed to delete subject.' });
                }
            },
        });
    };

    const formatYear = (str) => str.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());

    const StatusBanner = ({ status }) => {
        if (!status) return null;
        return (
            <div className={`p-4 mb-6 rounded-lg flex items-center border ${
                status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
            }`}>
                {status.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3"/> : <XCircle className="w-5 h-5 mr-3"/>}
                <span className="font-medium">{status.msg}</span>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <button onClick={() => navigate('/admin/dashboard')} className="mb-2 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Academic Setup</h1>
                <p className="text-gray-600">Define the curriculum and subjects for each year.</p>
            </div>

            {/* Create Subject Section */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center text-gray-900">
                    <div className="bg-blue-50 p-2 rounded-lg mr-3 text-blue-600">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    Add New Subject
                </h2>

                <StatusBanner status={status} />

                <form onSubmit={handleSubject} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                            <input
                                placeholder="e.g. History of Architecture III"
                                value={subject.name} onChange={e=>setSubject({...subject, name: e.target.value})}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                            <input
                                placeholder="e.g. ARC-301"
                                value={subject.code} onChange={e=>setSubject({...subject, code: e.target.value})}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select
                                value={subject.department} onChange={e=>setSubject({...subject, department: e.target.value})}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="Architecture">Architecture</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Year</label>
                            <select
                                value={subject.academicYear} onChange={e=>setSubject({...subject, academicYear: e.target.value})}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="FIRST_YEAR">First Year</option>
                                <option value="SECOND_YEAR">Second Year</option>
                                <option value="THIRD_YEAR">Third Year</option>
                                <option value="FOURTH_YEAR">Fourth Year</option>
                                <option value="FIFTH_YEAR">Fifth Year</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center">
                            <Plus className="w-4 h-4 mr-2" /> Create Subject
                        </button>
                    </div>
                </form>
            </div>

            {/* List of Existing Subjects */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">Existing Subjects</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                        <tr>
                            <th className="p-4">Code</th>
                            <th className="p-4">Subject Name</th>
                            <th className="p-4">Year</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {existingSubjects.map(sub => (
                            <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-mono text-gray-500">{sub.code}</td>
                                <td className="p-4 font-medium text-gray-900">{sub.name}</td>
                                <td className="p-4">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                            {formatYear(sub.academicYear)}
                                        </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleDelete(sub.id)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmDialog config={confirm} onClose={() => setConfirm(null)} />
        </div>
    );
};
export default AcademicSetup;