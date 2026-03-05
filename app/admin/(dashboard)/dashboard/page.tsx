"use client";

import {
    HardHat,
    Snowflake,
    MapPin,
    Target,
    FileText,
    UserCheck,
    CalendarDays,
    CheckCircle,
    Clock,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Stats {
    trip: {
        pending: number;
        inspected: number;
        completed: number;
    };
    snow: {
        pending: number;
        inspected: number;
        completed: number;
    };
    checkinRequests: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({
        trip: { pending: 0, inspected: 0, completed: 0 },
        snow: { pending: 0, inspected: 0, completed: 0 },
        checkinRequests: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [tripRes, snowRes, checkinRes] = await Promise.all([
                fetch('/api/trip-inspections', { method: 'OPTIONS' }),
                fetch('/api/snow-removals', { method: 'OPTIONS' }),
                fetch('/api/checkin-requests'),
            ]);

            const tripData = await tripRes.json();
            const snowData = await snowRes.json();
            const checkinData = await checkinRes.json();

            const pendingCheckins = checkinData.requests?.filter((r: any) => r.status === 'pending').length || 0;

            setStats({
                trip: tripData,
                snow: snowData,
                checkinRequests: pendingCheckins,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <>
            <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Overview of operations</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Trip Section */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex flex-col space-y-1.5 p-6 pb-3">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                            <HardHat className="h-4 w-4 text-primary" />
                            Trip Inspection & Grinding
                        </h3>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="grid grid-cols-3 gap-3">
                            <Link href="/admin/trip-inspection?status=pending"
                                className="text-center p-3 rounded-lg bg-warning/10 hover:bg-warning/20 transition-colors block">
                                <p className="text-2xl font-bold text-warning">{stats.trip.pending}</p>
                                <p className="text-[11px] text-muted-foreground">Pending</p>
                            </Link>
                            <Link href="/admin/trip-inspection?status=inspected"
                                className="text-center p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors block">
                                <p className="text-2xl font-bold text-blue-500">{stats.trip.inspected}</p>
                                <p className="text-[11px] text-muted-foreground">Inspected</p>
                            </Link>
                            <Link href="/admin/trip-inspection?status=completed"
                                className="text-center p-3 rounded-lg bg-success/10 hover:bg-success/20 transition-colors block">
                                <p className="text-2xl font-bold text-success">{stats.trip.completed}</p>
                                <p className="text-[11px] text-muted-foreground">Completed</p>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Snow Section */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex flex-col space-y-1.5 p-6 pb-3">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                            <Snowflake className="h-4 w-4 text-blue-400" />
                            Snow Inspection & Removal
                        </h3>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="grid grid-cols-3 gap-3">
                            <Link href="/admin/snow-removal?status=pending"
                                className="text-center p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors block">
                                <p className="text-2xl font-bold text-muted-foreground">{stats.snow.pending}</p>
                                <p className="text-[11px] text-muted-foreground">Pending</p>
                            </Link>
                            <Link href="/admin/snow-removal?status=inspected"
                                className="text-center p-3 rounded-lg bg-warning/10 hover:bg-warning/20 transition-colors block">
                                <p className="text-2xl font-bold text-warning">{stats.snow.inspected}</p>
                                <p className="text-[11px] text-muted-foreground">Inspected</p>
                            </Link>
                            <Link href="/admin/snow-removal?status=completed"
                                className="text-center p-3 rounded-lg bg-success/10 hover:bg-success/20 transition-colors block">
                                <p className="text-2xl font-bold text-success">{stats.snow.completed}</p>
                                <p className="text-[11px] text-muted-foreground">Completed</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Check-ins Alert */}
            {stats.checkinRequests > 0 && (
                <div className="rounded-xl border border-warning bg-warning/5 p-4">
                    <div className="flex items-center gap-3">
                        <UserCheck className="h-5 w-5 text-warning" />
                        <div className="flex-1">
                            <p className="font-medium text-warning">Pending Check-in Requests</p>
                            <p className="text-sm text-muted-foreground">
                                {stats.checkinRequests} technician{stats.checkinRequests > 1 ? 's' : ''} waiting for approval
                            </p>
                        </div>
                        <Link
                            href="/admin/check-in-requests"
                            className="px-4 py-2 bg-warning text-white rounded-md hover:bg-warning/90 text-sm font-medium"
                        >
                            Review Now
                        </Link>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6 pb-3">
                    <h3 className="text-sm font-medium">Quick Actions</h3>
                </div>
                <div className="p-6 pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        <Link href="/admin/map-management"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-auto py-3 flex-col gap-1.5">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="text-xs">Map Areas</span>
                        </Link>
                        <Link href="/admin/targets"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-auto py-3 flex-col gap-1.5">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="text-xs">Targets</span>
                        </Link>
                        <Link href="/admin/reports"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-auto py-3 flex-col gap-1.5">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-xs">Reports</span>
                        </Link>
                        <Link href="/admin/check-in-requests"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-auto py-3 flex-col gap-1.5 relative">
                            <UserCheck className="h-4 w-4 text-primary" />
                            <span className="text-xs">Check-Ins</span>
                            {stats.checkinRequests > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {stats.checkinRequests}
                                </span>
                            )}
                        </Link>
                        <Link href="/admin/attendance"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-auto py-3 flex-col gap-1.5">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            <span className="text-xs">Attendance</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Activity */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex flex-col space-y-1.5 p-6 pb-3">
                        <h3 className="text-sm font-medium">Recent Activity</h3>
                    </div>
                    <div className="p-6 pt-0 space-y-3">
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No recent activity
                        </div>
                    </div>
                </div>

                {/* Annual Progress */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex flex-col space-y-1.5 p-6 pb-3">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Annual Progress
                        </h3>
                    </div>
                    <div className="p-6 pt-0 space-y-4">
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No active targets set
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
