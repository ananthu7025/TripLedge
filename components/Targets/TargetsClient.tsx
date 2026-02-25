"use client";

import { useRouter } from "next/navigation";
import { api } from "@/app/utils/api-client";
import { useToast } from "@/lib/utils/useToast";
import { useState, useTransition } from "react";
import { Plus, Eye, Trash2 } from "lucide-react";
import { useMutation } from "@/app/utils/hooks/useApi";
import { CreateTargetModal, DeleteConfirmModal, ViewTargetModal } from "@/components/modal";

interface TargetUser {
    user: { id: string; fullName: string; email: string };
    allocatedValue: string;
}

interface Target {
    id: string;
    name: string;
    module: string;
    period: string;
    periodLabel: string;
    value: string;
    unit: string;
    distribution: string;
    status: string;
    targetUsers: TargetUser[];
}

interface TargetsClientProps {
    initialTargets: Target[];
}

export function TargetsClient({ initialTargets }: TargetsClientProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const deleteMutation = useMutation();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [viewTarget, setViewTarget] = useState<Target | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Target | null>(null);

    const refresh = () => startTransition(() => router.refresh());

    const handleDelete = async () => {
        if (!deleteTarget) return;

        const success = await deleteMutation.mutate(() =>
            api.delete(`/api/targets/${deleteTarget.id}`)
        );

        if (success) {
            toast({ message: "Target deleted successfully", variant: "success" });
            setDeleteTarget(null);
            refresh();
        } else if (deleteMutation.error) {
            toast({ message: deleteMutation.error, variant: "error" });
        }
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Targets</h1>
                    <p className="text-sm text-muted-foreground">Set and manage work targets</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
                >
                    <Plus className="h-4 w-4" /> Create Target
                </button>
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Target Name</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Module</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Period</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Value</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Users</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Distribution</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {initialTargets.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                                        No targets found. Create your first target.
                                    </td>
                                </tr>
                            ) : (
                                initialTargets.map((target) => (
                                    <TargetRow
                                        key={target.id}
                                        target={target}
                                        onView={() => setViewTarget(target)}
                                        onDelete={() => setDeleteTarget(target)}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <CreateTargetModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={() => {
                    setIsCreateOpen(false);
                    refresh();
                }}
            />

            <ViewTargetModal
                isOpen={!!viewTarget}
                onClose={() => setViewTarget(null)}
                target={viewTarget}
            />

            <DeleteConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                isLoading={deleteMutation.isLoading || isPending}
                title="Delete Target"
                message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`}
            />
        </>
    );
}

// ---- Row component ----

function TargetRow({
    target,
    onView,
    onDelete,
}: {
    target: Target;
    onView: () => void;
    onDelete: () => void;
}) {
    const statusClass = {
        active: "bg-success/10 text-success border-success/20",
        archived: "bg-warning/10 text-warning border-warning/20",
    }[target.status] ?? "bg-muted text-muted-foreground border-muted";

    const moduleLabel =
        target.module === "trip" ? "Trip" :
            target.module === "snow_removal" ? "Snow" :
                target.module;

    return (
        <tr className="border-b transition-colors hover:bg-muted/50">
            <td className="p-4 align-middle font-medium text-sm text-foreground">{target.name}</td>
            <td className="p-4 align-middle">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase border-input text-foreground">
                    {moduleLabel}
                </span>
            </td>
            <td className="p-4 align-middle text-sm text-foreground uppercase">
                {target.periodLabel || target.period}
            </td>
            <td className="p-4 align-middle text-sm font-medium text-foreground">
                {parseFloat(target.value).toLocaleString()} {target.unit}
            </td>
            <td className="p-4 align-middle text-xs text-foreground hidden md:table-cell">
                {target.targetUsers.length}
            </td>
            <td className="p-4 align-middle text-xs text-foreground capitalize hidden md:table-cell">
                {target.distribution}
            </td>
            <td className="p-4 align-middle">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase ${statusClass}`}>
                    {target.status}
                </span>
            </td>
            <td className="p-4 align-middle">
                <div className="flex gap-1">
                    <button
                        onClick={onView}
                        title="View target"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        title="Delete target"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-destructive/10 hover:text-destructive h-9 px-3"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}
