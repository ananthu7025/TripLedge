"use client";
import React, { useState } from 'react';
import { Search, Trash2, Pencil, X, Save } from 'lucide-react';
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/app/utils/api-client";
import { useToast } from "@/lib/utils/useToast";
import { useMutation } from "@/app/utils/hooks/useApi";
import { API_ENDPOINTS } from "@/app/utils/constants";
import { type Zone } from "@/app/utils/schemas/zone.schema";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell
} from "@/components/ui/Table";

const zoneTypeOptions = [
    { value: "proposed", label: "Proposed" },
    { value: "additional", label: "Additional" },
];

interface EditModalProps {
    zone: Zone;
    onClose: () => void;
    onSaved: () => void;
}

function EditLocationModal({ zone, onClose, onSaved }: EditModalProps) {
    const { toast } = useToast();
    const { mutate, isLoading } = useMutation();
    const [name, setName] = useState(zone.name);
    const [zoneType, setZoneType] = useState(zone.zoneType);

    const handleSave = async () => {
        if (!name.trim()) return;
        const success = await mutate(() =>
            api.patch(`${API_ENDPOINTS.ZONES}?id=${zone.id}`, { name: name.trim(), zoneType })
        );
        if (success) {
            toast({ message: 'Location updated', variant: 'success' });
            onSaved();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card text-card-foreground rounded-xl shadow-xl max-w-md w-full border border-border">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold">Edit Location</h2>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium block mb-1">Location Name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium block mb-1">Location Type</label>
                        <select
                            value={zoneType}
                            onChange={e => setZoneType(e.target.value as any)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            {zoneTypeOptions.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1 text-foreground">Cancel</Button>
                        <Button type="button" variant="primary" onClick={handleSave} disabled={isLoading} className="flex-1 gap-1">
                            <Save className="h-4 w-4" /> {isLoading ? 'Saving…' : 'Save'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ZonesTableProps {
    zones: Zone[];
    search: string;
    onSearchChange: (value: string) => void;
    onDeleteClick: (zone: Zone) => void;
    onEditSaved: () => void;
    isLoading: boolean;
}

export const ZonesTable = React.memo(({
    zones,
    search,
    onSearchChange,
    onDeleteClick,
    onEditSaved,
    isLoading
}: ZonesTableProps) => {
    const [editZone, setEditZone] = useState<Zone | null>(null);
    const filteredZones = zones.filter(z => z.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-4">
            {editZone && (
                <EditLocationModal
                    zone={editZone}
                    onClose={() => setEditZone(null)}
                    onSaved={onEditSaved}
                />
            )}

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Locations ({zones.length})</h2>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        placeholder="Search locations…"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 h-9 w-full rounded-md border border-input bg-background text-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredZones.map(zone => (
                            <TableRow key={zone.id}>
                                <TableCell className="font-medium">{zone.name}</TableCell>
                                <TableCell>
                                    <Badge variant={zone.zoneType === 'proposed' ? 'success' : 'warning'}>
                                        {zone.zoneType}
                                    </Badge>
                                </TableCell>
                                <TableCell>{zone.totalPoints}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            onClick={() => setEditZone(zone)}
                                            disabled={isLoading}
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 hover:border-primary hover:text-primary"
                                            title="Edit location"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            onClick={() => onDeleteClick(zone)}
                                            disabled={isLoading}
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 hover:border-danger hover:text-danger"
                                            title="Delete location"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredZones.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    No locations found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
});

ZonesTable.displayName = 'ZonesTable';
