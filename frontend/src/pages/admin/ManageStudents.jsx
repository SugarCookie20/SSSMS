import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { Search, Edit2, Save, X, User, BookOpen, Plus, Trash2, CheckCircle, AlertTriangle, AlertCircle, Eye, ArrowLeft } from 'lucide-react';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const ManageStudents = () => {
    const navigate = useNavigate();
    const [confirmDlg, setConfirmDlg] = useState(null);

    // Data State
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [yearFilter, setYearFilter] = useState('');

    // Edit State
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    // UI Feedback State
    const [status, setStatus] = useState(null); // Main page status
    const [deleteId, setDeleteId] = useState(null); // For Delete Modal

    // --- COURSE MODAL STATE ---
    const [courseModalOpen, setCourseModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [allAllocations, setAllAllocations] = useState([]);
    const [selectedAllocationId, setSelectedAllocationId] = useState('');
    const [modalStatus, setModalStatus] = useState(null);

    // 1. Fetch Students
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (yearFilter) params.append('year', yearFilter);
            const res = await api.get(`/admin/students?${params.toString()}`);
            setStudents(res.data);
        } catch (e) {
            console.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [yearFilter]);

    // 2. Delete Logic
    const confirmDelete = (id) => {
        setDeleteId(id);
    };

    const executeDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/admin/student/${deleteId}`);
            setStatus({ type: 'success', msg: "Student Un-enrolled Successfully" });
            fetchStudents();
        } catch(e) {
            setStatus({ type: 'error', msg: "Delete Failed. " + (e.response?.data?.message || "") });
        } finally {
            setDeleteId(null);
            setTimeout(() => setStatus(null), 3000);
        }
    };

    // 3. Course Manager Logic
    const openCourseManager = async (student) => {
        setSelectedStudent(student);
        setCourseModalOpen(true);
        setModalStatus(null);
        setSelectedAllocationId('');
        try {
            const res = await api.get('/admin/allocations/all');
            setAllAllocations(res.data);
        } catch (e) {
            setModalStatus({ type: 'error', msg: "Failed to load course list" });
        }
    };

    const assignCourse = async () => {
        if (!selectedAllocationId) return;
        setModalStatus(null);

        try {
            await api.post(`/admin/student/${selectedStudent.id}/course/${selectedAllocationId}`);
            setModalStatus({ type: 'success', msg: "Course Assigned!" });

            fetchStudents();

            const addedCourse = allAllocations.find(a => a.id === parseInt(selectedAllocationId));
            const updatedExtras = [...(selectedStudent.extraCourses || [])];
            updatedExtras.push({
                id: addedCourse.id,
                subject: { name: addedCourse.subjectName, code: addedCourse.subjectCode },
                faculty: { firstName: addedCourse.facultyName.split(' ')[0], lastName: addedCourse.facultyName.split(' ')[1] || '' }
            });

            setSelectedStudent({ ...selectedStudent, extraCourses: updatedExtras });
        } catch (e) {
            setModalStatus({ type: 'error', msg: "Failed to assign." });
        }
    };

    const removeCourse = (allocationId) => {
        setConfirmDlg({
            message: 'Remove this extra course?',
            onConfirm: async () => {
                setModalStatus(null);
                try {
                    await api.delete(`/admin/student/${selectedStudent.id}/course/${allocationId}`);
                    setModalStatus({ type: 'success', msg: "Course Removed" });
                    fetchStudents();
                    const updatedExtras = selectedStudent.extraCourses.filter(c => c.id !== allocationId);
                    setSelectedStudent({ ...selectedStudent, extraCourses: updatedExtras });
                } catch {
                    setModalStatus({ type: 'error', msg: "Failed to remove." });
                }
            },
        });
    };

    // 4. Edit Logic
    const filteredStudents = students.filter(s =>
        s.firstName.toLowerCase().includes(search.toLowerCase()) ||
        s.lastName.toLowerCase().includes(search.toLowerCase()) ||
        s.prn.includes(search)
    );

    const startEdit = (student) => { setEditingId(student.id); setEditForm({ ...student }); };
    const handleEditChange = (e) => { setEditForm({ ...editForm, [e.target.name]: e.target.value }); };

    const saveEdit = async () => {
        try {
            await api.put(`/admin/student/${editingId}`, editForm);
            setEditingId(null);
            setStatus({ type: 'success', msg: "Student Updated Successfully" });
            fetchStudents();
            setTimeout(() => setStatus(null), 3000);
        }
        catch (e) { setStatus({ type: 'error', msg: "Update Failed" }); }
    };

    const formatYear = (enumStr) => {
        if(!enumStr) return "N/A";
        return enumStr.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());
    };

    return (
        <div className="max-w-7xl mx-auto">
            <button onClick={() => navigate('/admin/dashboard')} className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Student Directory</h1>
                    <p className="text-gray-600 mt-1">Manage enrollments and individual course assignments.</p>
                </div>
                <div className="text-sm text-gray-500">
                    Total: <span className="font-bold text-gray-900">{filteredStudents.length}</span>
                </div>
            </div>

            {/* Status Toast */}
            {status && (
                <div className={`p-4 mb-6 rounded-lg flex items-center border ${
                    status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                    {status.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3"/> : <AlertCircle className="w-5 h-5 mr-3"/>}
                    <span className="font-medium">{status.msg}</span>
                </div>
            )}

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        placeholder="Search Name or PRN..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="p-2 border rounded-lg text-sm bg-gray-50">
                    <option value="">All Years</option>
                    <option value="FIRST_YEAR">First Year</option>
                    <option value="SECOND_YEAR">Second Year</option>
                    <option value="THIRD_YEAR">Third Year</option>
                    <option value="FOURTH_YEAR">Fourth Year</option>
                    <option value="FIFTH_YEAR">Fifth Year</option>
                </select>
                <button onClick={() => {setYearFilter(''); setSearch('')}} className="text-sm text-red-500 hover:underline">Reset</button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                        <tr>
                            <th className="p-4">Student Name</th>
                            <th className="p-4">PRN</th>
                            <th className="p-4">Standard Class</th>
                            <th className="p-4">Extra Courses</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading directory...</td></tr>
                        ) : filteredStudents.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">No students found.</td></tr>
                        ) : (
                            filteredStudents.map(student => (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                    {editingId === student.id ? (
                                        <>
                                            <td className="p-4">
                                                <input name="firstName" value={editForm.firstName} onChange={handleEditChange} className="border p-1 rounded w-24 mr-2" />
                                                <input name="lastName" value={editForm.lastName} onChange={handleEditChange} className="border p-1 rounded w-24" />
                                            </td>
                                            <td className="p-4 text-gray-400">{student.prn}</td>
                                            <td className="p-4">
                                                <select name="academicYear" value={editForm.academicYear} onChange={handleEditChange} className="border p-1 rounded bg-yellow-50 border-yellow-300 w-full">
                                                    <option value="FIRST_YEAR">First Year</option>
                                                    <option value="SECOND_YEAR">Second Year</option>
                                                    <option value="THIRD_YEAR">Third Year</option>
                                                    <option value="FOURTH_YEAR">Fourth Year</option>
                                                    <option value="FIFTH_YEAR">Fifth Year</option>
                                                </select>
                                            </td>
                                            <td className="p-4">-</td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                <button onClick={saveEdit} className="text-green-600 hover:bg-green-100 p-1.5 rounded"><Save className="w-4 h-4"/></button>
                                                <button onClick={() => setEditingId(null)} className="text-red-600 hover:bg-red-100 p-1.5 rounded"><X className="w-4 h-4"/></button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="p-4 font-medium text-gray-900 flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 font-bold text-xs">
                                                    {student.firstName[0]}{student.lastName[0]}
                                                </div>
                                                {student.firstName} {student.lastName}
                                            </td>
                                            <td className="p-4 text-gray-500 font-mono">{student.prn}</td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {formatYear(student.academicYear)}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {student.extraCourses?.length > 0 ? (
                                                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">
                                                    {student.extraCourses.length} Custom
                                                </span>
                                                ) : <span className="text-gray-400 text-xs">Standard Only</span>}
                                            </td>
                                            <td className="p-4 text-right flex justify-end gap-2">

                                                {/* Manage Courses */}
                                                <button onClick={() => openCourseManager(student)} className="text-purple-600 hover:bg-purple-50 p-2 rounded-lg" title="Manage Courses">
                                                    <BookOpen className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => navigate(`/admin/student-profile/${student.id}`)}
                                                    className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg"
                                                    title="View Profile"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                {/* Edit */}
                                                <button onClick={() => startEdit(student)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg" title="Edit Profile">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>

                                                {/* Delete */}
                                                <button onClick={() => confirmDelete(student.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg" title="Un-enroll">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DELETE CONFIRMATION MODAL */}
            {deleteId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full border border-gray-200">
                        <div className="flex items-center text-red-600 mb-4">
                            <AlertTriangle className="w-6 h-6 mr-2" />
                            <h3 className="text-lg font-bold">Confirm Un-enrollment</h3>
                        </div>
                        <p className="text-gray-600 mb-6 text-sm">
                            Are you sure you want to un-enroll this student? This will delete all their records.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
                            <button onClick={executeDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium shadow-sm">Yes, Un-enroll</button>
                        </div>
                    </div>
                </div>
            )}

            {/* COURSE MODAL */}
            {courseModalOpen && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Manage Courses</h3>
                                <p className="text-sm text-gray-500">{selectedStudent.firstName} {selectedStudent.lastName}</p>
                            </div>
                            <button onClick={() => setCourseModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            {modalStatus && (
                                <div className={`p-3 mb-4 rounded-lg text-sm flex items-center ${
                                    modalStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                    {modalStatus.type === 'success' && <CheckCircle className="w-4 h-4 mr-2"/>}
                                    {modalStatus.msg}
                                </div>
                            )}
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-700 text-sm mb-3 uppercase tracking-wider">Assigned Extra Courses</h4>
                                {selectedStudent.extraCourses && selectedStudent.extraCourses.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedStudent.extraCourses.map(c => (
                                            <div key={c.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{c.subject.name}</p>
                                                    <p className="text-xs text-gray-500">{c.subject.code} • {c.faculty?.firstName}</p>
                                                </div>
                                                <button onClick={() => removeCourse(c.id)} className="text-red-500 hover:bg-red-100 p-1.5 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">
                                        No extra courses assigned.
                                    </div>
                                )}
                            </div>
                            <div className="border-t pt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Additional Course</label>
                                <div className="flex gap-2">
                                    <select
                                        className="border p-2.5 rounded-lg w-full text-sm bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={selectedAllocationId}
                                        onChange={(e) => setSelectedAllocationId(e.target.value)}
                                    >
                                        <option value="">-- Select Course to Add --</option>
                                        {allAllocations.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.subjectName} ({a.subjectCode}) - {formatYear(a.year)}
                                            </option>
                                        ))}
                                    </select>
                                    <button onClick={assignCourse} disabled={!selectedAllocationId} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"><Plus className="w-5 h-5" /></button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-200 text-right">
                            <button onClick={() => setCourseModalOpen(false)} className="text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Done</button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog config={confirmDlg} onClose={() => setConfirmDlg(null)} />
        </div>
    );
};

export default ManageStudents;