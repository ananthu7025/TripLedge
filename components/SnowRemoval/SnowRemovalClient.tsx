/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { cn } from "@/app/utils/utils";
import { Search, Eye } from "lucide-react";
import { useState, useMemo } from 'react';
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { InputText } from "@/components/ui/InputText";
import { type SnowRemoval, type SnowRemovalStatus } from "@/app/utils/schemas/snow-removal.schema";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/Table";


interface SnowRemovalClientProps {
    initialRemovals: SnowRemoval[];
}

export function SnowRemovalClient({ initialRemovals }: SnowRemovalClientProps) {
    const [activeFilter, setActiveFilter] = useState<SnowRemovalStatus | 'all'>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredRemovals = useMemo(() => {
        let filtered = initialRemovals;

        if (activeFilter !== "all") {
            filtered = filtered.filter(s => s.status === activeFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.snowId.toLowerCase().includes(query) ||
                s.streetName?.toLowerCase().includes(query) ||
                s.houseNo?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [initialRemovals, activeFilter, searchQuery]);

    const counts = useMemo(() => ({
        all: initialRemovals.length,
        pending: initialRemovals.filter(s => s.status === 'pending').length,
        inspected: initialRemovals.filter(s => s.status === 'inspected').length,
        completed: initialRemovals.filter(s => s.status === 'completed').length,
    }), [initialRemovals]);

    const tabs = [
        { label: "All", value: "all", count: counts.all },
        { label: "Pending", value: "pending", count: counts.pending },
        { label: "Inspected", value: "inspected", count: counts.inspected },
        { label: "Completed", value: "completed", count: counts.completed },
    ];

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Snow Removal</h1>
                <p className="text-sm text-muted-foreground">Manage all snow removal operations</p>
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
                        className="bg-slate-100"
                    />
                </div>
            </div>

            <div className="rounded-2xl border bg-white text-card-foreground shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/80">
                        <TableRow className="hover:bg-transparent border-b">
                            <TableHead className="w-24 px-6 h-14 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Snow ID</TableHead>
                            <TableHead className="px-6 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Location</TableHead>
                            <TableHead className="px-6 font-bold text-slate-500 uppercase text-[11px] tracking-wider text-center">Status</TableHead>
                            <TableHead className="hidden lg:table-cell px-6 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Created</TableHead>
                            <TableHead className="hidden lg:table-cell px-6 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Completed</TableHead>
                            <TableHead className="w-20 text-right pr-8 font-bold text-slate-500 uppercase text-[11px] tracking-wider">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRemovals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center text-slate-400">
                                    No snow removal operations found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRemovals.map((removal) => (
                                <TableRow key={removal.id} className="hover:bg-slate-50/50 transition-colors border-b">
                                    <TableCell className="px-6 py-5 font-mono text-[10px] font-bold text-slate-400">
                                        {removal.snowId}
                                    </TableCell>
                                    <TableCell className="px-6 py-5">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold text-slate-900">{removal.streetName || 'N/A'}</p>
                                            <p className="text-[11px] font-medium text-slate-400">{removal.houseNo || 'N/A'}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-5">
                                        <div className="flex justify-center">
                                            <Badge
                                                className={cn(
                                                    "text-[11px] font-bold px-5 py-1.5 rounded-full border-0 min-w-[100px] justify-center tracking-wide",
                                                    removal.status === 'pending' && "bg-orange-100 text-orange-600",
                                                    removal.status === 'inspected' && "bg-orange-500 text-white shadow-lg shadow-orange-500/20",
                                                    removal.status === 'completed' && "bg-emerald-100 text-emerald-600"
                                                )}
                                            >
                                                {removal.status.charAt(0).toUpperCase() + removal.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell px-6 py-5 text-xs font-medium text-slate-400">
                                        {formatDate(removal.createdAt)}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell px-6 py-5 text-xs font-medium text-slate-400">
                                        {formatDate(removal.completedAt)}
                                    </TableCell>
                                    <TableCell className="text-right pr-6 py-5">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-slate-100 rounded-full">
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
