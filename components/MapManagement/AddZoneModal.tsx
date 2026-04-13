"use client";

import { z } from "zod";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputText } from "@/components/ui/InputText";
import { InputSelect } from "@/components/ui/InputSelect";
import {
    zoneSchema,
    type ZoneFormData,
} from "@/app/utils/schemas/zone.schema";

interface AddZoneModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartDrawing: (data: ZoneFormData) => void;
    nextLocationNumber: number;
}

const formSchema = zoneSchema.omit({ points: true });
type FormValues = z.infer<typeof formSchema>;

const zoneTypeOptions = [
    { value: "proposed", label: "Proposed" },
    { value: "additional", label: "Additional" },
];

export function AddZoneModal({ isOpen, onClose, onStartDrawing, nextLocationNumber }: AddZoneModalProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: `Location ${nextLocationNumber}`,
            zoneType: "proposed",
        },
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({ name: `Location ${nextLocationNumber}`, zoneType: "proposed" });
        }
    }, [isOpen, nextLocationNumber]);

    if (!isOpen) return null;

    const handleSubmit = (data: FormValues) => {
        onStartDrawing({ ...data, points: [] });
        form.reset();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card text-card-foreground rounded-xl shadow-xl max-w-md w-full border border-border">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold">Add New Location</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded-md transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-4">
                    <InputText
                        hookForm={form}
                        field="name"
                        label="Location Name"
                        placeholder={`Location ${nextLocationNumber}`}
                        labelMandatory
                    />

                    <div className="grid grid-cols-1 gap-4">
                        <InputSelect
                            hookForm={form}
                            field="zoneType"
                            label="Location Type"
                            options={zoneTypeOptions}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                        >
                            Start Drawing
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
