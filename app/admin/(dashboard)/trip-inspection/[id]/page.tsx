/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { ArrowLeft, MapPin, Calendar, Users, Ruler, Camera, Star } from "lucide-react";
import { tripInspections, jobPhotos, companySettings } from "@/db/schema";
import { requireAuth } from "@/lib/utils/session";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/app/utils/utils";
import { notFound } from "next/navigation";

export default async function TripInspectionDetailPage({ params }: { params: { id: string } }) {
    await requireAuth();

    const trip = await db.query.tripInspections.findFirst({
        where: eq(tripInspections.id, params.id),
        with: { zone: { columns: { name: true } } },
    });

    if (!trip) return notFound();

    const photos = await db.query.jobPhotos.findMany({
        where: eq(jobPhotos.jobId, params.id),
    });

    // Fetch weight constant
    const settings = await db.query.companySettings.findFirst();
    const weight = parseFloat((settings as any)?.difficultyWeight ?? '0.2') || 0.2;

    // Fetch inspected user names
    const parseUserIds = (json: string | null): string[] => {
        if (!json) return [];
        try { return JSON.parse(json); } catch { return []; }
    };

    const inspectedIds = parseUserIds(trip.inspectedUsers);
    const completedIds = parseUserIds(trip.completedUsers);

    let inspectedNames: string[] = [];
    let completedNames: string[] = [];

    if (inspectedIds.length > 0) {
        const u = await db.query.users.findMany({
            where: (u, { inArray }) => inArray(u.id, inspectedIds),
            columns: { id: true, fullName: true },
        });
        inspectedNames = u.map(x => x.fullName);
    }
    if (completedIds.length > 0) {
        const u = await db.query.users.findMany({
            where: (u, { inArray }) => inArray(u.id, completedIds),
            columns: { id: true, fullName: true },
        });
        completedNames = u.map(x => x.fullName);
    }

    const beforePhotos = photos.filter(p => p.photoType === 'before');
    const afterPhotos = photos.filter(p => p.photoType === 'after');

    // Compute trip score
    const h = parseFloat(trip.highPoint?.toString() || '0');
    const l = parseFloat(trip.lowPoint?.toString() || '0');
    const len = parseFloat(trip.length?.toString() || '0');
    const difficulty = h - l;
    const tripScore = len > 0 ? (len * (1 + difficulty * weight)).toFixed(2) : null;

    const formatDate = (d: Date | null) => {
        if (!d) return '—';
        return new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/trip-inspection"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </Link>
            </div>

            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{trip.tripId}</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {trip.streetName || 'N/A'} — {trip.houseNo || 'N/A'}
                        {trip.zone && <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{trip.zone.name}</span>}
                    </p>
                </div>
                <Badge
                    className={cn(
                        "text-[11px] font-bold px-5 py-1.5 rounded-full border-0 tracking-wide",
                        trip.status === 'pending' && "bg-orange-100 text-orange-600",
                        trip.status === 'inspected' && "bg-orange-500 text-white",
                        trip.status === 'completed' && "bg-emerald-100 text-emerald-600"
                    )}
                >
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                </Badge>
            </div>

            {/* Timestamps + GPS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border bg-card p-4">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Calendar className="h-3.5 w-3.5" /> Inspected Date</p>
                    <p className="text-sm font-semibold">{formatDate(trip.inspectedAt)}</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Calendar className="h-3.5 w-3.5" /> Completed Date</p>
                    <p className="text-sm font-semibold">{formatDate(trip.completedAt)}</p>
                </div>
                {trip.capturedLatitude && trip.capturedLongitude && (
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><MapPin className="h-3.5 w-3.5" /> GPS Coordinates</p>
                        <p className="text-sm font-semibold font-mono">{Number(trip.capturedLatitude).toFixed(5)}, {Number(trip.capturedLongitude).toFixed(5)}</p>
                    </div>
                )}
            </div>

            {/* Measurements + Score */}
            {(trip.highPoint || trip.lowPoint || trip.length) && (
                <div className="rounded-xl border bg-card p-6">
                    <h2 className="text-base font-semibold mb-4 flex items-center gap-2"><Ruler className="h-4 w-4" /> Measurements</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="text-center bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">High Point</p>
                            <p className="text-xl font-bold text-foreground">{trip.highPoint ?? '—'}</p>
                            <p className="text-[10px] text-muted-foreground">cm</p>
                        </div>
                        <div className="text-center bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Low Point</p>
                            <p className="text-xl font-bold text-foreground">{trip.lowPoint ?? '—'}</p>
                            <p className="text-[10px] text-muted-foreground">cm</p>
                        </div>
                        <div className="text-center bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Length</p>
                            <p className="text-xl font-bold text-foreground">{trip.length ?? '—'}</p>
                            <p className="text-[10px] text-muted-foreground">cm</p>
                        </div>
                        {tripScore && (
                            <div className="text-center bg-primary/5 rounded-lg p-3 border border-primary/20">
                                <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1"><Star className="h-3 w-3" /> Trip Score</p>
                                <p className="text-xl font-bold text-primary">{tripScore}</p>
                                <p className="text-[10px] text-muted-foreground">W={weight}</p>
                            </div>
                        )}
                    </div>
                    {tripScore && (
                        <p className="text-xs text-muted-foreground mt-3">
                            Score = {trip.length} × (1 + ({trip.highPoint} − {trip.lowPoint}) × {weight}) = <strong>{tripScore}</strong>
                        </p>
                    )}
                </div>
            )}

            {/* Users */}
            {(inspectedNames.length > 0 || completedNames.length > 0) && (
                <div className="rounded-xl border bg-card p-6 space-y-4">
                    <h2 className="text-base font-semibold flex items-center gap-2"><Users className="h-4 w-4" /> Users</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {inspectedNames.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Inspected By</p>
                                <div className="flex flex-wrap gap-2">
                                    {inspectedNames.map((name, i) => (
                                        <span key={i} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">{name}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {completedNames.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Completed By</p>
                                <div className="flex flex-wrap gap-2">
                                    {completedNames.map((name, i) => (
                                        <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-medium">{name}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Notes */}
            {trip.notes && (
                <div className="rounded-xl border bg-card p-6">
                    <h2 className="text-base font-semibold mb-2">Additional Notes</h2>
                    <p className="text-sm text-foreground bg-muted/40 rounded-lg p-3">{trip.notes}</p>
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
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">After</p>
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
