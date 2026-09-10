import React, { useState, useRef } from 'react';
import { getTodayString } from '../lib/dateUtils';

export function Settings({
  isDarkMode,
  onToggleTheme,
  onExportJSON,
  onImportJSON,
  onClearAll,
}) {
  const [importStatus, setImportStatus] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    try {
      const jsonStr = await onExportJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taskline-backup-${getTodayString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export tasks.');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await onImportJSON(text);
      setImportStatus({ success: true, message: 'Tasks imported successfully!' });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setImportStatus({ success: false, message: `Import failed: ${err.message}` });
    }
  };

  const handleClear = async () => {
    await onClearAll();
    setShowClearConfirm(false);
    setImportStatus({ success: true, message: 'All local task data cleared.' });
  };

  return (
    <div className="max-w-[800px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 border-b border-outline-variant pb-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-background">Settings</h1>
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
            Theme preferences, data management, and PWA options
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Appearance Card */}
        <div className="bg-surface-container rounded-lg p-6 border border-outline-variant">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>
                {isDarkMode ? 'dark_mode' : 'light_mode'}
              </span>
              <div>
                <h3 className="text-body-md font-body-md font-semibold text-on-surface">Appearance Theme</h3>
                <p className="text-body-sm text-on-surface-variant">
                  Toggle between Dark Mode and Light Mode
                </p>
              </div>
            </div>

            <button
              onClick={onToggleTheme}
              className="px-4 py-2 bg-surface-container-high hover:bg-surface-variant border border-outline-variant rounded-md text-label-md font-label-md text-on-surface font-semibold flex items-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
              Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </div>

        {/* Backup & Restore JSON */}
        <div className="bg-surface-container rounded-lg p-6 border border-outline-variant">
          <div className="flex items-start gap-3 mb-4">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>
              database
            </span>
            <div>
              <h3 className="text-body-md font-body-md font-semibold text-on-surface">Data Backup & Restore</h3>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                TaskLine runs 100% locally in IndexedDB without cross-device sync. Export your tasks as JSON to transfer or backup data.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-primary-container text-on-primary-container rounded-md text-label-md font-label-md font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
              Export JSON Backup
            </button>

            <label className="px-4 py-2 bg-surface-container-high hover:bg-surface-variant border border-outline-variant rounded-md text-label-md font-label-md text-on-surface font-semibold cursor-pointer flex items-center gap-2 transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload</span>
              Import JSON Backup
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {importStatus && (
            <div className={`mt-4 p-3 rounded-md text-body-sm ${
              importStatus.success ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-error/10 text-error border border-error/20'
            }`}>
              {importStatus.message}
            </div>
          )}
        </div>

        {/* Developer & UI Sandbox */}
        <div className="bg-surface-container rounded-lg p-6 border border-border-glass">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-glow">
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                  science
                </span>
              </div>
              <div>
                <h3 className="text-body-md font-body-md font-semibold text-on-surface">
                  UI Component Sandbox
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  Inspect and preview UI components in simulated Mobile, Tablet, and Desktop viewports
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                window.location.hash = '#sandbox';
              }}
              className="px-4 py-2 bg-primary text-on-primary rounded-xl text-label-md font-label-md font-bold hover:opacity-90 transition shadow-glow flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                open_in_new
              </span>
              Open Studio
            </button>
          </div>
        </div>

        {/* Clear Data Section */}
        <div className="bg-surface-container rounded-lg p-6 border border-outline-variant">
          <div className="flex items-start gap-3 mb-4">
            <span className="material-symbols-outlined text-error" style={{ fontSize: '24px' }}>
              warning
            </span>
            <div>
              <h3 className="text-body-md font-body-md font-semibold text-on-surface">Clear All Local Data</h3>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Permanently delete all tasks stored in IndexedDB on this browser.
              </p>
            </div>
          </div>

          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-4 py-2 bg-error/10 hover:bg-error/20 text-error border border-error/30 rounded-md text-label-md font-label-md font-semibold transition-colors"
            >
              Reset / Clear All Tasks
            </button>
          ) : (
            <div className="bg-error/10 border border-error/30 p-4 rounded-md flex flex-col gap-3">
              <p className="text-body-sm text-error font-medium">
                Are you sure? This action will erase all local tasks permanently.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  className="px-4 py-1.5 bg-error text-on-error rounded-md text-label-md font-label-md font-bold hover:opacity-90"
                >
                  Yes, Erase Everything
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-1.5 bg-surface-container-high border border-outline-variant text-on-surface rounded-md text-label-md font-label-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* App Info */}
        <div className="text-center pt-4 text-mono-label text-on-surface-variant/60">
          <p>TaskLine PWA v1.0.0 • Offline-First IndexedDB Architecture</p>
          <p className="mt-1">Independent Local Install • No Push Notifications / Server Required</p>
        </div>
      </div>
    </div>
  );
}
