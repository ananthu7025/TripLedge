/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db";
import { desc } from "drizzle-orm";
import { users, tripInspections, snowRemovals, companySettings } from "@/db/schema";
import { requireAuth } from "@/lib/utils/session";
import { Badge } from "@/components/ui/Badge";

export const metadata = {
    title: "Performance - Trip Ledge",
    description: "User performance dashboard",
};

export default async function PerformancePage() {
    await requireAuth();

    const settings = await db.query.companySettings.findFirst();
    const weight = parseFloat((settings as any)?.difficultyWeight ?? '0.2') || 0.2;

    const allUsers = await db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
        with: { role: true },
    });

    const allTrips = await db.query.tripInspections.findMany();
    const allSnow = await db.query.snowRemovals.findMany();

    const parseJson = (val: string | null): string[] => {
        if (!val) return [];
        try { return JSON.parse(val); } catch { return []; }
    };

    const userStats = allUsers.map(user => {
        // Snow jobs
        const snowJobs = allSnow.filter(s => {
            const crew = parseJson(s.crewMembers);
            return s.inspectedBy === user.id || s.completedBy === user.id || crew.includes(user.id);
        });
        const snowCompleted = snowJobs.filter(s => s.status === 'completed');

        const snowTimeTaken = snowCompleted
            .filter(s => s.inspectedAt && s.completedAt)
            .reduce((sum, s) => {
                const ms = new Date(s.completedAt!).getTime() - new Date(s.inspectedAt!).getTime();
                return sum + ms / 60000; // minutes
            }, 0);

        const snowPhotos = 0; // Would need photo count from jobPhotos; skipped for now

        // Trip jobs
        const tripJobs = allTrips.filter(t => {
            const inspUsers = parseJson(t.inspectedUsers);
            const compUsers = parseJson(t.completedUsers);
            return t.inspectedBy === user.id || t.completedBy === user.id ||
                inspUsers.includes(user.id) || compUsers.includes(user.id);
        });
        const tripsCompleted = tripJobs.filter(t => t.status === 'completed');

        const totalLength = tripsCompleted.reduce((sum, t) => sum + parseFloat(t.length?.toString() || '0'), 0);
        const totalDifficulty = tripsCompleted.reduce((sum, t) => {
            const h = parseFloat(t.highPoint?.toString() || '0');
            const l = parseFloat(t.lowPoint?.toString() || '0');
            return sum + (h - l);
        }, 0);

        const totalTripScore = tripsCompleted.reduce((sum, t) => {
            const h = parseFloat(t.highPoint?.toString() || '0');
            const l = parseFloat(t.lowPoint?.toString() || '0');
            const len = parseFloat(t.length?.toString() || '0');
            return sum + len * (1 + (h - l) * weight);
        }, 0);

        return {
            id: user.id,
            name: user.fullName,
            email: user.email,
            role: user.role?.name || '—',
            status: user.status,
            snowCompleted: snowCompleted.length,
            snowTimeTaken: snowCompleted.length > 0 ? (snowTimeTaken / snowCompleted.length).toFixed(0) : '—',
            tripsCompleted: tripsCompleted.length,
            totalLength: totalLength.toFixed(1),
            totalDifficulty: totalDifficulty.toFixed(1),
            totalTripScore: totalTripScore.toFixed(2),
        };
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">User Performance</h1>
                <p className="text-sm text-muted-foreground">Per-user metrics for Snow Removal and Trip Inspection (Weight = {weight})</p>
            </div>

            <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-slate-50/80">
                            <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                            <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Role</th>
                            <th className="text-center px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Snow Jobs</th>
                            <th className="text-center px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Time (min)</th>
                            <th className="text-center px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trips</th>
                            <th className="text-center px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Length</th>
                            <th className="text-center px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Difficulty</th>
                            <th className="text-center px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trip Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userStats.map(u => (
                            <tr key={u.id} className="border-b hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-semibold text-slate-900">{u.name}</p>
                                        <p className="text-[11px] text-slate-400">{u.email}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">{u.role}</span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <span className="text-lg font-bold text-slate-900">{u.snowCompleted}</span>
                                </td>
                                <td className="px-4 py-4 text-center text-slate-500 text-xs">{u.snowTimeTaken}</td>
                                <td className="px-4 py-4 text-center">
                                    <span className="text-lg font-bold text-slate-900">{u.tripsCompleted}</span>
                                </td>
                                <td className="px-4 py-4 text-center text-slate-600 text-xs font-medium">{u.totalLength} cm</td>
                                <td className="px-4 py-4 text-center text-slate-600 text-xs font-medium">{u.totalDifficulty}</td>
                                <td className="px-4 py-4 text-center">
                                    <span className="text-base font-bold text-primary">{u.totalTripScore}</span>
                                </td>
                            </tr>
                        ))}
                        {userStats.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center py-12 text-slate-400">No users found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <p className="text-xs text-muted-foreground">
                Trip Score formula: Length × (1 + Difficulty × {weight}) where Difficulty = High − Low
            </p>
        </div>
    );
}
