"use client";

import { cn } from "@/app/utils/utils";
import { useState, useMemo } from 'react';
import { Search, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { InputText } from "@/components/ui/InputText";
import { type TripInspection, type TripInspectionStatus } from "@/app/utils/schemas/trip-inspection.schema";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/Table";


interface TripInspectionClientProps {
    initialTrips: TripInspection[];
}

export function TripInspectionClient({ initialTrips }: TripInspectionClientProps) {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState<TripInspectionStatus | 'all'>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTrips = useMemo(() => {
        let filtered = initialTrips;

        if (activeFilter !== "all") {
            filtered = filtered.filter(t => t.status === activeFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.tripId.toLowerCase().includes(query) ||
                t.streetName?.toLowerCase().includes(query) ||
                t.houseNo?.toLowerCase().includes(query) ||
                t.zone.name.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [initialTrips, activeFilter, searchQuery]);

    const counts = useMemo(() => ({
        all: initialTrips.length,
        pending: initialTrips.filter(t => t.status === 'pending').length,
        inspected: initialTrips.filter(t => t.status === 'inspected').length,
        completed: initialTrips.filter(t => t.status === 'completed').length,
    }), [initialTrips]);

    const tabs = [
        { label: "All", value: "all" },
        { label: "Inspected", value: "inspected" },
        { label: "Completed", value: "completed" },
    ];

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    };

    const parseUserCount = (json: string | null | undefined) => {
        if (!json) return '—';
        try {
            const arr = JSON.parse(json);
            return Array.isArray(arr) && arr.length > 0 ? `${arr.length} user${arr.length !== 1 ? 's' : ''}` : '—';
        } catch { return '—'; }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Trip Inspection & Grinding</h1>
                <p className="text-sm text-muted-foreground">Manage all trip inspections</p>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <Tabs tabs={tabs} activeValue={activeFilter} onChange={(val) => setActiveFilter(val as any)} />

                <div className="w-full lg:max-w-md flex-shrink-0">
                    <InputText
                        variant="pill"
                        icon={Search}
                        placeholder="Search street, house no, ID…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-none shadow-none"
                    />
                </div>
            </div>

            <div className="rounded-2xl border bg-white text-card-foreground shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/80">
                        <TableRow className="hover:bg-transparent border-b">
                            <TableHead className="w-24 px-6 h-14 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Trip ID</TableHead>
                            <TableHead className="px-6 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Location</TableHead>
                            <TableHead className="hidden md:table-cell px-6 font-bold text-slate-500 uppercase text-[11px] tracking-wider text-center">Zone</TableHead>
                            <TableHead className="px-6 font-bold text-slate-500 uppercase text-[11px] tracking-wider text-center">Status</TableHead>
                            <TableHead className="hidden lg:table-cell px-6 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Inspected</TableHead>
                            <TableHead className="hidden lg:table-cell px-6 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Completed</TableHead>
                            <TableHead className="hidden xl:table-cell px-6 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Insp. User</TableHead>
                            <TableHead className="hidden xl:table-cell px-6 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Comp. User</TableHead>
                            <TableHead className="w-20 text-right pr-8 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTrips.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-64 text-center text-slate-400">
                                    No trip inspections found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTrips.map((trip) => (
                                <TableRow key={trip.id} className="hover:bg-slate-50/50 transition-colors border-b">
                                    <TableCell className="px-6 py-5 font-mono text-[10px] font-bold text-slate-400">
                                        {trip.tripId}
                                    </TableCell>
                                    <TableCell className="px-6 py-5">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold text-slate-900">{trip.streetName || 'N/A'}</p>
                                            <p className="text-[11px] font-medium text-slate-400">{trip.houseNo || 'N/A'}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell px-6 py-5">
                                        <div className="flex justify-center">
                                            <Badge variant="outline" className="font-bold text-[10px] px-4 py-1 rounded-full border-slate-200 bg-white text-slate-500">
                                                {trip.zone.name}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-5">
                                        <div className="flex justify-center">
                                            <Badge
                                                className={cn(
                                                    "text-[11px] font-bold px-5 py-1.5 rounded-full border-0 min-w-[100px] justify-center tracking-wide",
                                                    trip.status === 'pending' && "bg-orange-100 text-orange-600",
                                                    trip.status === 'inspected' && "bg-orange-500 text-white shadow-lg shadow-orange-500/20",
                                                    trip.status === 'completed' && "bg-emerald-100 text-emerald-600"
                                                )}
                                            >
                                                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell px-6 py-5 text-xs font-medium text-slate-400">
                                        {formatDate(trip.inspectedAt)}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell px-6 py-5 text-xs font-medium text-slate-400">
                                        {formatDate(trip.completedAt)}
                                    </TableCell>
                                    <TableCell className="hidden xl:table-cell px-6 py-5 text-xs font-medium text-slate-400">
                                        {parseUserCount(trip.inspectedUsers)}
                                    </TableCell>
                                    <TableCell className="hidden xl:table-cell px-6 py-5 text-xs font-medium text-slate-400">
                                        {parseUserCount(trip.completedUsers)}
                                    </TableCell>
                                    <TableCell className="text-right pr-6 py-5">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 hover:bg-slate-100 rounded-full"
                                            onClick={() => router.push(`/admin/trip-inspection/${trip.id}`)}
                                        >
                                            <Eye className="h-5 w-5 text-slate-400" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
