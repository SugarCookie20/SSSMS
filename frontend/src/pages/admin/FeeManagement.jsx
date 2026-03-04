import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import {
    Banknote, CheckCircle, AlertCircle, Search, XCircle,
    Bell, Trash2, Plus, AlertTriangle, Users
} from 'lucide-react';

const FeeManagement = () => {
    const [records, setRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Payment Modal State
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [payAmount, setPayAmount] = useState('');

    // Toast Status State
    const [status, setStatus] = useState({ type: '', message: '' });

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
        try {
            await api.post('/admin/fees/pay', {
                studentId: selectedStudent.studentId,
                amount: parseFloat(payAmount)
            });
            setStatus({ type: 'success', message: 'Payment Recorded Successfully!' });
            setSelectedStudent(null);
            setPayAmount('');
            fetchFees();
            fetchPendingStats();
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch {
            setStatus({ type: 'error', message: 'Failed to record payment. Please try again.' });
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

    const handleDeleteReminder = async (id) => {
        if (!window.confirm('Delete this reminder?')) return;
        try {
            await api.delete(`/admin/fees/reminders/${id}`);
            fetchReminders();
            setStatus({ type: 'success', message: 'Reminder deleted.' });
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch {
            setStatus({ type: 'error', message: 'Failed to delete reminder.' });
        }
    };

    const filteredRecords = records.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.prn.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto">
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
                            <th className="p-4 font-semibold text-gray-600">Balance</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-gray-600">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {filteredRecords.map((record) => (
                            <tr key={record.studentId} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-medium text-gray-900">{record.name}</td>
                                <td className="p-4 text-gray-500 font-mono text-sm">{record.prn}</td>
                                <td className="p-4 text-gray-900">₹{record.total.toLocaleString()}</td>
                                <td className="p-4 text-green-600">₹{record.paid.toLocaleString()}</td>
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
                                    {record.status !== 'PAID' && (
                                        <button
                                            onClick={() => setSelectedStudent(record)}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                                        >
                                            Record Pay
                                        </button>
                                    )}
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
                            <p className="text-gray-600 text-sm mt-1">Balance Due: <span className="font-semibold text-red-600">₹{selectedStudent.balance.toLocaleString()}</span></p>
                        </div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Pay</label>
                        <input
                            type="number"
                            placeholder="Enter Amount"
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-green-500 outline-none"
                            autoFocus
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePayment}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                            >
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeeManagement;