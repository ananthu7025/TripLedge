"use client";

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  itemName,
  isLoading = false,
}: DeleteConfirmModalProps): React.ReactElement | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300">
      <div className="bg-card text-card-foreground rounded-2xl shadow-2xl max-w-md w-full border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          {/* Icon & Title */}
          <div className="flex flex-col items-center text-center space-y-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-danger" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
              <p className="text-sm text-muted-foreground font-medium">This action cannot be undone</p>
            </div>
          </div>

          {/* Message */}
          <p className="text-center text-muted-foreground text-sm leading-relaxed mb-8 px-2">
            {message}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onClose}
              disabled={isLoading}
              variant="outline"
              className="flex-1 h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              variant="danger"
              className="flex-1 h-11 gap-2 font-bold"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                'Yes, Delete It'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

DeleteConfirmModal.displayName = 'DeleteConfirmModal';
