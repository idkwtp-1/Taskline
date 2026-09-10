import React, { useState, useEffect, useRef, useMemo } from 'react';
import { parseNaturalLanguage } from '../lib/parseNaturalLanguage';
import { formatDisplayDate, formatDisplayTime, getTodayString } from '../lib/dateUtils';

export function QuickAddBar({
  isOpen,
  onClose,
  onSaveTask,
  onOpenFullEditor,
}) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setInput('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle Esc key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Live parse as user types
  const parsed = useMemo(() => {
    if (!input.trim()) return null;
    return parseNaturalLanguage(input);
  }, [input]);

  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleConfirm();
    }
  };

  const handleConfirm = () => {
    if (!parsed || !parsed.title.trim()) return;

    onSaveTask({
      title: parsed.title,
      type: parsed.type,
      priority: parsed.priority,
      category: parsed.category,
      dueDate: parsed.dueDate,
      dueTime: parsed.dueTime,
      duration: parsed.duration,
      recurrenceType: parsed.recurrenceType,
      recurrenceInterval: parsed.recurrenceInterval,
      recurrenceWeekdays: parsed.recurrenceWeekdays,
      recurrenceStartDate: parsed.recurrenceStartDate,
      isRecurrenceTemplate: parsed.isRecurrenceTemplate,
    });

    onClose();
  };

  const handleOpenEditor = () => {
    if (parsed) {
      onOpenFullEditor({
        title: parsed.title,
        type: parsed.type,
        priority: parsed.priority,
        category: parsed.category,
        dueDate: parsed.dueDate,
        dueTime: parsed.dueTime,
        duration: parsed.duration,
        recurrenceType: parsed.recurrenceType,
        recurrenceInterval: parsed.recurrenceInterval,
        recurrenceWeekdays: parsed.recurrenceWeekdays,
        recurrenceStartDate: parsed.recurrenceStartDate,
        isRecurrenceTemplate: parsed.isRecurrenceTemplate,
      });
    } else {
      onOpenFullEditor({});
    }
    onClose();
  };

  const todayStr = getTodayString();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-background/75 backdrop-blur-md animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Command Bar Modal */}
      <div className="relative w-full max-w-xl bg-surface-container/95 border border-border-glass rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-5 flex flex-col gap-4 z-10 ring-1 ring-white/10 backdrop-blur-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border-glass pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold shadow-glow">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                bolt
              </span>
            </div>
            <span className="text-sm font-bold text-on-surface tracking-tight">
              Natural Language Quick Add
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[11px] font-mono text-on-surface-variant/70 bg-surface-container-high px-2 py-0.5 rounded-lg border border-border-glass">
              ⌘ / Ctrl + K
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition cursor-pointer"
              aria-label="Close Quick Add"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                close
              </span>
            </button>
          </div>
        </div>

        {/* Input Field */}
        <div className="relative">
          <textarea
            ref={inputRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type naturally... e.g. 'today i need to do 50 push ups' or 'every two days from this date add 50 crunches' or '15 october party at 15:00'"
            className="w-full bg-surface-container-low border border-border-glass rounded-xl p-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition resize-none font-sans"
          />
        </div>

        {/* Live Parsed Intelligence Entity Chips */}
        {parsed && input.trim() && (
          <div className="bg-surface-container-lowest/60 border border-border-glass rounded-xl p-3 space-y-2.5 animate-fade-in">
            <div className="text-[11px] text-on-surface-variant font-mono uppercase tracking-wider font-semibold flex items-center justify-between">
              <span>Parsed Understanding</span>
              {parsed.title && (
                <span className="text-primary font-sans font-bold capitalize">
                  "{parsed.title}"
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Due Date Badge */}
              {parsed.dueDate && (
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">
                    calendar_month
                  </span>
                  <span>
                    {parsed.dueDate === todayStr ? 'Today' : formatDisplayDate(parsed.dueDate)}
                  </span>
                </span>
              )}

              {/* Due Time Badge */}
              {parsed.dueTime && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-mono font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">
                    schedule
                  </span>
                  <span>{formatDisplayTime(parsed.dueTime)}</span>
                </span>
              )}

              {/* Duration Badge */}
              {parsed.dueTime && parsed.duration && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">
                    timer
                  </span>
                  <span>{parsed.duration} mins</span>
                </span>
              )}

              {/* Recurrence Badge */}
              {parsed.recurrenceType !== 'none' && (
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30 text-xs font-mono font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">
                    sync
                  </span>
                  <span>
                    {parsed.recurrenceType === 'interval' && `Repeats every ${parsed.recurrenceInterval} days`}
                    {parsed.recurrenceType === 'daily' && 'Daily Task'}
                    {parsed.recurrenceType === 'weekdays' && 'Every Weekday'}
                    {parsed.recurrenceType === 'weekly' && 'Weekly Task'}
                  </span>
                </span>
              )}

              {/* Priority Badge */}
              {parsed.priority !== 'none' && (
                <span className="px-2.5 py-1 rounded-lg bg-error/15 text-error border border-error/30 text-xs font-mono font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">
                    flag
                  </span>
                  <span className="uppercase">{parsed.priority} priority</span>
                </span>
              )}

              {/* Category Badge */}
              {parsed.category && (
                <span className="px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface-variant border border-border-glass text-xs font-mono">
                  #{parsed.category}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleOpenEditor}
            className="text-xs text-on-surface-variant hover:text-primary transition flex items-center gap-1 cursor-pointer font-medium"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              open_in_new
            </span>
            <span>Open in Full Editor</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-on-surface-variant hover:bg-surface-container transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!parsed || !parsed.title.trim()}
              onClick={handleConfirm}
              className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold transition shadow-glow hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                check
              </span>
              <span>Create Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
