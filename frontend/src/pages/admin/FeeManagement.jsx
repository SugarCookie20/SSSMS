import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import {
    Banknote, CheckCircle, AlertCircle, Search, XCircle,
    Bell, Trash2, Plus, AlertTriangle, Users, Edit2, ArrowLeft
} from 'lucide-react';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const FeeManagement = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Payment Modal State
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [payAmount, setPayAmount] = useState('');

    // Edit Fee Modal State
    const [editFeeModal, setEditFeeModal] = useState(null);
    const [newTotalFee, setNewTotalFee] = useState('');

    // Toast Status State
    const [status, setStatus] = useState({ type: '', message: '' });
    const [confirm, setConfirm] = useState(null);

    // Fee Reminders State
    const [reminders, setReminders] = useState([]);
    const [showReminderForm, setShowReminderForm] = useState(false);
    const [reminderForm, setReminderForm] = useState({ title: '', message: '', dueDate: '' });

    // Pending Stats
    const [pendingStats, setPendingStats] = useState({ pendingCount: 0, totalPending: 0, totalStudents: 0 });

    const fetchFees = async () => {
        try {
            const response = await api.get('/admin/fees');
            setRecords(response.data);
        } catch {
            console.error("Failed to fetch fees");
        }
    };

    const fetchReminders = async () => {
        try {
            const res = await api.get('/admin/fees/reminders');
            setReminders(res.data);
        } catch {
            console.error("Failed to fetch reminders");
        }
    };

    const fetchPendingStats = async () => {
        try {
            const res = await api.get('/admin/fees/pending-count');
            setPendingStats(res.data);
        } catch {
            console.error("Failed to fetch pending stats");
        }
    };

    useEffect(() => {
        fetchFees();
        fetchReminders();
        fetchPendingStats();
    }, []);

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!selectedStudent || !payAmount) return;
        setStatus({ type: '', message: '' });

        // Client-side validation
        const paymentAmount = parseFloat(payAmount);
        if (paymentAmount <= 0) {
            setStatus({ type: 'error', message: 'Payment amount must be greater than zero.' });
            return;
        }

        if (paymentAmount > selectedStudent.balance) {
            setStatus({ type: 'error', message: `Payment amount (₹${paymentAmount.toLocaleString()}) cannot exceed the remaining balance (₹${selectedStudent.balance.toLocaleString()}).` });
            return;
        }

        try {
            await api.post('/admin/fees/pay', {
                studentId: selectedStudent.studentId,
                amount: paymentAmount
            });
            setStatus({ type: 'success', message: 'Payment Recorded Successfully!' });
            setSelectedStudent(null);
            setPayAmount('');
            fetchFees();
            fetchPendingStats();
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            const errorMsg = error.response?.data || 'Failed to record payment. Please try again.';
            setStatus({ type: 'error', message: errorMsg });
        }
    };

    const handleCreateReminder = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/fees/reminders', reminderForm);
            setStatus({ type: 'success', message: 'Fee Reminder sent successfully!' });
            setReminderForm({ title: '', message: '', dueDate: '' });
            setShowReminderForm(false);
            fetchReminders();
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch {
            setStatus({ type: 'error', message: 'Failed to create reminder.' });
        }
    };

    const handleDeleteReminder = (id) => {
        setConfirm({
            message: 'Delete this reminder?',
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/fees/reminders/${id}`);
                    fetchReminders();
                    setStatus({ type: 'success', message: 'Reminder deleted.' });
                    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
                } catch {
                    setStatus({ type: 'error', message: 'Failed to delete reminder.' });
                }
            },
        });
    };

    const handleScholarshipUpdate = async (studentId, newStatus) => {
        try {
            await api.put(`/admin/fees/scholarship/${studentId}`, {
                status: newStatus,
                scholarshipAmount: (newStatus === 'APPROVED' && scholarshipAmountInput) ? scholarshipAmountInput : null,
            });
            setStatus({ type: 'success', message: 'Scholarship status updated!' });
            setScholarshipModal(null);
            setScholarshipAmountInput('');
            fetchFees();
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch {
            setStatus({ type: 'error', message: 'Failed to update scholarship status.' });
        }
    };

    const handleUpdateTotalFee = async (e) => {
        e.preventDefault();
        if (!editFeeModal || !newTotalFee) return;
        setStatus({ type: '', message: '' });
        try {
            await api.put(`/admin/fees/update-total/${editFeeModal.studentId}`, {
                totalFee: parseFloat(newTotalFee)
            });
            setStatus({ type: 'success', message: 'Total fee updated successfully!' });
            setEditFeeModal(null);
            setNewTotalFee('');
            fetchFees();
            fetchPendingStats();
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            const errorMsg = error.response?.data || 'Failed to update fee. Please try again.';
            setStatus({ type: 'error', message: errorMsg });
        }
    };

    // Scholarship Modal State
    const [scholarshipModal, setScholarshipModal] = useState(null);
    const [scholarshipAmountInput, setScholarshipAmountInput] = useState('');

    const scholarshipConfig = {
        NOT_APPLIED: { label: 'Not Applied', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
        APPLIED: { label: 'Applied', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
        APPROVED: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
        REJECTED: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    };

    const filteredRecords = records.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.prn.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto">
            <button onClick={() => navigate('/admin/dashboard')} className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
                    <p className="text-gray-600 mt-1">Track student payments, dues, and send fee reminders.</p>
                </div>
                <div className="bg-green-50 p-3 rounded-full">
                    <Banknote className="w-6 h-6 text-green-600" />
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

            {/* ========== Pending Fees Visual Alert ========== */}
            {pendingStats.pendingCount > 0 && (
                <div className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start">
                        <div className="p-3 bg-red-100 rounded-lg mr-4">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-red-800 mb-1">Pending Fee Alert</h3>
                            <p className="text-red-700 text-sm mb-3">
                                There are outstanding fee balances that require attention.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <div className="bg-white px-4 py-2.5 rounded-lg border border-red-200 shadow-sm">
                                    <div className="flex items-center">
                                        <Users className="w-4 h-4 text-red-500 mr-2" />
                                        <span className="text-xs text-gray-500 mr-2">Students with Pending Fees</span>
                                        <span className="text-lg font-bold text-red-700">{pendingStats.pendingCount}</span>
                                    </div>
                                </div>
                                <div className="bg-white px-4 py-2.5 rounded-lg border border-red-200 shadow-sm">
                                    <div className="flex items-center">
                                        <Banknote className="w-4 h-4 text-red-500 mr-2" />
                                        <span className="text-xs text-gray-500 mr-2">Total Outstanding</span>
                                        <span className="text-lg font-bold text-red-700">₹{pendingStats.totalPending.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="bg-white px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex items-center">
                                        <Users className="w-4 h-4 text-gray-500 mr-2" />
                                        <span className="text-xs text-gray-500 mr-2">Total Students</span>
                                        <span className="text-lg font-bold text-gray-700">{pendingStats.totalStudents}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== Fee Reminders Section ========== */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <Bell className="w-5 h-5 mr-2 text-orange-500" />
                        Fee Reminders
                    </h2>
                    <button
                        onClick={() => setShowReminderForm(!showReminderForm)}
                        className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        {showReminderForm ? 'Cancel' : 'New Reminder'}
                    </button>
                </div>

                {/* Create Reminder Form */}
                {showReminderForm && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Send Fee Reminder</h3>
                        <p className="text-sm text-gray-500 mb-4">This reminder will be visible to all students with pending fees on their dashboard.</p>
                        <form onSubmit={handleCreateReminder} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={reminderForm.title}
                                    onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                                    placeholder="e.g., Semester Fee Payment Reminder"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    value={reminderForm.message}
                                    onChange={(e) => setReminderForm({ ...reminderForm, message: e.target.value })}
                                    placeholder="e.g., Please clear your pending semester fees before the due date to avoid late charges."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                                    rows={3}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
                                <input
                                    type="date"
                                    value={reminderForm.dueDate}
                                    onChange={(e) => setReminderForm({ ...reminderForm, dueDate: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-orange-600 text-white px-6 py-2.5 rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm"
                            >
                                Send Reminder
                            </button>
                        </form>
                    </div>
                )}

                {/* Active Reminders List */}
                {reminders.length > 0 ? (
                    <div className="space-y-3">
                        {reminders.map((reminder) => (
                            <div key={reminder.id} className="bg-white rounded-xl border border-orange-200 p-4 flex items-start shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg mr-4 mt-0.5 shrink-0">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <h4 className="font-bold text-gray-900">{reminder.title}</h4>
                                        <button
                                            onClick={() => handleDeleteReminder(reminder.id)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 ml-2"
                                            title="Delete reminder"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-gray-600 text-sm mt-1">{reminder.message}</p>
                                    <div className="flex items-center text-xs text-gray-400 mt-2 gap-3">
                                        {reminder.dueDate && (
                                            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded font-medium">
                                                Due: {new Date(reminder.dueDate).toLocaleDateString()}
                                            </span>
                                        )}
                                        <span>Created: {new Date(reminder.createdAt).toLocaleDateString()}</span>
                                        <span>By: {reminder.createdBy}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">
                        No active fee reminders. Click "New Reminder" to send one.
                    </div>
                )}
            </div>

            {/* ========== Fee Records Table ========== */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Student Fee Records</h2>

                {/* Search Bar */}
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by Name or PRN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-shadow hover:shadow-sm"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Student</th>
                            <th className="p-4 font-semibold text-gray-600">PRN</th>
                            <th className="p-4 font-semibold text-gray-600">Total Fee</th>
                            <th className="p-4 font-semibold text-gray-600">Paid</th>
                            <th className="p-4 font-semibold text-gray-600">Scholarship</th>
                            <th className="p-4 font-semibold text-gray-600">Balance</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-gray-600">Scholarship Status</th>
                            <th className="p-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {filteredRecords.map((record) => (
                            <tr key={record.studentId} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-medium text-gray-900">{record.name}</td>
                                <td className="p-4 text-gray-500 font-mono text-sm">{record.prn}</td>
                                <td className="p-4 text-gray-900">₹{record.total.toLocaleString()}</td>
                                <td className="p-4 text-green-600">₹{record.paid.toLocaleString()}</td>
                                <td className="p-4 text-purple-600">
                                    {record.scholarshipAmount > 0 ? `₹${record.scholarshipAmount.toLocaleString()}` : '—'}
                                </td>
                                <td className="p-4 text-red-600 font-medium">₹{record.balance.toLocaleString()}</td>
                                <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status === 'PAID' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                          {record.status}
                      </span>
                                </td>
                                <td className="p-4">
                                    {(() => {
                                        const cfg = scholarshipConfig[record.scholarshipStatus] || scholarshipConfig.NOT_APPLIED;
                                        return (
                                            <button
                                                onClick={() => setScholarshipModal(record)}
                                                className={`${cfg.text} hover:opacity-80 font-medium text-sm border ${cfg.border} px-3 py-1 rounded hover:bg-opacity-80 transition-colors`}
                                            >
                                                {cfg.label}
                                            </button>
                                        );
                                    })()}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setEditFeeModal(record);
                                                setNewTotalFee(record.total);
                                            }}
                                            className="text-gray-600 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded transition-colors"
                                            title="Edit Total Fee"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        {record.status !== 'PAID' && (
                                            <button
                                                onClick={() => setSelectedStudent(record)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                                            >
                                                Record Pay
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                    {filteredRecords.length === 0 && (
                        <div className="p-8 text-center text-gray-500">No records found.</div>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full border border-gray-200">
                        <h3 className="text-xl font-bold mb-4 text-gray-900">Record Payment</h3>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-100">
                            <p className="text-gray-600 text-sm">Student: <span className="font-semibold text-gray-900">{selectedStudent.name}</span></p>
                            <p className="text-gray-600 text-sm mt-1">PRN: <span className="font-semibold text-gray-900">{selectedStudent.prn}</span></p>
                            <p className="text-gray-600 text-sm mt-1">Total Fee: <span className="font-semibold text-gray-900">₹{selectedStudent.total.toLocaleString()}</span></p>
                            <p className="text-gray-600 text-sm mt-1">Already Paid: <span className="font-semibold text-green-600">₹{selectedStudent.paid.toLocaleString()}</span></p>
                            <p className="text-gray-600 text-sm mt-1">Balance Due: <span className="font-semibold text-red-600">₹{selectedStudent.balance.toLocaleString()}</span></p>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start">
                            <AlertTriangle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-700">
                                Payment amount cannot exceed the remaining balance of ₹{selectedStudent.balance.toLocaleString()}.
                            </p>
                        </div>

                        <form onSubmit={handlePayment}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Pay (₹)</label>
                            <input
                                type="number"
                                placeholder="Enter Amount"
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-green-500 outline-none"
                                min="0.01"
                                max={selectedStudent.balance}
                                step="0.01"
                                required
                                autoFocus
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedStudent(null);
                                        setPayAmount('');
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                                >
                                    Confirm Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Fee Modal */}
            {editFeeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full border border-gray-200">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
                            <Edit2 className="w-5 h-5 mr-2 text-blue-600" />
                            Edit Total Fee
                        </h3>
                        <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
                            <p className="text-gray-600 text-sm">Student: <span className="font-semibold text-gray-900">{editFeeModal.name}</span></p>
                            <p className="text-gray-600 text-sm mt-1">PRN: <span className="font-semibold text-gray-900">{editFeeModal.prn}</span></p>
                            <p className="text-gray-600 text-sm mt-1">Current Total Fee: <span className="font-semibold text-gray-900">₹{editFeeModal.total.toLocaleString()}</span></p>
                            <p className="text-gray-600 text-sm mt-1">Paid: <span className="font-semibold text-green-600">₹{editFeeModal.paid.toLocaleString()}</span></p>
                            {editFeeModal.scholarshipAmount > 0 && (
                                <p className="text-gray-600 text-sm mt-1">Scholarship: <span className="font-semibold text-purple-600">₹{editFeeModal.scholarshipAmount.toLocaleString()}</span></p>
                            )}
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start">
                            <AlertTriangle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-700">
                                The new total fee must be greater than or equal to the already paid amount (₹{(editFeeModal.paid + editFeeModal.scholarshipAmount).toLocaleString()}).
                            </p>
                        </div>

                        <form onSubmit={handleUpdateTotalFee}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Total Fee (₹)</label>
                            <input
                                type="number"
                                placeholder="Enter New Total Fee"
                                value={newTotalFee}
                                onChange={(e) => setNewTotalFee(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
                                min={editFeeModal.paid + editFeeModal.scholarshipAmount}
                                step="0.01"
                                required
                                autoFocus
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditFeeModal(null);
                                        setNewTotalFee('');
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                                >
                                    Update Fee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Scholarship Status Modal */}
            {scholarshipModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full border border-gray-200">
                        <h3 className="text-xl font-bold mb-4 text-gray-900">Update Scholarship Status</h3>
                        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
                            <p className="text-gray-600 text-sm">Student: <span className="font-semibold text-gray-900">{scholarshipModal.name}</span></p>
                            <p className="text-gray-600 text-sm mt-1">PRN: <span className="font-semibold text-gray-900">{scholarshipModal.prn}</span></p>
                            <p className="text-gray-600 text-sm mt-1">Current Status: <span className={`font-semibold ${(scholarshipConfig[scholarshipModal.scholarshipStatus] || scholarshipConfig.NOT_APPLIED).text}`}>{(scholarshipConfig[scholarshipModal.scholarshipStatus] || scholarshipConfig.NOT_APPLIED).label}</span></p>
                            {scholarshipModal.scholarshipAmount > 0 && (
                                <p className="text-gray-600 text-sm mt-1">Current Scholarship Amount: <span className="font-semibold text-purple-600">₹{scholarshipModal.scholarshipAmount.toLocaleString()}</span></p>
                            )}
                        </div>

                        <p className="text-sm font-medium text-gray-700 mb-3">Select New Status</p>
                        <div className="flex flex-col gap-2 mb-4">
                            <button
                                onClick={() => handleScholarshipUpdate(scholarshipModal.studentId, 'NOT_APPLIED')}
                                disabled={scholarshipModal.scholarshipStatus === 'NOT_APPLIED'}
                                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                    scholarshipModal.scholarshipStatus === 'NOT_APPLIED'
                                        ? 'bg-gray-100 text-gray-600 border-gray-300 opacity-60 cursor-not-allowed'
                                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
                                }`}
                            >
                                Not Applied
                            </button>
                            <button
                                onClick={() => handleScholarshipUpdate(scholarshipModal.studentId, 'APPLIED')}
                                disabled={scholarshipModal.scholarshipStatus === 'APPLIED'}
                                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                    scholarshipModal.scholarshipStatus === 'APPLIED'
                                        ? 'bg-blue-100 text-blue-700 border-blue-300 opacity-60 cursor-not-allowed'
                                        : 'border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                                }`}
                            >
                                Applied
                            </button>
                            <button
                                onClick={() => handleScholarshipUpdate(scholarshipModal.studentId, 'REJECTED')}
                                disabled={scholarshipModal.scholarshipStatus === 'REJECTED'}
                                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                    scholarshipModal.scholarshipStatus === 'REJECTED'
                                        ? 'bg-red-100 text-red-700 border-red-300 opacity-60 cursor-not-allowed'
                                        : 'border-gray-200 text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700'
                                }`}
                            >
                                Rejected
                            </button>
                        </div>

                        {/* Approve with Amount — separate section at the bottom */}
                        <div className="border-t border-gray-200 pt-4 mt-2">
                            <p className="text-sm font-medium text-gray-700 mb-2">Approve with Scholarship Amount</p>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="₹ Amount"
                                    value={scholarshipAmountInput}
                                    onChange={(e) => setScholarshipAmountInput(e.target.value)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                                <button
                                    onClick={() => handleScholarshipUpdate(scholarshipModal.studentId, 'APPROVED')}
                                    disabled={!scholarshipAmountInput || Number(scholarshipAmountInput) <= 0}
                                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Approve
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5">This amount will be deducted from the student's outstanding balance.</p>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => { setScholarshipModal(null); setScholarshipAmountInput(''); }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog config={confirm} onClose={() => setConfirm(null)} />
        </div>
    );
};

export default FeeManagement;