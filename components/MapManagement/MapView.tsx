import React, { useEffect, useRef } from 'react';
import { MAP_CONSTANTS } from '@/app/utils/constants';
import { APIProvider, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { type Zone, type LatLng, type ZoneType } from "@/app/utils/schemas/zone.schema";

const { NORTH_BATTLEFORD_CENTER, LINE_COLORS } = MAP_CONSTANTS;

interface PolylineProps {
    path: LatLng[];
    strokeColor: string;
    strokeWeight?: number;
    strokeOpacity?: number;
}

const MapPolyline = ({ path, strokeColor, strokeWeight = 4, strokeOpacity = 1 }: PolylineProps): null => {
    const map = useMap();
    const mapsLib = useMapsLibrary('maps');
    const polyRef = useRef<google.maps.Polyline | null>(null);

    useEffect(() => {
        if (!map || !mapsLib || path.length < 2) return;
        const poly = new mapsLib.Polyline({ path, strokeColor, strokeWeight, strokeOpacity, map });
        polyRef.current = poly;
        return () => { poly.setMap(null); };
    }, [map, mapsLib, path, strokeColor, strokeWeight, strokeOpacity]);

    return null;
};

interface DotProps {
    position: LatLng;
    color: string;
    index: number;
}

const DotMarker = ({ position, color, index }: DotProps): null => {
    const map = useMap();
    const markerLib = useMapsLibrary('marker');

    useEffect(() => {
        if (!map || !markerLib) return;

        const pin = new markerLib.PinElement({
            background: color,
            borderColor: '#fff',
            glyphColor: '#fff',
            glyph: String(index + 1),
            scale: 0.7,
        });

        const marker = new markerLib.AdvancedMarkerElement({
            position,
            map,
            content: pin.element,
            zIndex: 10,
        });

        return () => { marker.map = null; };
    }, [map, markerLib, position, color, index]);

    return null;
};

const MapClickHandler = ({ onMapClick, active }: { onMapClick: (l: LatLng) => void; active: boolean }): null => {
    const map = useMap();
    useEffect(() => {
        if (!map || !active) return;
        const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        });
        return () => google.maps.event.removeListener(listener);
    }, [map, active, onMapClick]);
    return null;
};

// ─── Map Content ──────────────────────────────────────────────────────────────
interface MapContentProps {
    zones: Zone[];
    currentPoints: LatLng[];
    currentType: ZoneType;
    isDrawing: boolean;
    onMapClick: (l: LatLng) => void;
}

const MapContent = ({ zones, currentPoints, currentType, isDrawing, onMapClick }: MapContentProps): React.ReactElement => {
    return (
        <>
            <MapClickHandler onMapClick={onMapClick} active={isDrawing} />
            {zones.map(zone => (
                <React.Fragment key={zone.id}>
                    <MapPolyline path={zone.points} strokeColor={LINE_COLORS[zone.zoneType]} strokeWeight={4} strokeOpacity={0.95} />
                </React.Fragment>
            ))}
            {currentPoints.length > 0 && (
                <>
                    <MapPolyline path={currentPoints} strokeColor={LINE_COLORS[currentType]} strokeWeight={4} strokeOpacity={0.6} />
                    {currentPoints.map((pt, i) => <DotMarker key={i} position={pt} color={LINE_COLORS[currentType]} index={i} />)}
                </>
            )}
        </>
    );
};

interface MapViewProps {
    googleMapsApiKey: string;
    zones: Zone[];
    currentPoints: LatLng[];
    currentType: ZoneType;
    isDrawing: boolean;
    onMapClick: (l: LatLng) => void;
}

export const MapView = React.memo(({
    googleMapsApiKey,
    zones,
    currentPoints,
    currentType,
    isDrawing,
    onMapClick
}: MapViewProps) => {
    return (
        <APIProvider apiKey={googleMapsApiKey}>
            <Map
                defaultCenter={NORTH_BATTLEFORD_CENTER}
                defaultZoom={14}
                mapId="north-battleford-zones"
                style={{ width: '100%', height: '100%' }}
                gestureHandling="greedy"
            >
                <MapContent
                    zones={zones}
                    currentPoints={currentPoints}
                    currentType={currentType}
                    isDrawing={isDrawing}
                    onMapClick={onMapClick}
                />
            </Map>
        </APIProvider>
    );
});

MapView.displayName = 'MapView';
