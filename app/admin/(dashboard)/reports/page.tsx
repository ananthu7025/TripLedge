"use client";

import { Search, Eye, Download, FileText } from "lucide-react";
import { useEffect, useState } from "react";

interface Report {
    id: string;
    reportId: string;
    title: string;
    type: string;
    dateRangeStart: string | null;
    dateRangeEnd: string | null;
    relatedId: string | null;
    status: string;
    fileUrl: string | null;
    generatedAt: string | null;
    generatedByUser: {
        id: string;
        fullName: string;
        email: string;
    };
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [reports, activeFilter, searchQuery]);

    const fetchReports = async () => {
        try {
            const res = await fetch('/api/reports');
            const data = await res.json();
            setReports(data.reports || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = reports;

        if (activeFilter !== "all") {
            filtered = filtered.filter(r => r.type.toLowerCase() === activeFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(r =>
                r.title.toLowerCase().includes(query) ||
                r.reportId.toLowerCase().includes(query)
            );
        }

        setFilteredReports(filtered);
    };

    const counts = {
        all: reports.length,
        trip: reports.filter(r => r.type.toLowerCase() === 'trip').length,
        snow: reports.filter(r => r.type.toLowerCase() === 'snow').length,
        attendance: reports.filter(r => r.type.toLowerCase() === 'attendance').length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading reports...</div>
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Report</h1>
                    <p className="text-sm text-muted-foreground">View and download completed reports</p>
                </div>
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2">
                    <FileText className="h-4 w-4" /> Generate Report
                </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="inline-flex h-9 items-center justify-center rounded-lg bg-secondary p-1 text-muted-foreground">
                    <TabButton label="All" count={counts.all} active={activeFilter === "all"} onClick={() => setActiveFilter("all")} />
                    <TabButton label="Trip" count={counts.trip} active={activeFilter === "trip"} onClick={() => setActiveFilter("trip")} />
                    <TabButton label="Snow" count={counts.snow} active={activeFilter === "snow"} onClick={() => setActiveFilter("snow")} />
                    <TabButton label="Attendance" count={counts.attendance} active={activeFilter === "attendance"} onClick={() => setActiveFilter("attendance")} />
                </div>
                <div className="relative flex-1 max-w-sm ml-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        placeholder="Search reports…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-24">Report ID</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Date Range</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Related</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden lg:table-cell">Generated</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-28">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {filteredReports.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                                        No reports found
                                    </td>
                                </tr>
                            ) : (
                                filteredReports.map((report) => (
                                    <ReportTableRow key={report.id} report={report} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

function TabButton({ label, count, active = false, onClick }: { label: string, count?: number, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all ${active ? "bg-background text-foreground shadow" : "hover:bg-background/50 hover:text-foreground"}`}
        >
            {label} {count !== undefined && `(${count})`}
        </button>
    );
}

function ReportTableRow({ report }: { report: Report }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ready':
                return 'bg-success/10 text-success border-success/20';
            case 'generating':
                return 'bg-warning/10 text-warning border-warning/20';
            default:
                return 'bg-muted text-muted-foreground border-muted';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'trip':
                return 'bg-primary/10 text-primary border-primary/20';
            case 'snow':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'attendance':
                return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            default:
                return 'bg-muted text-muted-foreground border-muted';
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const dateRange = report.dateRangeStart && report.dateRangeEnd
        ? `${formatDate(report.dateRangeStart)} - ${formatDate(report.dateRangeEnd)}`
        : report.dateRangeStart
            ? formatDate(report.dateRangeStart)
            : '—';

    return (
        <tr className="border-b transition-colors hover:bg-muted/50">
            <td className="p-4 align-middle font-mono text-xs text-foreground font-bold text-primary">{report.reportId}</td>
            <td className="p-4 align-middle">
                <p className="text-sm font-medium text-foreground">{report.title}</p>
                <p className="text-[11px] text-muted-foreground">{report.generatedByUser.fullName}</p>
            </td>
            <td className="p-4 align-middle">
                <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${getTypeColor(report.type)}`}>
                    {report.type}
                </div>
            </td>
            <td className="p-4 align-middle hidden md:table-cell text-xs text-muted-foreground">{dateRange}</td>
            <td className="p-4 align-middle hidden md:table-cell font-mono text-xs text-foreground">{report.relatedId || '—'}</td>
            <td className="p-4 align-middle">
                <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase ${getStatusColor(report.status)}`}>
                    {report.status}
                </div>
            </td>
            <td className="p-4 align-middle hidden lg:table-cell text-xs text-muted-foreground">{formatDate(report.generatedAt)}</td>
            <td className="p-4 align-middle">
                <div className="flex gap-1">
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9 px-3">
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        disabled={report.status !== 'ready'}
                        className={`inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 ${report.status === 'ready' ? 'hover:bg-accent hover:text-accent-foreground' : 'opacity-50 cursor-not-allowed'}`}
                    >
                        <Download className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}
