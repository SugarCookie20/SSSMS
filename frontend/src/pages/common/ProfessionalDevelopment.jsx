import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../auth/useAuth';
import {
    Award, Plus, Trash2, CheckCircle, XCircle, Calendar, Building2, BookOpen, ArrowLeft
} from 'lucide-react';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const PD_TYPES = [
    { value: 'WORKSHOP', label: 'Workshop' },
    { value: 'QIP', label: 'Quality Improvement Program' },
    { value: 'FDP', label: 'Faculty Development Program' },
    { value: 'CONFERENCE', label: 'Conference' },
    { value: 'SEMINAR', label: 'Seminar' },
    { value: 'CERTIFICATION', label: 'Certification' },
    { value: 'OTHER', label: 'Other' },
];

const typeColors = {
    WORKSHOP: 'bg-blue-100 text-blue-700',
    QIP: 'bg-purple-100 text-purple-700',
    FDP: 'bg-indigo-100 text-indigo-700',
    CONFERENCE: 'bg-green-100 text-green-700',
    SEMINAR: 'bg-orange-100 text-orange-700',
    CERTIFICATION: 'bg-emerald-100 text-emerald-700',
    OTHER: 'bg-gray-100 text-gray-700',
};

const ProfessionalDevelopment = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role?.includes('ADMIN');
    const isFaculty = user?.role?.includes('FACULTY');
    const dashboardPath = isAdmin ? '/admin/dashboard' : '/faculty/dashboard';

    const [entries, setEntries] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [confirm, setConfirm] = useState(null);

    // Admin: faculty selection
    const [facultyList, setFacultyList] = useState([]);
    const [selectedFacultyId, setSelectedFacultyId] = useState('');

    const [form, setForm] = useState({
        title: '', type: 'WORKSHOP', organization: '', startDate: '', endDate: '', description: ''
    });

    const fetchFacultyList = async () => {
        try {
            const res = await api.get('/admin/faculty/all');
            setFacultyList(res.data);
        } catch { console.error("Failed to load faculty list"); }
    };

    const fetchEntries = async (facultyId) => {
        try {
            const url = isAdmin && facultyId
                ? `/admin/faculty/${facultyId}/pd`
                : '/faculty/professional-development';
            const res = await api.get(url);
            setEntries(res.data);
        } catch { console.error("Failed to load entries"); }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchFacultyList();
        } else if (isFaculty) {
            fetchEntries();
        }
    }, [isAdmin, isFaculty]);

    const handleFacultySelect = (id) => {
        setSelectedFacultyId(id);
        if (id) fetchEntries(id);
        else setEntries([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = isAdmin && selectedFacultyId
                ? `/admin/faculty/${selectedFacultyId}/pd`
                : '/faculty/professional-development';
            await api.post(url, form);
            setStatus({ type: 'success', message: 'Entry added successfully!' });
            setForm({ title: '', type: 'WORKSHOP', organization: '', startDate: '', endDate: '', description: '' });
            setShowForm(false);
            isAdmin ? fetchEntries(selectedFacultyId) : fetchEntries();
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch {
            setStatus({ type: 'error', message: 'Failed to add entry.' });
        }
    };

    const handleDelete = (id) => {
        setConfirm({
            message: 'Delete this entry?',
            onConfirm: async () => {
                try {
                    const url = isAdmin ? `/admin/pd/${id}` : `/faculty/professional-development/${id}`;
                    await api.delete(url);
                    setStatus({ type: 'success', message: 'Entry deleted.' });
                    isAdmin ? fetchEntries(selectedFacultyId) : fetchEntries();
                    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
                } catch {
                    setStatus({ type: 'error', message: 'Failed to delete entry.' });
                }
            },
        });
    };

    const canAdd = isFaculty || (isAdmin && selectedFacultyId);

    return (
        <div className="max-w-5xl mx-auto">
            <button onClick={() => navigate(dashboardPath)} className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Professional Development</h1>
                    <p className="text-gray-600 mt-1">Workshops, QIPs, FDPs, Conferences & Certifications</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-full">
                    <Award className="w-6 h-6 text-purple-600" />
                </div>
            </div>

            {/* Status Toast */}
            {status.message && (
                <div className={`p-4 mb-6 rounded-lg flex items-center border ${
                    status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                    {status.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <XCircle className="w-5 h-5 mr-3" />}
                    <span className="font-medium">{status.message}</span>
                </div>
            )}

            {/* Admin: Faculty Selector */}
            {isAdmin && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Faculty Member</label>
                    <select
                        value={selectedFacultyId}
                        onChange={(e) => handleFacultySelect(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                    >
                        <option value="">— Choose a faculty member —</option>
                        {facultyList.map(f => (
                            <option key={f.id} value={f.id}>{f.name} ({f.email})</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Add New Button */}
            {canAdd && (
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        {showForm ? 'Cancel' : 'Add Entry'}
                    </button>
                </div>
            )}

            {/* Add Form */}
            {showForm && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Entry</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text" value={form.title} required
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g., Advanced BIM Workshop"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                                >
                                    {PD_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                                <input
                                    type="text" value={form.organization}
                                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
                                    placeholder="e.g., IIT Bombay, COA India"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date" value={form.startDate}
                                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date" value={form.endDate}
                                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Brief details about this program..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                rows={3}
                            />
                        </div>
                        <button type="submit" className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm">
                            Add Entry
                        </button>
                    </form>
                </div>
            )}

            {/* Entries List */}
            {entries.length > 0 ? (
                <div className="space-y-3">
                    {entries.map(entry => (
                        <div key={entry.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-bold text-gray-900">{entry.title}</h4>
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${typeColors[entry.type] || typeColors.OTHER}`}>
                                            {PD_TYPES.find(t => t.value === entry.type)?.label || entry.type}
                                        </span>
                                    </div>
                                    {entry.organization && (
                                        <p className="text-sm text-gray-600 flex items-center mb-1">
                                            <Building2 className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                            {entry.organization}
                                        </p>
                                    )}
                                    {entry.description && (
                                        <p className="text-sm text-gray-500 mt-1">{entry.description}</p>
                                    )}
                                    <div className="flex items-center flex-wrap gap-3 mt-2 text-xs text-gray-400">
                                        {(entry.startDate || entry.endDate) && (
                                            <span className="flex items-center">
                                                <Calendar className="w-3.5 h-3.5 mr-1" />
                                                {entry.startDate && new Date(entry.startDate).toLocaleDateString()}
                                                {entry.startDate && entry.endDate && ' — '}
                                                {entry.endDate && new Date(entry.endDate).toLocaleDateString()}
                                            </span>
                                        )}
                                        {isAdmin && entry.facultyName && (
                                            <span className="text-purple-600 font-medium">{entry.facultyName}</span>
                                        )}
                                        {entry.addedBy && (
                                            <span>Added by: {entry.addedBy}</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(entry.id)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 ml-3"
                                    title="Delete entry"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                    <BookOpen className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                    <p>{isAdmin && !selectedFacultyId ? 'Select a faculty member to view their entries.' : 'No professional development entries yet.'}</p>
                </div>
            )}

            <ConfirmDialog config={confirm} onClose={() => setConfirm(null)} />
        </div>
    );
};

export default ProfessionalDevelopment;


