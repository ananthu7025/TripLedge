"use client";

import React from "react";
import { X } from "lucide-react";

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

export interface ViewTargetModalProps {
    isOpen: boolean;
    onClose: () => void;
    target: Target | null;
}

export function ViewTargetModal({
    isOpen,
    onClose,
    target,
}: ViewTargetModalProps): React.ReactElement | null {
    if (!isOpen || !target) return null;

    const totalValue = parseFloat(target.value);
    const userCount = target.targetUsers.length;
    const perUser = userCount > 0
        ? (totalValue / userCount).toLocaleString(undefined, { maximumFractionDigits: 2 })
        : null;

    const formatValue = (val: number | string) =>
        parseFloat(String(val)).toLocaleString(undefined, { maximumFractionDigits: 2 });

    const moduleLabel =
        target.module === "trip" ? "Trip Inspection" :
            target.module === "snow_removal" ? "Snow Removal" :
                target.module === "inspection" ? "Inspection" :
                    target.module;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="bg-background border border-border sm:rounded-2xl shadow-xl w-full max-w-md p-6 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 w-7 h-7 rounded-full border border-border flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                >
                    <X className="h-3.5 w-3.5" />
                    <span className="sr-only">Close</span>
                </button>

                {/* Header */}
                <div className="mb-5">
                    <h2 className="text-xl font-bold text-foreground pr-8">{target.name}</h2>
                    <p className="text-sm text-muted-foreground">Target details and distribution</p>
                </div>

                {/* Module & Period row */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-muted/50 border border-border px-4 py-3">
                        <p className="text-xs text-muted-foreground mb-1">Module</p>
                        <p className="text-sm font-semibold text-foreground">{moduleLabel}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 border border-border px-4 py-3">
                        <p className="text-xs text-muted-foreground mb-1">Period</p>
                        <p className="text-sm font-semibold text-foreground capitalize">
                            {target.periodLabel || target.period}
                        </p>
                    </div>
                </div>

                {/* Total Target */}
                <div className="rounded-xl bg-primary/5 border border-primary/10 px-4 py-4 mb-3 text-center">
                    <p className="text-2xl font-bold text-foreground">
                        {formatValue(target.value)}{" "}
                        <span className="text-lg">{target.unit}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Total Target</p>
                </div>

                {/* Per User */}
                {perUser && (
                    <div className="rounded-xl bg-muted/40 border border-border px-4 py-4 mb-4 text-center">
                        <p className="text-xl font-bold text-foreground">
                            {perUser}{" "}
                            <span className="text-base">{target.unit}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Per user ({userCount} {userCount === 1 ? "user" : "users"},{" "}
                            {target.distribution})
                        </p>
                    </div>
                )}

                {/* Assigned users list */}
                {target.targetUsers.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Assigned Technicians
                        </p>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {target.targetUsers.map((tu) => (
                                <div
                                    key={tu.user.id}
                                    className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                                            <span className="text-[10px] font-bold text-primary">
                                                {tu.user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                                            </span>
                                        </div>
                                        <span className="text-sm text-foreground">{tu.user.fullName}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-foreground">
                                        {formatValue(tu.allocatedValue)} {target.unit}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

ViewTargetModal.displayName = "ViewTargetModal";
