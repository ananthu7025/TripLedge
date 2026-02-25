import React from 'react';
import { Undo as UndoIcon } from 'lucide-react';
import { Button } from "@/components/ui/Button";

interface DrawingControlsProps {
    pointsCount: number;
    onUndo: () => void;
    onFinish: () => void;
    onCancel: () => void;
    isLoading: boolean;
}

export const DrawingControls = React.memo(({
    pointsCount,
    onUndo,
    onFinish,
    onCancel,
    isLoading
}: DrawingControlsProps) => {
    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-card border border-border px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm font-medium">Click on the map to add points ({pointsCount} added)</p>
            <div className="flex gap-2 mt-2">
                <Button
                    onClick={onUndo}
                    disabled={pointsCount === 0}
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    title="Undo last point (Ctrl+Z)"
                >
                    <UndoIcon className="h-3.5 w-3.5" /> Undo
                </Button>
                <Button
                    onClick={onFinish}
                    disabled={pointsCount < 2 || isLoading}
                    variant="primary"
                    size="sm"
                >
                    {isLoading ? 'Saving...' : 'Finish'}
                </Button>
                <Button
                    onClick={onCancel}
                    variant="danger"
                    size="sm"
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
});

DrawingControls.displayName = 'DrawingControls';
