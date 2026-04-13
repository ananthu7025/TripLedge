"use client";
import { Plus } from 'lucide-react';
import { Legend } from "./Legend";
import { MapView } from "./MapView";
import { ZonesTable } from "./ZonesTable";
import { api } from "@/app/utils/api-client";
import { AddZoneModal } from "./AddZoneModal";
import { useToast } from '@/lib/utils/useToast';
import { Button } from "@/components/ui/Button";
import { DrawingControls } from "./DrawingControls";
import { API_ENDPOINTS } from "@/app/utils/constants";
import { useMutation } from "@/app/utils/hooks/useApi";
import { useEffect, useState, useCallback } from 'react';
import { DeleteConfirmModal } from '@/components/modal/DeleteConfirmModal';
import {
    type Zone,
    type ZoneFormData,
    type LatLng
} from "@/app/utils/schemas/zone.schema";


interface MapManagementClientProps {
    initialZones: Zone[];
    googleMapsApiKey: string;
}

export function MapManagementClient({ initialZones, googleMapsApiKey }: MapManagementClientProps) {

    const [zones, setZones] = useState<Zone[]>(initialZones);
    const [currentPoints, setCurrentPoints] = useState<LatLng[]>([]);
    const [currentZoneData, setCurrentZoneData] = useState<ZoneFormData | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { toast } = useToast();
    const { mutate, isLoading } = useMutation();

    const handleUndoPoint = useCallback(() => {
        setCurrentPoints(prev => prev.slice(0, -1));
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && isDrawing && currentPoints.length > 0) {
                e.preventDefault();
                handleUndoPoint();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDrawing, currentPoints, handleUndoPoint]);

    const fetchZones = async () => {
        try {
            const data = await api.get(API_ENDPOINTS.ZONES);
            const formattedZones = data.zones.map((z: any) => ({
                ...z,
                points: JSON.parse(z.pointsGeojson),
            }));
            setZones(formattedZones);
        } catch (error) {
            console.error('Error fetching zones:', error);
            toast({ message: 'Failed to load zones', variant: 'error' });
        }
    };

    const handleStartDrawing = (data: ZoneFormData) => {
        setCurrentZoneData(data);
        setCurrentPoints([]);
        setIsDrawing(true);
    };

    const handleMapClick = useCallback((latlng: LatLng) => {
        setCurrentPoints(prev => [...prev, latlng]);
    }, []);

    const handleFinishLine = async () => {
        if (currentPoints.length < 2 || !currentZoneData) {
            toast({ message: 'Please add at least 2 points to create a zone', variant: 'warning' });
            return;
        }

        const success = await mutate(() =>
            api.post(API_ENDPOINTS.ZONES, {
                ...currentZoneData,
                points: currentPoints,
            })
        );

        if (success) {
            await fetchZones();
            setCurrentPoints([]);
            setCurrentZoneData(null);
            setIsDrawing(false);
            toast({ message: `Zone saved successfully!`, variant: 'success' });
        }
    };

    const handleDeleteClick = useCallback((zone: Zone) => {
        setZoneToDelete(zone);
        setIsDeleteModalOpen(true);
    }, []);

    const handleDeleteConfirm = async () => {
        if (!zoneToDelete) return;

        const success = await mutate(() =>
            api.delete(API_ENDPOINTS.ZONES, { params: { id: zoneToDelete.id } })
        );

        if (success) {
            await fetchZones();
            toast({ message: 'Zone deleted successfully', variant: 'success' });
            setIsDeleteModalOpen(false);
            setZoneToDelete(null);
        }
    };

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Location Management</h1>
                    <p className="text-sm text-muted-foreground">Manage work locations on the map</p>
                </div>
                <Button
                    onClick={() => {
                        if (!isMapLoaded) setIsMapLoaded(true);
                        setIsModalOpen(true);
                    }}
                    variant="primary"
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" /> Add Location
                </Button>
            </div>
            <div className="relative h-[500px] w-full rounded-xl border border-border bg-card shadow-lg overflow-hidden mb-6">
                {!isMapLoaded ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30">
                        <div className="text-center space-y-4 p-8">
                            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold">Interactive Zone Map</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Load the interactive map to view existing zones, create new zones, and manage work areas in North Battleford.
                            </p>
                            <Button onClick={() => setIsMapLoaded(true)} variant="primary" className="gap-2">
                                Open Interactive Map
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {isDrawing && (
                            <DrawingControls
                                pointsCount={currentPoints.length}
                                onUndo={handleUndoPoint}
                                onFinish={handleFinishLine}
                                onCancel={() => { setIsDrawing(false); setCurrentPoints([]); setCurrentZoneData(null); }}
                                isLoading={isLoading}
                            />
                        )}

                        <MapView
                            googleMapsApiKey={googleMapsApiKey}
                            zones={zones}
                            currentPoints={currentPoints}
                            currentType={currentZoneData?.zoneType || 'proposed'}
                            isDrawing={isDrawing}
                            onMapClick={handleMapClick}
                        />

                        <Legend />
                    </>
                )}
            </div>

            <ZonesTable
                zones={zones}
                search={search}
                onSearchChange={setSearch}
                onDeleteClick={handleDeleteClick}
                onEditSaved={fetchZones}
                isLoading={isLoading}
            />

            <AddZoneModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onStartDrawing={handleStartDrawing}
                nextLocationNumber={zones.length + 1}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setZoneToDelete(null); }}
                onConfirm={handleDeleteConfirm}
                title="Delete Location"
                message="Are you sure you want to delete this location? This will also delete all associated jobs. This action cannot be undone."
                itemName={zoneToDelete?.name}
                isLoading={isLoading}
            />
        </>
    );
}
