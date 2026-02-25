import React from 'react';
import { Search, Trash2 } from 'lucide-react';
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MAP_CONSTANTS } from "@/app/utils/constants";
import { type Zone } from "@/app/utils/schemas/zone.schema";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell
} from "@/components/ui/Table";

const { PRIORITY_COLORS } = MAP_CONSTANTS;

interface ZonesTableProps {
    zones: Zone[];
    search: string;
    onSearchChange: (value: string) => void;
    onDeleteClick: (zone: Zone) => void;
    isLoading: boolean;
}

export const ZonesTable = React.memo(({
    zones,
    search,
    onSearchChange,
    onDeleteClick,
    isLoading
}: ZonesTableProps) => {
    const filteredZones = zones.filter(z => z.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Zones ({zones.length})</h2>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        placeholder="Search zones…"
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
                            <TableHead>Module</TableHead>
                            <TableHead>Priority</TableHead>
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
                                <TableCell className="capitalize">{zone.module}</TableCell>
                                <TableCell>
                                    <span
                                        style={{ color: PRIORITY_COLORS[zone.priority] }}
                                        className="font-bold uppercase text-xs"
                                    >
                                        {zone.priority}
                                    </span>
                                </TableCell>
                                <TableCell>{zone.totalPoints}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        onClick={() => onDeleteClick(zone)}
                                        disabled={isLoading}
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 hover:border-danger hover:text-danger"
                                        title="Delete zone"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredZones.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No zones found
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
