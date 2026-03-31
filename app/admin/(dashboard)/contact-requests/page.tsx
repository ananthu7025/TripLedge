"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";

interface ContactRequest {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    propertyType: string;
    serviceNeeded: string;
    message: string | null;
    createdAt: string;
}

export default function ContactRequestsPage() {
    const [requests, setRequests] = useState<ContactRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/contact")
            .then((res) => res.json())
            .then((data) => setRequests(data.requests || []))
            .catch((err) => console.error("Error fetching contact requests:", err))
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading contact requests...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Contact Requests</h1>
                <p className="text-sm text-muted-foreground">
                    Submissions from the public contact form ({requests.length} total)
                </p>
            </div>

            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-slate-900 border-collapse">
                        <thead>
                            <tr className="border-b bg-slate-50/80">
                                <th className="h-14 px-6 text-left align-middle font-bold text-slate-500 uppercase text-[11px] tracking-wider">Name</th>
                                <th className="h-14 px-6 text-left align-middle font-bold text-slate-500 uppercase text-[11px] tracking-wider">Contact</th>
                                <th className="h-14 px-6 text-left align-middle font-bold text-slate-500 uppercase text-[11px] tracking-wider hidden md:table-cell">Property Type</th>
                                <th className="h-14 px-6 text-left align-middle font-bold text-slate-500 uppercase text-[11px] tracking-wider hidden lg:table-cell">Service Needed</th>
                                <th className="h-14 px-6 text-left align-middle font-bold text-slate-500 uppercase text-[11px] tracking-wider hidden xl:table-cell">Message</th>
                                <th className="h-14 px-6 text-left align-middle font-bold text-slate-500 uppercase text-[11px] tracking-wider">Submitted</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-slate-400 h-64">
                                        <div className="flex flex-col items-center gap-2">
                                            <Mail className="h-8 w-8 text-slate-300" />
                                            <span>No contact requests yet</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id} className="border-b transition-colors hover:bg-slate-50/50">
                                        <td className="px-6 py-5 align-middle">
                                            <p className="text-sm font-bold text-slate-900">{req.firstName} {req.lastName}</p>
                                        </td>
                                        <td className="px-6 py-5 align-middle">
                                            <p className="text-sm text-slate-900">{req.email}</p>
                                            <p className="text-[11px] text-slate-400">{req.phone}</p>
                                        </td>
                                        <td className="px-6 py-5 align-middle hidden md:table-cell">
                                            <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-blue-50 text-blue-700">
                                                {req.propertyType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 align-middle hidden lg:table-cell text-sm text-slate-600">
                                            {req.serviceNeeded}
                                        </td>
                                        <td className="px-6 py-5 align-middle hidden xl:table-cell text-xs text-slate-500 max-w-xs">
                                            <p className="truncate">{req.message || <span className="italic text-slate-300">No message</span>}</p>
                                        </td>
                                        <td className="px-6 py-5 align-middle text-xs text-slate-500">
                                            {formatDate(req.createdAt)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
