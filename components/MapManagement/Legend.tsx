import React from 'react';
import { MAP_CONSTANTS } from '@/app/utils/constants';

const { LINE_COLORS, PRIORITY_COLORS } = MAP_CONSTANTS;

export const Legend = React.memo((): React.ReactElement => {

    return (
        <div className="absolute bottom-4 left-4 z-10 bg-card text-card-foreground rounded-lg border shadow-lg p-4 space-y-3 min-w-[280px]">
            <h3 className="text-sm font-bold mb-2">Map Legend</h3>

            <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Zone Types</p>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-1 rounded" style={{ backgroundColor: LINE_COLORS.proposed }} />
                    <span className="text-sm">Proposed Zones</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-1 rounded" style={{ backgroundColor: LINE_COLORS.additional }} />
                    <span className="text-sm">Additional Zones</span>
                </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground uppercase">Priority Levels</p>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PRIORITY_COLORS.high }} />
                    <span className="text-sm">High</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PRIORITY_COLORS.medium }} />
                    <span className="text-sm">Medium</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PRIORITY_COLORS.low }} />
                    <span className="text-sm">Low</span>
                </div>
            </div>
        </div>
    );
});

Legend.displayName = 'Legend';
