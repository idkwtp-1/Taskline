import React, { useRef, useState } from 'react';
import { formatDisplayTime, formatShortDate } from '../lib/dateUtils';
import { TactileAnimatedCheckbox } from './TactileAnimatedCheckbox';

export function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const isOptional = task.type === 'optional';
  const isHighPriority = task.priority === 'high';
  const isMediumPriority = task.priority === 'medium';

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  if (isOptional) {
    return (
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative rounded-xl p-4 transition-all duration-300 border border-outline-variant/60 bg-surface-glass backdrop-blur-md hover:-translate-y-0.5 hover:shadow-glow flex items-start gap-3 overflow-hidden ${
          task.completed ? 'opacity-50' : 'opacity-90 hover:opacity-100'
        }`}
      >
        {/* Dynamic Cursor Spotlight Overlay */}
        {isHovered && (
          <div
            className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-100 z-0"
            style={{
              background: `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, hsl(var(--primary) / 0.1), transparent 80%)`,
            }}
          />
        )}

        <div className="pt-0.5 z-10">
          <TactileAnimatedCheckbox
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            ariaLabel={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
          />
        </div>

        <div className="flex-1 min-w-0 z-10">
          <h3 className={`text-body-sm font-body-sm text-on-surface break-words ${
            task.completed ? 'line-through-animated opacity-50' : ''
          }`}>
            {task.title}
          </h3>

          {(task.category || task.notes) && (
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {task.category && (
                <span className="text-mono-label font-mono-label text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-full border border-outline/30">
                  #{task.category}
                </span>
              )}
              {task.notes && (
                <span className="text-body-sm text-on-surface-variant/80 text-xs truncate max-w-full">
                  {task.notes}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-1 shrink-0 z-10">
          <button
            onClick={() => onEdit(task)}
            aria-label={`Edit task "${task.title}"`}
            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            title="Edit task"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            aria-label={`Delete task "${task.title}"`}
            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-error focus-visible:outline-none"
            title="Delete task"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
          </button>
        </div>
      </div>
    );
  }

  // Priority & Scheduled Task Card (Magic Spotlight Card + Border Beam)
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative rounded-xl p-4 transition-all duration-300 border border-outline-variant bg-surface-container/90 backdrop-blur-md hover:-translate-y-0.5 hover:shadow-glow flex items-start gap-3.5 overflow-hidden ${
        isHighPriority ? 'border-beam-active' : ''
      } ${task.completed ? 'opacity-65' : ''}`}
    >
      {/* Dynamic Cursor Spotlight Overlay */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-100 z-0"
          style={{
            background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, hsl(var(--primary) / 0.14), transparent 80%)`,
          }}
        />
      )}

      {/* High/Medium Priority Left Glowing Accent Bar */}
      {isHighPriority && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-error shadow-[0_0_12px_hsl(var(--error))]" />
      )}
      {isMediumPriority && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary shadow-[0_0_12px_hsl(var(--tertiary))]" />
      )}

      {/* Animated SVG Checkbox */}
      <div className="pt-0.5 z-10">
        <TactileAnimatedCheckbox
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          ariaLabel={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />
      </div>

      {/* Task Info */}
      <div className="flex-1 min-w-0 z-10">
        <h3 className={`text-body-md font-body-md text-on-surface font-semibold break-words transition-all duration-200 ${
          task.completed ? 'line-through-animated opacity-50' : ''
        }`}>
          {task.title}
        </h3>

        {task.notes && (
          <p className="text-body-sm text-on-surface-variant/90 mt-1 text-xs line-clamp-2">
            {task.notes}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          {/* Priority Badge */}
          {isHighPriority && (
            <span className="text-mono-label font-mono-label font-bold text-error bg-error/10 border border-error/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
              HIGH PRIORITY
            </span>
          )}
          {isMediumPriority && (
            <span className="text-mono-label font-mono-label font-bold text-tertiary bg-tertiary/10 border border-tertiary/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
              MEDIUM PRIORITY
            </span>
          )}

          {/* Type Badge / Daily Pill */}
          {task.type === 'daily' && (
            <span className="text-mono-label font-mono-label font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>sync</span> DAILY
            </span>
          )}

          {/* Category Badge */}
          {task.category && (
            <span className="text-mono-label font-mono-label text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-full border border-outline/30">
              #{task.category}
            </span>
          )}

          {/* Time Badge */}
          {task.dueTime && (
            <span className="text-label-md font-label-md text-on-surface-variant bg-surface/50 border border-outline/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>schedule</span> {formatDisplayTime(task.dueTime)}
            </span>
          )}

          {/* Date Badge */}
          {task.dueDate && task.type === 'specific-day' && (
            <span className="text-label-md font-label-md text-on-surface-variant bg-surface/50 border border-outline/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>calendar_month</span> {formatShortDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-1 shrink-0 z-10">
        <button
          onClick={() => onEdit(task)}
          aria-label={`Edit task "${task.title}"`}
          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          title="Edit task"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
        </button>
        <button
          onClick={() => onDelete(task.id)}
          aria-label={`Delete task "${task.title}"`}
          className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-error focus-visible:outline-none"
          title="Delete task"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
        </button>
      </div>
    </div>
  );
}
