"use client";

import { Search, AlertTriangle, Download, Wifi, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

interface AttendanceRecord {
    id: string;
    date: string;
    checkInTime: string;
    checkOutTime: string | null;
    method: string;
    latitude: string | null;
    longitude: string | null;
    status: string;
    wifiConfigName: string | null;
    user: {
        id: string;
        fullName: string;
        email: string;
    };
}

export default function AttendancePage() {
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [methodFilter, setMethodFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchAttendance();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [attendanceRecords, searchQuery, methodFilter, statusFilter]);

    const fetchAttendance = async () => {
        try {
            const res = await fetch('/api/attendance');
            const data = await res.json();
            setAttendanceRecords(data.attendance || []);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = attendanceRecords;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(r =>
                r.user.fullName.toLowerCase().includes(query) ||
                r.date.includes(query)
            );
        }

        if (methodFilter !== "all") {
            filtered = filtered.filter(r => r.method === methodFilter);
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter(r => r.status === statusFilter);
        }

        setFilteredRecords(filtered);
    };

    const exportToCSV = () => {
        const headers = ['Date', 'User', 'Check-In', 'Check-Out', 'Method', 'Location', 'Status'];
        const rows = filteredRecords.map(record => [
            record.date,
            record.user.fullName,
            record.checkInTime,
            record.checkOutTime || '—',
            record.method,
            record.wifiConfigName || (record.latitude && record.longitude
                ? `${parseFloat(record.latitude).toFixed(4)}, ${parseFloat(record.longitude).toFixed(4)}`
                : 'N/A'),
            record.status,
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const stats = {
        total: attendanceRecords.length,
        present: attendanceRecords.filter(r => r.status === 'present').length,
        wifiCheckins: attendanceRecords.filter(r => r.method === 'wifi').length,
        requestCheckins: attendanceRecords.filter(r => r.method === 'request').length,
        missingCheckouts: attendanceRecords.filter(r => !r.checkOutTime &&
            new Date().getTime() - new Date(r.date + ' ' + r.checkInTime).getTime() > 24 * 60 * 60 * 1000
        ).length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading attendance records...</div>
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
                    <p className="text-sm text-muted-foreground">Track check-ins and check-outs</p>
                </div>
                <button
                    onClick={exportToCSV}
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-9 text-sm font-medium hover:bg-accent gap-2 shadow-sm transition-all"
                >
                    <Download className="h-4 w-4" /> Export CSV
                </button>
            </div>

            {/* Warning Banner */}
            {stats.missingCheckouts > 0 && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                    <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-red-900">{stats.missingCheckouts} missing checkout{stats.missingCheckouts > 1 ? 's' : ''}</p>
                        <p className="text-xs text-red-700">Users checked in but haven't checked out within 24 hours.</p>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard label="Total Records" value={stats.total.toString()} />
                <SummaryCard label="Present" value={stats.present.toString()} valueColor="text-success" />
                <SummaryCard label="WiFi Check-ins" value={stats.wifiCheckins.toString()} valueColor="text-warning" />
                <SummaryCard label="Request Check-ins" value={stats.requestCheckins.toString()} valueColor="text-warning" />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        placeholder="Search user or date…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10 w-full rounded-lg bg-background border border-input text-sm focus:ring-1 focus:ring-primary outline-none shadow-sm"
                    />
                </div>
                <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:ring-1 focus:ring-primary outline-none shadow-sm min-w-[140px]"
                >
                    <option value="all">All Methods</option>
                    <option value="wifi">WiFi</option>
                    <option value="request">Request</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:ring-1 focus:ring-primary outline-none shadow-sm min-w-[140px]"
                >
                    <option value="all">All Statuses</option>
                    <option value="present">Present</option>
                    <option value="checked_out">Checked Out</option>
                </select>
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b bg-muted/50">
                            <tr className="border-b transition-colors hover:bg-muted/50">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Check-In</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Check-Out</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Method</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Location</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                        No attendance records found
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <AttendanceRow key={record.id} record={record} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

function SummaryCard({ label, value, valueColor = "text-foreground" }: { label: string, value: string, valueColor?: string }) {
    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-all border-orange-50/50">
            <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight mt-1">{label}</p>
        </div>
    );
}

function AttendanceRow({ record }: { record: AttendanceRecord }) {
    const isWiFi = record.method === "wifi";
    const location = record.wifiConfigName || (record.latitude && record.longitude
        ? `${parseFloat(record.latitude).toFixed(4)}, ${parseFloat(record.longitude).toFixed(4)}`
        : 'N/A');

    return (
        <tr className="border-b transition-colors hover:bg-muted/50 group">
            <td className="p-4 align-middle text-foreground font-medium">{record.date}</td>
            <td className="p-4 align-middle">
                <p className="text-sm font-medium text-foreground">{record.user.fullName}</p>
                <p className="text-[11px] text-muted-foreground">{record.user.email}</p>
            </td>
            <td className="p-4 align-middle text-foreground font-mono text-xs">{record.checkInTime}</td>
            <td className="p-4 align-middle text-foreground font-mono text-xs">{record.checkOutTime || '—'}</td>
            <td className="p-4 align-middle">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {isWiFi ? <Wifi className="h-3 w-3 text-warning" /> : <Smartphone className="h-3 w-3 text-warning" />}
                    {record.method.charAt(0).toUpperCase() + record.method.slice(1)}
                </span>
            </td>
            <td className="p-4 align-middle text-xs text-muted-foreground">{location}</td>
            <td className="p-4 align-middle">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    record.status === 'present' ? "bg-success/10 text-success border border-success/20" : "bg-muted text-muted-foreground"
                }`}>
                    {record.status}
                </span>
            </td>
        </tr>
    );
}
