"use client";

import { Search, Eye, Download, FileText, X, Loader2 } from "lucide-react";
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
    const [showModal, setShowModal] = useState(false);

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
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
                >
                    <FileText className="h-4 w-4" /> Generate Report
                </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="inline-flex h-9 items-center justify-center rounded-lg bg-secondary p-1 text-muted-foreground">
                    <TabButton label="All"        count={counts.all}        active={activeFilter === "all"}        onClick={() => setActiveFilter("all")} />
                    <TabButton label="Trip"       count={counts.trip}       active={activeFilter === "trip"}       onClick={() => setActiveFilter("trip")} />
                    <TabButton label="Snow"       count={counts.snow}       active={activeFilter === "snow"}       onClick={() => setActiveFilter("snow")} />
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
                                    <ReportTableRow key={report.id} report={report} onRefresh={fetchReports} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <GenerateReportModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchReports();
                    }}
                />
            )}
        </>
    );
}

// ------------------------------------------------------------------
// Generate Report Modal
// ------------------------------------------------------------------
function GenerateReportModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('trip');
    const [dateRangeStart, setDateRangeStart] = useState('');
    const [dateRangeEnd, setDateRangeEnd] = useState('');
    const [relatedId, setRelatedId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) { setError('Title is required.'); return; }
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    type,
                    dateRangeStart: dateRangeStart || null,
                    dateRangeEnd: dateRangeEnd || null,
                    relatedId: relatedId.trim() || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Failed to generate report.'); return; }
            onSuccess();
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-background rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-foreground">Generate Report</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Weekly Trip Report"
                            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Type *</label>
                        <select
                            value={type}
                            onChange={e => setType(e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                            <option value="trip">Trip Inspection</option>
                            <option value="snow">Snow Removal</option>
                            <option value="attendance">Attendance</option>
                        </select>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-foreground mb-1">From</label>
                            <input
                                type="date"
                                value={dateRangeStart}
                                onChange={e => setDateRangeStart(e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-foreground mb-1">To</label>
                            <input
                                type="date"
                                value={dateRangeEnd}
                                onChange={e => setDateRangeEnd(e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Related ID <span className="text-muted-foreground font-normal">(optional)</span></label>
                        <input
                            value={relatedId}
                            onChange={e => setRelatedId(e.target.value)}
                            placeholder="e.g. T-003 or S-001"
                            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-9 rounded-md border border-input text-sm font-medium hover:bg-muted"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                        >
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {submitting ? 'Generating…' : 'Generate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function TabButton({ label, count, active = false, onClick }: { label: string; count?: number; active?: boolean; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all ${active ? "bg-background text-foreground shadow" : "hover:bg-background/50 hover:text-foreground"}`}
        >
            {label} {count !== undefined && `(${count})`}
        </button>
    );
}

function ReportTableRow({ report, onRefresh }: { report: Report; onRefresh: () => void }) {
    const [downloading, setDownloading] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ready':      return 'bg-success/10 text-success border-success/20';
            case 'generating': return 'bg-warning/10 text-warning border-warning/20';
            default:           return 'bg-muted text-muted-foreground border-muted';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'trip':       return 'bg-primary/10 text-primary border-primary/20';
            case 'snow':       return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'attendance': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            default:           return 'bg-muted text-muted-foreground border-muted';
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const dateRange = report.dateRangeStart && report.dateRangeEnd
        ? `${formatDate(report.dateRangeStart)} – ${formatDate(report.dateRangeEnd)}`
        : report.dateRangeStart ? formatDate(report.dateRangeStart) : '—';

    const handleDownload = async () => {
        if (!report.fileUrl || downloading) return;
        const url = report.fileUrl.startsWith('http')
            ? report.fileUrl
            : `${window.location.origin}${report.fileUrl}`;
        setDownloading(true);
        try {
            const res = await fetch(url);
            const embedded = res.headers.get('X-Images-Embedded');
            console.log(`[report] X-Images-Embedded: ${embedded}`);
            if (!res.ok) throw new Error(`Server error ${res.status}`);
            const blob = await res.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${report.reportId}.xlsx`;
            a.click();
            URL.revokeObjectURL(a.href);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Download failed. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const handleView = handleDownload;

    return (
        <tr className="border-b transition-colors hover:bg-muted/50">
            <td className="p-4 align-middle font-mono text-xs font-bold text-primary">{report.reportId}</td>
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
                    <button
                        onClick={handleView}
                        disabled={report.status !== 'ready' || !report.fileUrl}
                        title="View report"
                        className={`inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 ${report.status === 'ready' && report.fileUrl ? 'hover:bg-accent hover:text-accent-foreground' : 'opacity-40 cursor-not-allowed'}`}
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={report.status !== 'ready' || !report.fileUrl || downloading}
                        title="Download report"
                        className={`inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 ${report.status === 'ready' && report.fileUrl && !downloading ? 'hover:bg-accent hover:text-accent-foreground' : 'opacity-40 cursor-not-allowed'}`}
                    >
                        {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    </button>
                </div>
            </td>
        </tr>
    );
}
