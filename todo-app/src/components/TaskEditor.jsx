import React, { useState, useEffect } from 'react';
import { getTodayString } from '../lib/dateUtils';

export function TaskEditor({ isOpen, onClose, onSave, taskToEdit = null, initialValues = {} }) {
  const todayStr = getTodayString();

  const [title, setTitle] = useState('');
  const [type, setType] = useState('one-time');
  const [priority, setPriority] = useState('none');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setType(taskToEdit.type || 'one-time');
      setPriority(taskToEdit.priority || 'none');
      setCategory(taskToEdit.category || '');
      setDueDate(taskToEdit.dueDate || '');
      setDueTime(taskToEdit.dueTime || '');
      setNotes(taskToEdit.notes || '');
    } else {
      setTitle(initialValues.title || '');
      setType(initialValues.type || 'one-time');
      setPriority(initialValues.priority || 'none');
      setCategory(initialValues.category || '');
      setDueDate(initialValues.dueDate || (initialValues.type === 'specific-day' ? todayStr : ''));
      setDueTime(initialValues.dueTime || '');
      setNotes(initialValues.notes || '');
    }
  }, [taskToEdit, initialValues, isOpen, todayStr]);

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

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: taskToEdit?.id,
      title: title.trim(),
      type,
      priority,
      category: category.trim(),
      dueDate: type === 'specific-day' ? (dueDate || todayStr) : dueDate || null,
      dueTime: dueTime || null,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/70 backdrop-blur-md animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Glassmorphic Slide-Over Panel / Mobile Bottom Sheet */}
      <div className="relative w-full sm:max-w-lg bg-surface-glass backdrop-blur-2xl border-l border-border-glass h-full shadow-2xl flex flex-col z-10 overflow-y-auto pb-[env(safe-area-inset-bottom,16px)]">
        {/* Panel Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-glass bg-surface/40">
          <h2 className="text-headline-md font-headline-md text-on-surface font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              {taskToEdit ? 'edit_square' : 'add_task'}
            </span>
            {taskToEdit ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close task editor"
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            title="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Panel Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col gap-5">
          {/* Task Title */}
          <div>
            <label htmlFor="task-title-input" className="block text-label-md font-label-md text-on-surface mb-1.5 font-semibold">
              Task Title <span className="text-error">*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-4 py-2.5 bg-surface-container-low border border-border-glass rounded-xl text-on-surface placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition-all font-body-md"
            />
          </div>

          {/* Task Type Tabs */}
          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-2 font-semibold">
              Task Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'one-time', label: 'One-Time', icon: 'check_circle' },
                { id: 'daily', label: 'Daily Recurring', icon: 'sync' },
                { id: 'specific-day', label: 'Specific Day', icon: 'event' },
                { id: 'optional', label: 'Optional / Flexible', icon: 'lightbulb' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id)}
                  aria-label={`Select ${item.label} task type`}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left text-body-sm transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                    type === item.id
                      ? 'bg-primary/15 border-primary text-primary font-bold shadow-glow scale-[1.01]'
                      : 'bg-surface-container-low border-border-glass text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority Options */}
          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-2 font-semibold">
              Priority
            </label>
            <div className="flex gap-2">
              {[
                { id: 'high', label: 'High', color: 'border-error text-error bg-error/15 shadow-[0_0_10px_hsl(var(--error)/0.3)]' },
                { id: 'medium', label: 'Medium', color: 'border-tertiary text-tertiary bg-tertiary/15 shadow-[0_0_10px_hsl(var(--tertiary)/0.3)]' },
                { id: 'low', label: 'Low', color: 'border-outline text-on-surface bg-surface-container-highest/60' },
                { id: 'none', label: 'None', color: 'border-border-glass text-on-surface-variant bg-surface-container-low' },
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  aria-label={`Set priority to ${p.label}`}
                  className={`flex-1 py-2 px-2.5 rounded-xl border text-mono-label font-mono-label transition-all text-center cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                    priority === p.id
                      ? `${p.color} font-bold scale-[1.02]`
                      : 'border-border-glass text-on-surface-variant hover:bg-surface-container opacity-75'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category / Tag */}
          <div>
            <label htmlFor="task-category-input" className="block text-label-md font-label-md text-on-surface mb-1.5 font-semibold">
              Category / Tag
            </label>
            <input
              id="task-category-input"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Work, Personal, Fitness"
              className="w-full px-4 py-2.5 bg-surface-container-low border border-border-glass rounded-xl text-on-surface placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition-all font-body-md"
            />
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-duedate-input" className="block text-label-md font-label-md text-on-surface mb-1.5 font-semibold">
                Due Date
              </label>
              <input
                id="task-duedate-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-border-glass rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition-all font-mono text-xs"
              />
            </div>
            <div>
              <label htmlFor="task-duetime-input" className="block text-label-md font-label-md text-on-surface mb-1.5 font-semibold">
                Due Time
              </label>
              <input
                id="task-duetime-input"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-border-glass rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition-all font-mono text-xs"
              />
            </div>
          </div>

          {/* Notes / Description */}
          <div>
            <label htmlFor="task-notes-input" className="block text-label-md font-label-md text-on-surface mb-1.5 font-semibold">
              Notes / Details
            </label>
            <textarea
              id="task-notes-input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add optional task details..."
              className="w-full px-4 py-2.5 bg-surface-container-low border border-border-glass rounded-xl text-on-surface placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition-all resize-none font-body-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-auto pt-6 flex items-center justify-end gap-3 border-t border-border-glass">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-border-glass text-on-surface-variant hover:bg-surface-container text-label-md font-label-md transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-label-md font-label-md font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-glow focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
