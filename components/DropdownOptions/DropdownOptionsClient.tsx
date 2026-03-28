"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/utils/api-client";
import { useToast } from "@/lib/utils/useToast";
import { useMutation } from "@/app/utils/hooks/useApi";
import { Plus, Trash2, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface DropdownOption {
    id: string;
    category: string;
    label: string;
    sortOrder: number;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

interface Props {
    initialOptions: DropdownOption[];
}

const CATEGORIES: { key: string; label: string; description: string }[] = [
    { key: "snow_issues", label: "Snow Issues", description: "Issues reported during snow removal inspection" },
    { key: "snow_tools", label: "Snow Tools", description: "Tools used during snow removal completion" },
    { key: "snow_materials", label: "Snow Materials", description: "Materials used during snow removal completion" },
];

export function DropdownOptionsClient({ initialOptions }: Props) {
    const { toast } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const refresh = () => startTransition(() => router.refresh());

    const [addingCategory, setAddingCategory] = useState<string | null>(null);
    const [newLabel, setNewLabel] = useState("");
    const [newSortOrder, setNewSortOrder] = useState("0");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const addMutation = useMutation();
    const toggleMutation = useMutation();
    const deleteMutation = useMutation();

    const optionsByCategory = (category: string) =>
        initialOptions.filter((o) => o.category === category);

    const handleAdd = async (category: string) => {
        if (!newLabel.trim()) {
            toast({ message: "Label is required", variant: "error" });
            return;
        }
        const ok = await addMutation.mutate(() =>
            api.post("/api/dropdown-options", {
                category,
                label: newLabel.trim(),
                sortOrder: parseInt(newSortOrder, 10) || 0,
            })
        );
        if (ok) {
            toast({ message: "Option added", variant: "success" });
            setAddingCategory(null);
            setNewLabel("");
            setNewSortOrder("0");
            refresh();
        } else {
            toast({ message: addMutation.error ?? "Failed to add option", variant: "error" });
        }
    };

    const handleToggle = async (option: DropdownOption) => {
        const ok = await toggleMutation.mutate(() =>
            api.patch(`/api/dropdown-options/${option.id}`, { isActive: !option.isActive })
        );
        if (ok) {
            toast({ message: `Option ${option.isActive ? "deactivated" : "activated"}`, variant: "success" });
            refresh();
        } else {
            toast({ message: toggleMutation.error ?? "Failed to update option", variant: "error" });
        }
    };

    const handleDelete = async (id: string) => {
        const ok = await deleteMutation.mutate(() =>
            api.delete(`/api/dropdown-options/${id}`)
        );
        if (ok) {
            toast({ message: "Option deleted", variant: "success" });
            setDeletingId(null);
            refresh();
        } else {
            toast({ message: deleteMutation.error ?? "Failed to delete option", variant: "error" });
        }
    };

    const handleCancelAdd = () => {
        setAddingCategory(null);
        setNewLabel("");
        setNewSortOrder("0");
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Dropdown Options</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage the multi-select chip options shown in the mobile app
                    </p>
                </div>
            </div>

            {/* Sections */}
            <div className="space-y-6">
                {CATEGORIES.map((cat) => {
                    const items = optionsByCategory(cat.key);
                    const isAdding = addingCategory === cat.key;

                    return (
                        <div key={cat.key} className="rounded-xl border bg-card text-card-foreground shadow-sm">
                            {/* Section header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                                <div>
                                    <h2 className="text-base font-semibold text-foreground">{cat.label}</h2>
                                    <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (isAdding) {
                                            handleCancelAdd();
                                        } else {
                                            setAddingCategory(cat.key);
                                            setNewLabel("");
                                            setNewSortOrder("0");
                                        }
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium h-8 px-3 hover:bg-primary/90 transition-colors"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add Option
                                </button>
                            </div>

                            {/* Inline add form */}
                            {isAdding && (
                                <div className="px-5 py-4 border-b border-border bg-muted/30">
                                    <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                                        New Option
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                                        <div className="flex-1 space-y-1">
                                            <label className="text-xs font-medium text-foreground">
                                                Label <span className="text-destructive">*</span>
                                            </label>
                                            <input
                                                value={newLabel}
                                                onChange={(e) => setNewLabel(e.target.value)}
                                                placeholder="e.g. Ice accumulation"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleAdd(cat.key);
                                                    if (e.key === "Escape") handleCancelAdd();
                                                }}
                                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none"
                                                autoFocus
                                                disabled={addMutation.isLoading}
                                            />
                                        </div>
                                        <div className="w-24 space-y-1">
                                            <label className="text-xs font-medium text-foreground">Sort Order</label>
                                            <input
                                                type="number"
                                                value={newSortOrder}
                                                onChange={(e) => setNewSortOrder(e.target.value)}
                                                min={0}
                                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none"
                                                disabled={addMutation.isLoading}
                                            />
                                        </div>
                                        <div className="flex gap-2 pb-0.5">
                                            <button
                                                onClick={() => handleAdd(cat.key)}
                                                disabled={addMutation.isLoading || isPending}
                                                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                                            >
                                                {addMutation.isLoading ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Plus className="h-3.5 w-3.5" />
                                                )}
                                                {addMutation.isLoading ? "Adding…" : "Add"}
                                            </button>
                                            <button
                                                onClick={handleCancelAdd}
                                                disabled={addMutation.isLoading}
                                                className="h-9 px-3 rounded-md border border-border text-sm text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Options list */}
                            {items.length === 0 ? (
                                <div className="px-5 py-10 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        No options yet. Click &quot;Add Option&quot; to create the first one.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {items.map((option) => (
                                        <div
                                            key={option.id}
                                            className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span
                                                    className={`text-sm font-medium truncate ${
                                                        option.isActive
                                                            ? "text-foreground"
                                                            : "text-muted-foreground line-through"
                                                    }`}
                                                >
                                                    {option.label}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                                    #{option.sortOrder}
                                                </span>
                                                {!option.isActive && (
                                                    <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground flex-shrink-0">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button
                                                    onClick={() => handleToggle(option)}
                                                    disabled={toggleMutation.isLoading || isPending}
                                                    title={option.isActive ? "Deactivate" : "Activate"}
                                                    className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                                                >
                                                    {option.isActive ? (
                                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(option.id)}
                                                    title="Delete"
                                                    className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-destructive/10 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Footer count */}
                            <div className="px-5 py-2.5 border-t border-border bg-muted/20 rounded-b-xl">
                                <p className="text-xs text-muted-foreground">
                                    {items.filter((i) => i.isActive).length} active /{" "}
                                    {items.length} total
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Delete confirm dialog */}
            {deletingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold text-foreground mb-2">Delete Option?</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            This action cannot be undone. The option will be removed from the mobile app.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeletingId(null)}
                                disabled={deleteMutation.isLoading}
                                className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deletingId)}
                                disabled={deleteMutation.isLoading}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
                            >
                                {deleteMutation.isLoading ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Deleting…</>
                                ) : (
                                    "Delete"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
