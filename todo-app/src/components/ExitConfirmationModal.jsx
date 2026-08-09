import React, { useEffect } from 'react';

export function ExitConfirmationModal({ isOpen, onClose, onConfirm }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click to cancel */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-surface-container border border-outline-variant rounded-xl p-6 shadow-2xl flex flex-col gap-5 z-10 scale-100 transition-all">
        {/* Header Icon + Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-error/15 text-error flex items-center justify-center font-bold flex-shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              power_settings_new
            </span>
          </div>
          <div>
            <h3 className="text-headline-md font-headline-md font-bold text-on-surface">
              Exit TaskLine?
            </h3>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
              Are you sure you want to close the application?
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/40">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface-variant text-on-surface font-label-md rounded-md hover:bg-surface-variant/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-error text-on-error font-label-md font-bold rounded-md hover:opacity-90 transition-opacity shadow-md flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              logout
            </span>
            Exit App
          </button>
        </div>
      </div>
    </div>
  );
}
