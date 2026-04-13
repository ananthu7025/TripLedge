/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { ArrowLeft, MapPin, Calendar, Users, Wrench, Package, FileText, Camera } from "lucide-react";
import { snowRemovals, jobPhotos, users } from "@/db/schema";
import { requireAuth } from "@/lib/utils/session";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/app/utils/utils";
import { notFound } from "next/navigation";

export default async function SnowRemovalDetailPage({ params }: { params: { id: string } }) {
    await requireAuth();

    const job = await db.query.snowRemovals.findFirst({
        where: eq(snowRemovals.id, params.id),
    });

    if (!job) return notFound();

    const photos = await db.query.jobPhotos.findMany({
        where: eq(jobPhotos.jobId, params.id),
    });

    // Fetch crew member names
    let crewNames: string[] = [];
    if (job.crewMembers) {
        try {
            const ids: string[] = JSON.parse(job.crewMembers);
            if (ids.length > 0) {
                const crewUsers = await db.query.users.findMany({
                    where: (u, { inArray }) => inArray(u.id, ids),
                    columns: { id: true, fullName: true },
                });
                crewNames = crewUsers.map(u => u.fullName);
            }
        } catch { /* ignore parse errors */ }
    }

    const beforePhotos = photos.filter(p => p.photoType === 'before');
    const afterPhotos = photos.filter(p => p.photoType === 'after');

    const parseJson = (val: string | null | undefined): string[] => {
        if (!val) return [];
        try { return JSON.parse(val); } catch { return []; }
    };

    const issues = parseJson(job.issuesReported);
    const tools = parseJson(job.toolsUsed);
    const materials = parseJson(job.materialsUsed);

    const formatDate = (d: Date | null) => {
        if (!d) return '—';
        return new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/snow-removal"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </Link>
            </div>

            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{job.snowId}</h1>
                    <p className="text-sm text-muted-foreground mt-1">{job.streetName || 'N/A'} — {job.houseNo || 'N/A'}</p>
                </div>
                <Badge
                    className={cn(
                        "text-[11px] font-bold px-5 py-1.5 rounded-full border-0 tracking-wide",
                        job.status === 'pending' && "bg-orange-100 text-orange-600",
                        job.status === 'inspected' && "bg-orange-500 text-white",
                        job.status === 'completed' && "bg-emerald-100 text-emerald-600"
                    )}
                >
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border bg-card p-4">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Calendar className="h-3.5 w-3.5" /> Inspection Start</p>
                    <p className="text-sm font-semibold">{formatDate(job.inspectedAt)}</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Calendar className="h-3.5 w-3.5" /> Completed At</p>
                    <p className="text-sm font-semibold">{formatDate(job.completedAt)}</p>
                </div>
                {job.capturedLatitude && job.capturedLongitude && (
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><MapPin className="h-3.5 w-3.5" /> GPS</p>
                        <p className="text-sm font-semibold font-mono">{Number(job.capturedLatitude).toFixed(5)}, {Number(job.capturedLongitude).toFixed(5)}</p>
                    </div>
                )}
            </div>

            {/* Inspection Details */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
                <h2 className="text-base font-semibold">Inspection Details</h2>
                {issues.length > 0 && (
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Issues Reported</p>
                        <div className="flex flex-wrap gap-2">
                            {issues.map((issue, i) => (
                                <span key={i} className="text-xs bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-100">{issue}</span>
                            ))}
                        </div>
                    </div>
                )}
                {job.additionalComments && (
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Additional Comments</p>
                        <p className="text-sm text-foreground bg-muted/40 rounded-lg p-3">{job.additionalComments}</p>
                    </div>
                )}
            </div>

            {/* Completion Details */}
            {job.status === 'completed' && (
                <div className="rounded-xl border bg-card p-6 space-y-4">
                    <h2 className="text-base font-semibold">Completion Details</h2>
                    {job.solutionDescription && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">How Problem Was Solved</p>
                            <p className="text-sm text-foreground bg-muted/40 rounded-lg p-3">{job.solutionDescription}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {tools.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1"><Wrench className="h-3.5 w-3.5" /> Tools Used</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {tools.map((t, i) => (
                                        <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{t}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {materials.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1"><Package className="h-3.5 w-3.5" /> Materials Used</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {materials.map((m, i) => (
                                        <span key={i} className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">{m}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {crewNames.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Crew Members</p>
                            <div className="flex flex-wrap gap-2">
                                {crewNames.map((name, i) => (
                                    <span key={i} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">{name}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Photos */}
            {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
                <div className="rounded-xl border bg-card p-6 space-y-4">
                    <h2 className="text-base font-semibold flex items-center gap-2"><Camera className="h-4 w-4" /> Photos</h2>
                    {beforePhotos.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Before</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {beforePhotos.map(p => (
                                    <img key={p.id} src={p.photoUrl} alt="Before" className="rounded-lg object-cover aspect-square w-full border" />
                                ))}
                            </div>
                        </div>
                    )}
                    {afterPhotos.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">After ({afterPhotos.length}/5)</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {afterPhotos.map(p => (
                                    <img key={p.id} src={p.photoUrl} alt="After" className="rounded-lg object-cover aspect-square w-full border" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
