//check

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { ArrowLeft, CheckCircle, XCircle, Edit3, Save } from 'lucide-react';

const EXAM_TYPES = [
    { group: 'Internal Assessment (ISE/ICA)', options: [
        { value: 'UNIT_TEST_1', label: 'Unit Test 1' },
        { value: 'UNIT_TEST_2', label: 'Unit Test 2' },
        { value: 'UNIT_TEST_3', label: 'Unit Test 3' },
        { value: 'ASSIGNMENT', label: 'Assignment' },
        { value: 'JURY', label: 'Jury' },
    ]},
    { group: 'External Assessment (ESE)', options: [
        { value: 'THEORY_ESE', label: 'Theory ESE' },
        { value: 'PRACTICAL_ESE', label: 'Practical ESE' },
        { value: 'SESSIONAL_ESE', label: 'Sessional/Studio ESE' },
    ]},
];

const GradingSheet = () => {
    const { id } = useParams(); // Allocation ID
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState({}); // { studentId: value }
    const [examType, setExamType] = useState('UNIT_TEST_1');
    const [maxMarks, setMaxMarks] = useState(20);

    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);

    // Edit mode state (like attendance)
    const [editMode, setEditMode] = useState(false);
    const [gradedTypes, setGradedTypes] = useState([]); // List of already graded exam type strings

    // 1. Fetch Roster + Graded Status
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await api.get(`/faculty/allocation/${id}/students`);
                setStudents(response.data);
            } catch {
                setStatus({ type: 'error', msg: 'Failed to load students' });
            }
        };
        fetchStudents();
    }, [id]);

    const fetchGradedStatus = useCallback(async () => {
        try {
            const res = await api.get(`/faculty/marks/${id}/status`);
            setGradedTypes(res.data);
        } catch {
            // ignore
        }
    }, [id]);

    useEffect(() => {
        fetchGradedStatus();
    }, [fetchGradedStatus]);

    // 2. When examType changes, check if already graded and load existing marks
    useEffect(() => {
        const checkExisting = async () => {
            if (gradedTypes.includes(examType)) {
                // Load existing marks for editing
                try {
                    const res = await api.get(`/faculty/marks/${id}?examType=${examType}`);
                    const existingMarks = {};
                    let existingMax = maxMarks;
                    res.data.forEach(m => {
                        existingMarks[m.studentId] = m.marksObtained;
                        existingMax = m.maxMarks;
                    });
                    setMarks(existingMarks);
                    setMaxMarks(existingMax);
                    setEditMode(true);
                } catch {
                    setMarks({});
                    setEditMode(false);
                }
            } else {
                // Fresh entry
                setMarks({});
                setEditMode(false);
            }
        };
        if (students.length > 0) {
            checkExisting();
        }
    }, [examType, gradedTypes, id, students]);

    // 3. Handle Mark Input
    const handleMarkChange = (studentId, value) => {
        setMarks(prev => ({
            ...prev,
            [studentId]: value
        }));
    };

    // 4. Submit Marks (works for both create and update — backend upserts)
    const handleSubmit = async () => {
        setSaving(true);
        setStatus(null);

        const requests = students.map(s => ({
            studentId: s.id,
            allocationId: parseInt(id),
            examType: examType,
            marks: parseFloat(marks[s.id] || 0),
            maxMarks: parseFloat(maxMarks)
        }));

        try {
            await api.post('/faculty/marks/batch', requests);
            setStatus({ type: 'success', msg: editMode ? 'Marks Updated Successfully!' : 'Marks Saved Successfully!' });
            setEditMode(true);
            fetchGradedStatus(); // Refresh graded badges
            setTimeout(() => setStatus(null), 3000);
        } catch {
            setStatus({ type: 'error', msg: 'Failed to save marks.' });
        } finally {
            setSaving(false);
        }
    };

    const isGraded = (type) => gradedTypes.includes(type);

    return (
        <div className="max-w-5xl mx-auto">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-gray-600 hover:text-blue-600">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {editMode ? (
                            <span className="flex items-center">
                                <Edit3 className="w-5 h-5 inline mr-2 text-orange-500" />
                                Edit Assessment Marks
                            </span>
                        ) : 'Enter Assessment Marks'}
                    </h1>
                    {editMode && (
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                            Editing — Previously Graded
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                        <select
                            value={examType} onChange={e => setExamType(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        >
                            {EXAM_TYPES.map(group => (
                                <optgroup key={group.group} label={group.group}>
                                    {group.options.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}{isGraded(opt.value) ? ' ✓ Graded' : ''}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                        <input
                            type="number" value={maxMarks} onChange={e => setMaxMarks(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                </div>

                {/* Graded badges summary */}
                {gradedTypes.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {EXAM_TYPES.flatMap(g => g.options).map(opt => (
                            isGraded(opt.value) && (
                                <span key={opt.value}
                                    onClick={() => setExamType(opt.value)}
                                    className={`text-xs px-2.5 py-1 rounded-full cursor-pointer transition-colors flex items-center gap-1 ${
                                        examType === opt.value
                                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-400'
                                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                                    }`}
                                >
                                    <CheckCircle className="w-3 h-3" /> {opt.label}
                                </span>
                            )
                        ))}
                    </div>
                )}
            </div>

            {status && (
                <div className={`p-4 mb-6 rounded-lg flex items-center border ${
                    status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                    {status.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3"/> : <XCircle className="w-5 h-5 mr-3"/>}
                    <span className="font-medium">{status.msg}</span>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-4">Student</th>
                        <th className="p-4">PRN</th>
                        <th className="p-4 w-32">Marks</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {students.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50">
                            <td className="p-4 font-medium">{s.firstName} {s.lastName}</td>
                            <td className="p-4 text-gray-500 font-mono">{s.prn}</td>
                            <td className="p-4">
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={marks[s.id] !== undefined ? marks[s.id] : ''}
                                    className={`w-full p-2 border rounded text-center font-bold ${editMode ? 'border-orange-300 bg-orange-50' : ''}`}
                                    onChange={(e) => handleMarkChange(s.id, e.target.value)}
                                />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <div className="p-4 bg-gray-50 border-t flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className={`text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50 flex items-center ${
                            editMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {editMode ? <Edit3 className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {saving ? 'Saving...' : editMode ? 'Update Marks' : 'Submit Marks'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GradingSheet;