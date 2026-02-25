"use client";

import { Eye, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { cn } from "@/app/utils/utils";

interface CheckInRequest {
    id: string;
    requestId: string;
    requestedAt: string;
    latitude: string;
    longitude: string;
    status: string;
    reviewedAt: string | null;
    user: {
        id: string;
        fullName: string;
        email: string;
    };
    reviewedByUser?: {
        id: string;
        fullName: string;
    } | null;
}

export default function CheckInRequestsPage() {
    const [requests, setRequests] = useState<CheckInRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<CheckInRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("pending");

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [requests, activeFilter]);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/checkin-requests');
            const data = await res.json();
            setRequests(data.requests || []);
        } catch (error) {
            console.error('Error fetching check-in requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = requests;

        if (activeFilter !== "all") {
            filtered = filtered.filter(r => r.status === activeFilter);
        }

        setFilteredRequests(filtered);
    };

    const handleAction = async (requestId: string, action: 'approved' | 'rejected') => {
        try {
            const res = await fetch('/api/checkin-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, action }),
            });

            if (res.ok) {
                await fetchRequests();
            } else {
                console.error('Failed to process request');
            }
        } catch (error) {
            console.error('Error processing check-in request:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-warning/10 text-warning border-warning/20';
            case 'approved':
                return 'bg-success/10 text-success border-success/20';
            case 'rejected':
                return 'bg-destructive/10 text-destructive border-destructive/20';
            default:
                return 'bg-muted text-muted-foreground border-muted';
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

    const counts = {
        all: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
    };

    const tabs = [
        { label: "Pending", value: "pending", count: counts.pending },
        { label: "Approved", value: "approved", count: counts.approved },
        { label: "Rejected", value: "rejected", count: counts.rejected },
        { label: "All", value: "all", count: counts.all },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading check-in requests...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Check-In Requests</h1>
                <p className="text-sm text-muted-foreground">Approve or reject offsite login requests</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Tabs tabs={tabs} activeValue={activeFilter} onChange={setActiveFilter} />
            </div>

            {/* Table */}
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-slate-900 border-collapse">
                            <thead>
                                <tr className="border-b bg-slate-50/80 transition-colors">
                                    <th className="h-14 px-6 text-left align-middle font-bold text-slate-500 uppercase text-[11px] tracking-wider w-24">Request ID</th>
                                    <th className="h-14 px-6 text-left align-middle font-bold text-slate-500 uppercase text-[11px] tracking-wider">User</th>
                                    <th className="h-14 px-6 text-left align-middle font-bold text-slate-500 uppercase text-[11px] tracking-wider">Date & Time</th>
                                    <th className="h-14 px-6 text-left align-middle font-bold text-slate-500 uppercase text-[11px] tracking-wider hidden md:table-cell">Coordinates</th>
                                    <th className="h-14 px-6 text-left align-middle font-bold text-slate-500 uppercase text-[11px] tracking-wider">Status</th>
                                    <th className="h-14 px-6 text-right align-middle font-bold text-slate-500 uppercase text-[11px] tracking-wider w-32 pr-8">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-10 text-center text-slate-400 h-64">
                                            No check-in requests found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((request) => (
                                        <tr key={request.id} className="border-b transition-colors hover:bg-slate-50/50">
                                            <td className="px-6 py-5 align-middle font-mono text-[10px] font-bold text-slate-400">{request.requestId}</td>
                                            <td className="px-6 py-5 align-middle">
                                                <p className="text-sm font-bold text-slate-900">{request.user.fullName}</p>
                                                <p className="text-[11px] font-medium text-slate-400">{request.user.email}</p>
                                            </td>
                                            <td className="px-6 py-5 align-middle text-xs font-medium text-slate-600">{formatDateTime(request.requestedAt)}</td>
                                            <td className="px-6 py-5 align-middle hidden md:table-cell text-[11px] font-mono text-slate-400">
                                                {parseFloat(request.latitude).toFixed(4)}, {parseFloat(request.longitude).toFixed(4)}
                                            </td>
                                            <td className="px-6 py-5 align-middle">
                                                <div className={cn(
                                                    "inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-bold min-w-[100px] justify-center tracking-wide",
                                                    request.status === 'pending' && "bg-orange-100 text-orange-600",
                                                    request.status === 'approved' && "bg-emerald-100 text-emerald-600",
                                                    request.status === 'rejected' && "bg-rose-100 text-rose-600"
                                                )}>
                                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 align-middle text-right pr-6">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button className="inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-900 h-9 w-9 transition-colors">
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                    {request.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleAction(request.id, 'approved')}
                                                                className="inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white h-9 w-9 transition-colors"
                                                            >
                                                                <CheckCircle className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction(request.id, 'rejected')}
                                                                className="inline-flex items-center justify-center rounded-full bg-rose-100 text-rose-600 hover:bg-rose-500 hover:text-white h-9 w-9 transition-colors"
                                                            >
                                                                <XCircle className="h-5 w-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
