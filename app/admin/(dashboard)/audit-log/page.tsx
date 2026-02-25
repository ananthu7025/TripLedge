"use client";

import { Search, Eye, User, HardHat, UserCheck, LogIn, Snowflake, Settings } from "lucide-react";
import { useEffect, useState } from "react";

interface AuditLog {
    id: string;
    action: string;
    module: string;
    entityType: string;
    entityId: string | null;
    metadata: any;
    createdAt: string;
    user: {
        id: string;
        fullName: string;
        email: string;
    };
}

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [logs, activeFilter, searchQuery]);

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/audit-logs');
            const data = await res.json();
            setLogs(data.logs || []);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = logs;

        if (activeFilter !== "all") {
            filtered = filtered.filter(log => log.module.toLowerCase() === activeFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(log =>
                log.user.fullName.toLowerCase().includes(query) ||
                log.action.toLowerCase().includes(query) ||
                (log.entityId?.toLowerCase() ?? '').includes(query)
            );
        }

        setFilteredLogs(filtered);
    };

    const counts = {
        all: logs.length,
        zones: logs.filter(l => l.module === 'zones').length,
        attendance: logs.filter(l => l.module === 'attendance').length,
        users: logs.filter(l => l.module === 'users').length,
        settings: logs.filter(l => l.module === 'settings').length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading audit logs...</div>
            </div>
        );
    }

    return (
        <>
            <div>
                <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
                <p className="text-sm text-muted-foreground">Complete activity trail across all modules</p>
            </div>

            {/* Tabs and Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="inline-flex h-9 items-center justify-center rounded-lg bg-secondary p-1 text-muted-foreground">
                    <TabButton label="All" count={counts.all} active={activeFilter === "all"} onClick={() => setActiveFilter("all")} />
                    <TabButton label="Zones" count={counts.zones} active={activeFilter === "zones"} onClick={() => setActiveFilter("zones")} />
                    <TabButton label="Attendance" count={counts.attendance} active={activeFilter === "attendance"} onClick={() => setActiveFilter("attendance")} />
                    <TabButton label="Users" count={counts.users} active={activeFilter === "users"} onClick={() => setActiveFilter("users")} />
                </div>
                <div className="relative flex-1 max-w-sm ml-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        placeholder="Search actor, action, ID…"
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
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-32">Date & Time</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actor</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Module</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Action</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Entity</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-16">View</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No audit logs found
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <AuditLogRow key={log.id} log={log} />
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

function AuditLogRow({ log }: { log: AuditLog }) {
    const getModuleIcon = (module: string) => {
        switch (module.toLowerCase()) {
            case 'zones':
                return HardHat;
            case 'attendance':
                return UserCheck;
            case 'users':
                return User;
            case 'settings':
                return Settings;
            default:
                return LogIn;
        }
    };

    const getModuleColor = (module: string) => {
        switch (module.toLowerCase()) {
            case 'zones':
                return 'text-primary';
            case 'attendance':
                return 'text-warning';
            case 'users':
                return 'text-blue-500';
            case 'settings':
                return 'text-purple-500';
            default:
                return 'text-muted-foreground';
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const Icon = getModuleIcon(log.module);

    return (
        <tr className="border-b transition-colors hover:bg-muted/50">
            <td className="p-4 align-middle text-xs text-foreground">{formatDateTime(log.createdAt)}</td>
            <td className="p-4 align-middle">
                <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-foreground">{log.user.fullName}</p>
                        <p className="text-[10px] text-muted-foreground">{log.user.email}</p>
                    </div>
                </div>
            </td>
            <td className="p-4 align-middle">
                <span className="inline-flex items-center gap-1 text-xs text-foreground capitalize">
                    <Icon className={`h-3.5 w-3.5 ${getModuleColor(log.module)}`} /> {log.module}
                </span>
            </td>
            <td className="p-4 align-middle text-sm text-foreground">{log.action.replace(/_/g, ' ')}</td>
            <td className="p-4 align-middle hidden md:table-cell">
                <span className="text-xs font-mono text-muted-foreground">{log.entityType}: {log.entityId ? log.entityId.substring(0, 8) : '—'}</span>
            </td>
            <td className="p-4 align-middle">
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9 px-3">
                    <Eye className="h-4 w-4" />
                </button>
            </td>
        </tr>
    );
}
