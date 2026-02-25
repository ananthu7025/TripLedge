"use client";

import React from "react";
import { X, Loader2, Plus } from "lucide-react";
import { useToast } from "@/lib/utils/useToast";

export interface CreateTargetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const MODULE_OPTIONS = [
    { label: "Trip Inspection", value: "trip" },
    { label: "Snow Removal", value: "snow_removal" },
];

const PERIOD_OPTIONS = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Quarterly", value: "quarterly" },
    { label: "Yearly", value: "yearly" },
];

const PERIOD_LABELS: Record<string, string> = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
};

// Comprehensive unit options grouped by category
const UNIT_OPTIONS = [
    // Distance
    { label: "Meters (m)", value: "meters" },
    { label: "Centimeters (cm)", value: "cm" },
    { label: "Millimeters (mm)", value: "mm" },
    { label: "Kilometers (km)", value: "km" },
    { label: "Feet (ft)", value: "feet" },
    { label: "Inches (in)", value: "inches" },
    { label: "Miles (mi)", value: "miles" },
    { label: "Yards (yd)", value: "yards" },
    // Area
    { label: "Square Meters (m²)", value: "sq_meters" },
    { label: "Square Feet (sq ft)", value: "sq_feet" },
    { label: "Square Kilometers (km²)", value: "sq_km" },
    { label: "Hectares (ha)", value: "hectares" },
    { label: "Acres", value: "acres" },
    // Volume / Weight
    { label: "Liters (L)", value: "liters" },
    { label: "Cubic Meters (m³)", value: "cubic_meters" },
    { label: "Kilograms (kg)", value: "kg" },
    { label: "Tonnes (t)", value: "tonnes" },
    // Count / Work
    { label: "Tasks", value: "tasks" },
    { label: "Jobs", value: "jobs" },
    { label: "Hours (h)", value: "hours" },
    { label: "Minutes (min)", value: "minutes" },
    { label: "Trips", value: "trips" },
    { label: "Inspections", value: "inspections" },
    { label: "Sites", value: "sites" },
    { label: "Zones", value: "zones" },
    { label: "Roads", value: "roads" },
];

export function CreateTargetModal({
    isOpen,
    onClose,
    onSuccess,
}: CreateTargetModalProps): React.ReactElement | null {
    const { toast } = useToast();
    const [submitting, setSubmitting] = React.useState(false);
    const [form, setForm] = React.useState({
        name: "",
        module: "trip",
        period: "yearly",
        value: "",
        unit: "meters",
    });

    const handleClose = () => {
        setForm({ name: "", module: "trip", period: "yearly", value: "", unit: "meters" });
        onClose();
    };

    const handleSubmit = async () => {
        if (!form.name || !form.value || !form.unit) {
            toast({ message: "Please fill in all required fields", variant: "error" });
            return;
        }
        if (isNaN(parseFloat(form.value)) || parseFloat(form.value) <= 0) {
            toast({ message: "Target value must be a positive number", variant: "error" });
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/targets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    module: form.module,
                    period: form.period,
                    periodLabel: PERIOD_LABELS[form.period] || form.period,
                    value: form.value,
                    unit: form.unit,
                    distribution: "equal",
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast({ message: "Target created and assigned to all technicians", variant: "success" });
                onSuccess();
                handleClose();
            } else {
                throw new Error(data.error || "Failed to create target");
            }
        } catch (error: unknown) {
            toast({
                message: error instanceof Error ? error.message : "Failed to create target",
                variant: "error",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="bg-background border border-border sm:rounded-lg shadow-lg w-full max-w-md p-6 relative">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 outline-none"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>

                {/* Header */}
                <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
                    <h2 className="text-lg font-semibold leading-none tracking-tight">Create Target</h2>
                    <p className="text-sm text-muted-foreground">
                        Set a new work target for a module.
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <FormField
                        label="Target Name"
                        placeholder="e.g. Annual Grinding 2026"
                        value={form.name}
                        onChange={(val) => setForm((prev) => ({ ...prev, name: val }))}
                    />
                    <FormSelect
                        label="Module"
                        options={MODULE_OPTIONS}
                        value={form.module}
                        onChange={(val) => setForm((prev) => ({ ...prev, module: val }))}
                    />
                    <FormSelect
                        label="Period"
                        options={PERIOD_OPTIONS}
                        value={form.period}
                        onChange={(val) => setForm((prev) => ({ ...prev, period: val }))}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            label="Target Value"
                            placeholder="2500"
                            type="number"
                            value={form.value}
                            onChange={(val) => setForm((prev) => ({ ...prev, value: val }))}
                        />
                        <FormSelect
                            label="Unit"
                            options={UNIT_OPTIONS}
                            value={form.unit}
                            onChange={(val) => setForm((prev) => ({ ...prev, unit: val }))}
                        />
                    </div>
                </div>

                {/* Info note */}
                <p className="mt-4 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                    🔁 This target will be equally distributed among all active <strong>technician</strong> users.
                </p>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-2 sm:mt-0"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
                    >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        {submitting ? "Creating..." : "Create Target"}
                    </button>
                </div>
            </div>
        </div>
    );
}

CreateTargetModal.displayName = "CreateTargetModal";

// ---- Local helpers ----

function FormField({
    label, placeholder, type = "text", value, onChange,
}: {
    label: string;
    placeholder: string;
    type?: string;
    value: string;
    onChange: (val: string) => void;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-foreground">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                min={type === "number" ? "0" : undefined}
                step={type === "number" ? "any" : undefined}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 outline-none"
            />
        </div>
    );
}

function FormSelect({
    label, options, value, onChange,
}: {
    label: string;
    options: { label: string; value: string }[];
    value: string;
    onChange: (val: string) => void;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-foreground">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 outline-none"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
