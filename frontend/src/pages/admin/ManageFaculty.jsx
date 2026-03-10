import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { Trash2, Plus, User, CheckCircle, XCircle, AlertCircle, UserX, Eye, ArrowLeft } from 'lucide-react';

const ManageFaculty = () => {
    const navigate = useNavigate();

    // Data State
    const [facultyList, setFacultyList] = useState([]);
    const [subjects, setSubjects] = useState([]);

    // Selection State
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [allocations, setAllocations] = useState([]);

    // Form State
    const [subjectId, setSubjectId] = useState('');

    // UI State
    const [status, setStatus] = useState({ type: '', message: '' });
    const [deleteId, setDeleteId] = useState(null); // For Allocations
    const [unenrollId, setUnenrollId] = useState(null); // For Faculty

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [facRes, subRes] = await Promise.all([
                api.get('/admin/faculty/all'),
                api.get('/admin/subjects')
            ]);
            setFacultyList(facRes.data);
            setSubjects(subRes.data);
        } catch (error) {
            console.error("Failed to load data", error);
        }
    };

    const handleSelect = async (faculty) => {
        setSelectedFaculty(faculty);
        setStatus({ type: '', message: '' });
        try {
            const response = await api.get(`/admin/faculty/${faculty.id}/allocations`);
            setAllocations(response.data);
        } catch (error) {
            setAllocations([]);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (!subjectId) return;

        try {
            await api.post('/admin/allocate-subject', {
                facultyId: selectedFaculty.id,
                subjectId: subjectId
            });

            setStatus({ type: 'success', message: 'Subject Assigned Successfully!' });
            setSubjectId('');

            const response = await api.get(`/admin/faculty/${selectedFaculty.id}/allocations`);
            setAllocations(response.data);
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data || 'Failed to assign subject.' });
        }
    };

    const executeAllocationDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/admin/allocation/${deleteId}`);
            setStatus({ type: 'success', message: 'Assignment Removed' });
            const response = await api.get(`/admin/faculty/${selectedFaculty.id}/allocations`);
            setAllocations(response.data);
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to remove assignment.' });
        } finally {
            setDeleteId(null);
        }
    };

    const confirmUnenroll = (e, id) => {
        e.stopPropagation();
        setUnenrollId(id);
    };

    const executeUnenroll = async () => {
        if (!unenrollId) return;
        try {
            await api.delete(`/admin/faculty/${unenrollId}`);
            alert('Faculty Member Un-enrolled Successfully');
            if (selectedFaculty?.id === unenrollId) {
                setSelectedFaculty(null);
                setAllocations([]);
            }
            loadData();
        } catch (e) {
            alert('Failed to un-enroll faculty.');
        } finally {
            setUnenrollId(null);
        }
    };

    const formatYear = (str) => {
        if (!str || str === 'N/A') return 'N/A';
        return str.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());
    };

    return (
        <div className="max-w-6xl mx-auto">
            <button onClick={() => navigate('/admin/dashboard')} className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">

            {/* Faculty List */}
            <div className="w-full md:w-1/3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700">
                    Faculty Members ({facultyList.length})
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {facultyList.map(f => (
                        <div
                            key={f.id}
                            onClick={() => handleSelect(f)}
                            className={`p-3 rounded-lg cursor-pointer flex items-center justify-between group transition-colors ${
                                selectedFaculty?.id === f.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
                            }`}
                        >
                            <div className="flex items-center overflow-hidden flex-1">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3 flex-shrink-0">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="truncate">
                                    <p className={`font-semibold text-sm truncate ${selectedFaculty?.id === f.id ? 'text-blue-700' : 'text-gray-800'}`}>
                                        {f.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{f.email}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {/* View Profile */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/admin/faculty-profile/${f.id}`);
                                    }}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg mr-1"
                                    title="View Profile"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>

                                {/* Unenroll */}
                                <button
                                    onClick={(e) => confirmUnenroll(e, f.id)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                                    title="Un-enroll Faculty"
                                >
                                    <UserX className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Workload Manager */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-y-auto">
                {!selectedFaculty ? (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        Select a faculty member to manage workload
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedFaculty.name}</h2>
                        <p className="text-gray-500 mb-6">{selectedFaculty.designation}</p>

                        {status.message && (
                            <div className={`p-3 mb-6 rounded-lg text-sm flex items-center ${
                                status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                                <span className="font-medium">{status.message}</span>
                            </div>
                        )}

                        <h3 className="font-semibold text-gray-700 mb-3">Current Assignments</h3>
                        <div className="bg-gray-50 rounded-lg border border-gray-200 mb-8 overflow-hidden">
                            {allocations.length === 0 ? (
                                <p className="p-4 text-gray-500 text-sm">No subjects assigned.</p>
                            ) : (
                                allocations.map(a => (
                                    <div key={a.id} className="p-4 flex justify-between items-center border-b last:border-0 border-gray-200">
                                        <div>
                                            <p className="font-bold text-gray-800">{a.subjectName} <span className="text-gray-400 text-xs">({a.subjectCode})</span></p>
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mt-1 inline-block">
                                                {formatYear(a.className)}
                                            </span>
                                        </div>
                                        <button onClick={() => setDeleteId(a.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <h3 className="font-semibold text-gray-700 mb-3">Assign New Subject</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <select
                                    value={subjectId}
                                    onChange={(e) => setSubjectId(e.target.value)}
                                    className="p-2.5 border rounded-lg w-full bg-white text-sm"
                                    required
                                >
                                    <option value="">-- Choose Subject --</option>
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.code}) - {formatYear(s.academicYear)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center transition-colors">
                                <Plus className="w-4 h-4 mr-2" /> Assign Subject
                            </button>
                        </form>
                    </>
                )}
            </div>

            {/* Modal: Delete Allocation */}
            {deleteId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
                        <h3 className="text-lg font-bold mb-4">Remove Subject?</h3>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={executeAllocationDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Remove</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Unenroll Faculty */}
            {unenrollId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full border-2 border-red-100">
                        <h3 className="text-lg font-bold mb-2 text-red-600">Un-enroll Faculty?</h3>
                        <p className="text-gray-600 mb-6 text-sm">
                            This will delete their account and remove all subject allocations. This cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setUnenrollId(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={executeUnenroll} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};
export default ManageFaculty;