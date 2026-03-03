
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import {
    ScrollText, Filter, ChevronLeft, ChevronRight, AlertTriangle,
    RefreshCw, Search, X, Clock, User, Shield, Activity
} from 'lucide-react';

const ACTION_COLORS = {
    LOGIN: 'bg-green-100 text-green-700',
    LOGOUT: 'bg-gray-100 text-gray-700',
    REGISTER: 'bg-blue-100 text-blue-700',
    STUDENT_ENROLLED: 'bg-emerald-100 text-emerald-700',
    STUDENT_UPDATED: 'bg-yellow-100 text-yellow-700',
    STUDENT_DELETED: 'bg-red-100 text-red-700',
    FACULTY_ENROLLED: 'bg-emerald-100 text-emerald-700',
    FACULTY_DELETED: 'bg-red-100 text-red-700',
    ATTENDANCE_MARKED: 'bg-indigo-100 text-indigo-700',
    ASSESSMENT_CREATED: 'bg-purple-100 text-purple-700',
    NOTICE_CREATED: 'bg-cyan-100 text-cyan-700',
    FEE_PAYMENT_RECORDED: 'bg-green-100 text-green-700',
    ERROR: 'bg-red-100 text-red-800',
    DATA_VIEWED: 'bg-slate-100 text-slate-600',
};

const ROLE_OPTIONS = [
    { value: '', label: 'All Roles' },
    { value: 'ROLE_ADMIN', label: 'Admin' },
    { value: 'ROLE_FACULTY', label: 'Faculty' },
    { value: 'ROLE_STUDENT', label: 'Student' },
];

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 15;

    // Filter state
    const [actionFilter, setActionFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [emailFilter, setEmailFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Available actions from backend
    const [actionOptions, setActionOptions] = useState([]);

    // Stats
    const [stats, setStats] = useState(null);

    // Expanded row
    const [expandedRow, setExpandedRow] = useState(null);

    // Fetch available action types
    useEffect(() => {
        const fetchActions = async () => {
            try {
                const res = await api.get('/admin/logs/actions');
                setActionOptions(res.data);
            } catch (e) {
                console.error('Failed to fetch log actions');
            }
        };
        fetchActions();
    }, []);

    // Fetch stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/logs/stats');
                setStats(res.data);
            } catch (e) {
                console.error('Failed to fetch log stats');
            }
        };
        fetchStats();
    }, []);

    // Fetch logs
    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('size', pageSize);
            if (actionFilter) params.append('action', actionFilter);
            if (roleFilter) params.append('userRole', roleFilter);
            if (emailFilter) params.append('userEmail', emailFilter);
            if (startDate) params.append('startDate', startDate + 'T00:00:00');
            if (endDate) params.append('endDate', endDate + 'T23:59:59');

            const res = await api.get(`/admin/logs/filter?${params.toString()}`);
            setLogs(res.data.content);
            setTotalPages(res.data.totalPages);
            setTotalElements(res.data.totalElements);
        } catch (e) {
            console.error('Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    }, [page, actionFilter, roleFilter, emailFilter, startDate, endDate]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const clearFilters = () => {
        setActionFilter('');
        setRoleFilter('');
        setEmailFilter('');
        setStartDate('');
        setEndDate('');
        setPage(0);
    };

    const hasActiveFilters = actionFilter || roleFilter || emailFilter || startDate || endDate;

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        const d = new Date(timestamp);
        return d.toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '-';
        const d = new Date(timestamp);
        return d.toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        });
    };

    const getActionBadge = (action) => {
        const color = ACTION_COLORS[action] || 'bg-gray-100 text-gray-600';
        const label = action ? action.replace(/_/g, ' ') : 'UNKNOWN';
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
                {label}
            </span>
        );
    };

    const getRoleBadge = (role) => {
        if (!role) return <span className="text-gray-400 text-xs">-</span>;
        const clean = role.replace('ROLE_', '');
        const colors = {
            ADMIN: 'bg-purple-100 text-purple-700',
            FACULTY: 'bg-blue-100 text-blue-700',
            STUDENT: 'bg-amber-100 text-amber-700',
        };
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[clean] || 'bg-gray-100 text-gray-600'}`}>
                {clean}
            </span>
        );
    };

    return (
        <div className="max-w-full mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ScrollText className="w-8 h-8 text-blue-600" />
                        Activity Logs
                    </h1>
                    <p className="text-gray-600 mt-1">Track every event, change, and error across the portal.</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg"><Activity className="w-5 h-5 text-blue-600" /></div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Total Events</p>
                                <p className="text-xl font-bold text-gray-900">{stats.totalLogs?.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Errors</p>
                                <p className="text-xl font-bold text-gray-900">{stats.totalErrors?.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-lg"><User className="w-5 h-5 text-green-600" /></div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Filtered Results</p>
                                <p className="text-xl font-bold text-gray-900">{totalElements.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 rounded-lg"><Shield className="w-5 h-5 text-purple-600" /></div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Action Types</p>
                                <p className="text-xl font-bold text-gray-900">{actionOptions.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Toggle */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-500" />
                        <span className="font-semibold text-gray-700">Filters</span>
                        {hasActiveFilters && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Active</span>
                        )}
                    </div>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {showFilters && (
                    <div className="px-6 pb-5 border-t border-gray-100 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Action Type */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Action Type</label>
                                <select
                                    value={actionFilter}
                                    onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="">All Actions</option>
                                    {actionOptions.map(a => (
                                        <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Role</label>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    {ROLE_OPTIONS.map(r => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* User Email */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">User Email</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={emailFilter}
                                        onChange={(e) => { setEmailFilter(e.target.value); setPage(0); }}
                                        placeholder="Search by email..."
                                        className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Start Date */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">From Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">To Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            {/* Clear Button */}
                            <div className="flex items-end">
                                <button
                                    onClick={clearFilters}
                                    disabled={!hasActiveFilters}
                                    className="w-full flex items-center justify-center gap-2 p-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                        <span className="ml-3 text-gray-500 font-medium">Loading logs...</span>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <ScrollText className="w-12 h-12 mb-3" />
                        <p className="text-sm mt-1">Try adjusting your filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Timestamp</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Action</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Description</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">User</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Role</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Method</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Endpoint</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.map((log) => (
                                    <React.Fragment key={log.id}>
                                        <tr
                                            onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${log.action === 'ERROR' ? 'bg-red-50/40' : ''}`}
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-gray-700">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                    <div>
                                                        <div className="text-xs font-medium">{formatDate(log.timestamp)}</div>
                                                        <div className="text-xs text-gray-400">{formatTime(log.timestamp)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{getActionBadge(log.action)}</td>
                                            <td className="px-4 py-3 text-gray-700 max-w-xs truncate" title={log.description}>{log.description}</td>
                                            <td className="px-4 py-3 text-gray-600 text-xs font-mono max-w-[180px] truncate" title={log.userEmail}>{log.userEmail || '-'}</td>
                                            <td className="px-4 py-3">{getRoleBadge(log.userRole)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                                                    log.httpMethod === 'GET' ? 'bg-blue-50 text-blue-600' :
                                                    log.httpMethod === 'POST' ? 'bg-green-50 text-green-600' :
                                                    log.httpMethod === 'PUT' ? 'bg-yellow-50 text-yellow-600' :
                                                    log.httpMethod === 'DELETE' ? 'bg-red-50 text-red-600' :
                                                    'bg-gray-50 text-gray-600'
                                                }`}>
                                                    {log.httpMethod}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs font-mono max-w-[200px] truncate" title={log.endpoint}>{log.endpoint}</td>
                                        </tr>

                                        {/* Expanded Detail Row */}
                                        {expandedRow === log.id && (
                                            <tr className="bg-gray-50">
                                                <td colSpan={7} className="px-6 py-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-xs font-semibold text-gray-400 uppercase">Log ID</span>
                                                            <p className="text-gray-700 font-mono">#{log.id}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-semibold text-gray-400 uppercase">IP Address</span>
                                                            <p className="text-gray-700 font-mono">{log.ipAddress || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-semibold text-gray-400 uppercase">HTTP Status</span>
                                                            <p className="text-gray-700 font-mono">{log.httpStatus || '-'}</p>
                                                        </div>
                                                        {log.errorMessage && (
                                                            <div className="md:col-span-2 lg:col-span-3">
                                                                <span className="text-xs font-semibold text-red-500 uppercase">Error Message</span>
                                                                <p className="text-red-700 bg-red-50 p-3 rounded-lg mt-1 font-mono text-xs break-all">{log.errorMessage}</p>
                                                            </div>
                                                        )}
                                                        {log.details && (
                                                            <div className="md:col-span-2 lg:col-span-3">
                                                                <span className="text-xs font-semibold text-gray-400 uppercase">Details</span>
                                                                <p className="text-gray-600 bg-gray-100 p-3 rounded-lg mt-1 text-xs break-all">{log.details}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-semibold">{page * pageSize + 1}</span> to{' '}
                            <span className="font-semibold">{Math.min((page + 1) * pageSize, totalElements)}</span> of{' '}
                            <span className="font-semibold">{totalElements.toLocaleString()}</span> logs
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" /> Prev
                            </button>
                            <span className="px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg">
                                {page + 1} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogs;

