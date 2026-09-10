import React, { useState, useEffect, useMemo } from 'react';
import { TactileAnimatedCheckbox } from './TactileAnimatedCheckbox';
import { formatDisplayTime } from '../lib/dateUtils';

const START_HOUR = 7;  // 07:00 AM
const END_HOUR = 23;   // 11:00 PM
const HOUR_HEIGHT = 80; // 80px per hour for generous spatial clarity

export function DayBlockerAgenda({
  tasks = [],
  onToggle,
  onEdit,
  onDelete,
  onNewTask,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Keep the current-time indicator wire updated
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const totalGridHeight = (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT;

  // Calculate live NOW line offset in pixels
  const nowOffset = useMemo(() => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    if (hours < START_HOUR || hours > END_HOUR) return null;
    const decimalHours = (hours - START_HOUR) + minutes / 60;
    return decimalHours * HOUR_HEIGHT;
  }, [currentTime]);

  const nowFormatted = useMemo(() => {
    const h = currentTime.getHours();
    const m = String(currentTime.getMinutes()).padStart(2, '0');
    return formatDisplayTime(`${h}:${m}`);
  }, [currentTime]);

  // Filter tasks with valid dueTime for today's visual agenda
  const scheduledTasks = useMemo(() => {
    return tasks
      .filter((t) => Boolean(t.dueTime))
      .map((task) => {
        const [h, m] = (task.dueTime || '09:00').split(':').map(Number);
        const startMinutes = (isNaN(h) ? 9 : h) * 60 + (isNaN(m) ? 0 : m);
        const duration = Number(task.duration) || 45;
        const endMinutes = startMinutes + duration;
        return {
          ...task,
          startMinutes,
          endMinutes,
          duration,
        };
      })
      .sort((a, b) => a.startMinutes - b.startMinutes);
  }, [tasks]);

  // Compute collision / overlapping columns
  const positionedTasks = useMemo(() => {
    return scheduledTasks.map((task, idx) => {
      // Calculate top & height
      const startFromGrid = task.startMinutes - START_HOUR * 60;
      const top = Math.max(0, (startFromGrid / 60) * HOUR_HEIGHT);
      const height = Math.max(52, (task.duration / 60) * HOUR_HEIGHT);

      // Check collision with previous or next task
      const overlapsPrev =
        idx > 0 && task.startMinutes < scheduledTasks[idx - 1].endMinutes;
      const overlapsNext =
        idx < scheduledTasks.length - 1 &&
        task.endMinutes > scheduledTasks[idx + 1].startMinutes;
      const hasConflict = overlapsPrev || overlapsNext;

      let colIndex = 0;
      let totalCols = 1;

      if (hasConflict) {
        totalCols = 2;
        colIndex = overlapsPrev ? 1 : 0;
      }

      return {
        ...task,
        top,
        height,
        colIndex,
        totalCols,
        hasConflict,
      };
    });
  }, [scheduledTasks]);

  // Find open gap windows between scheduled tasks
  const freeGaps = useMemo(() => {
    const gaps = [];
    if (scheduledTasks.length === 0) return gaps;

    // Check gap before first task
    if (scheduledTasks[0].startMinutes > START_HOUR * 60 + 45) {
      const gapMins = scheduledTasks[0].startMinutes - START_HOUR * 60;
      gaps.push({
        top: 15,
        gapMins,
        suggestedTime: `${String(START_HOUR).padStart(2, '0')}:00`,
      });
    }

    // Check gaps between tasks
    for (let i = 0; i < scheduledTasks.length - 1; i++) {
      const current = scheduledTasks[i];
      const next = scheduledTasks[i + 1];
      const gapMins = next.startMinutes - current.endMinutes;

      if (gapMins >= 45) {
        const gapStartFromGrid = current.endMinutes - START_HOUR * 60;
        const top = (gapStartFromGrid / 60) * HOUR_HEIGHT + 10;
        const startH = Math.floor(current.endMinutes / 60);
        const startM = current.endMinutes % 60;
        const suggestedTime = `${String(startH).padStart(2, '0')}:${String(
          startM
        ).padStart(2, '0')}`;

        gaps.push({
          top,
          gapMins,
          suggestedTime,
        });
      }
    }
    return gaps;
  }, [scheduledTasks]);

  return (
    <div className="relative w-full bg-surface-glass backdrop-blur-xl border border-border-glass rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl overflow-hidden [--agenda-left:58px] sm:[--agenda-left:84px] [--agenda-end:64px] sm:[--agenda-end:90px]">
      {/* Visual Agenda Header */}
      <div className="flex items-center justify-between border-b border-border-glass pb-3 sm:pb-4 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-7 h-7 sm:w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '18px' }}
              aria-hidden="true"
            >
              calendar_view_day
            </span>
          </div>
          <div>
            <h2 className="text-sm sm:text-body-md font-headline-md font-bold text-on-surface">
              Daily Schedule
            </h2>
            <p className="text-mono-label text-on-surface-variant font-mono text-[10px] sm:text-xs">
              07:00 – 23:00 • {scheduledTasks.length}{' '}
              {scheduledTasks.length === 1 ? 'task booked' : 'tasks booked'}
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            onNewTask({ type: 'specific-day', dueTime: '10:00', duration: 45 })
          }
          className="px-2.5 sm:px-3.5 py-1.5 bg-primary/15 text-primary hover:bg-primary/25 border border-primary/30 rounded-xl text-xs sm:text-label-md font-label-md font-bold transition-all flex items-center gap-1 cursor-pointer"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '16px' }}
            aria-hidden="true"
          >
            add
          </span>
          <span>Add Block</span>
        </button>
      </div>

      {/* Hourly Canvas Container */}
      <div
        className="relative w-full overflow-x-hidden overflow-y-auto"
        style={{ minHeight: '600px' }}
      >
        <div
          className="relative w-full"
          style={{ height: `${totalGridHeight}px` }}
        >
          {/* Background Hour Lines & Time Labels */}
          {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, idx) => {
            const hour = START_HOUR + idx;
            const hourFormatted = formatDisplayTime(`${hour}:00`);
            const topPos = idx * HOUR_HEIGHT;

            return (
              <div
                key={hour}
                className="absolute left-0 w-full flex items-start group transition-colors"
                style={{ top: `${topPos}px`, height: `${HOUR_HEIGHT}px` }}
              >
                {/* Time Axis Column */}
                <div className="w-14 sm:w-20 shrink-0 text-mono-label font-mono text-[11px] sm:text-xs text-on-surface-variant/70 font-semibold pt-1 select-none tabular-nums">
                  {hourFormatted}
                </div>

                {/* Horizontal Grid Wire */}
                <div
                  onClick={() =>
                    onNewTask({
                      type: 'specific-day',
                      dueTime: `${String(hour).padStart(2, '0')}:00`,
                      duration: 45,
                    })
                  }
                  title={`Click to schedule at ${hourFormatted}`}
                  className="flex-1 h-full border-t border-border-glass/60 hover:bg-primary/5 cursor-pointer transition-colors relative"
                >
                  {/* Subtle half-hour dash */}
                  <div className="absolute top-1/2 left-0 right-0 border-t border-border-glass/25 border-dashed pointer-events-none" />
                </div>
              </div>
            );
          })}

          {/* Free Gap Indicators */}
          {freeGaps.map((gap, i) => {
            const hours = Math.floor(gap.gapMins / 60);
            const mins = gap.gapMins % 60;
            const gapLabel =
              hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}` : `${mins}m`;

            return (
              <div
                key={i}
                style={{ top: `${gap.top}px`, left: 'var(--agenda-left)' }}
                className="absolute z-10 pointer-events-auto"
              >
                <button
                  onClick={() =>
                    onNewTask({
                      type: 'specific-day',
                      dueTime: gap.suggestedTime,
                      duration: Math.min(gap.gapMins, 60),
                    })
                  }
                  className="px-2 sm:px-2.5 py-0.5 rounded-full bg-surface-container-high/80 hover:bg-primary/20 border border-border-glass hover:border-primary/40 text-on-surface-variant hover:text-primary transition-all text-mono-label font-mono text-[9px] sm:text-[10px] flex items-center gap-1 backdrop-blur-md cursor-pointer shadow-sm group"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 group-hover:animate-ping"
                    aria-hidden="true"
                  />
                  <span>{gapLabel} Free</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    + Schedule
                  </span>
                </button>
              </div>
            );
          })}

          {/* Live Glowing "NOW" Time Wire */}
          {nowOffset !== null && (
            <div
              className="absolute left-0 w-full z-20 pointer-events-none flex items-center transition-all duration-1000"
              style={{ top: `${nowOffset}px` }}
            >
              {/* Pulsing "NOW" Badge */}
              <div className="w-14 sm:w-20 shrink-0 flex items-center gap-1 sm:gap-1.5 justify-start">
                <span className="relative flex h-2 w-2">
                  <span
                    className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"
                    aria-hidden="true"
                  />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-cyan-400 tracking-wider tabular-nums">
                  {nowFormatted}
                </span>
              </div>

              {/* Glowing Laser Wire */}
              <div className="flex-1 h-[2px] bg-gradient-to-r from-cyan-400 via-primary to-transparent shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
            </div>
          )}

          {/* Scheduled Proportional Task Blocks */}
          {positionedTasks.map((task) => {
            const isHigh = task.priority === 'high';
            const isMedium = task.priority === 'medium';
            const isCompleted = task.completed;

            // Responsive width & left positioning
            const leftCalc =
              task.totalCols > 1
                ? `calc(var(--agenda-left) + ${task.colIndex * 48}%)`
                : 'var(--agenda-left)';
            const widthCalc =
              task.totalCols > 1 ? '48%' : 'calc(100% - var(--agenda-end))';

            // Priority styling
            let borderStyle = 'border-border-glass hover:border-primary/50';
            let bgStyle = 'bg-surface-container/85';
            let accentBadge = null;

            if (isHigh) {
              borderStyle =
                'border-error/40 shadow-[0_0_15px_rgba(244,63,94,0.12)]';
              bgStyle = 'bg-error/10 hover:bg-error/15';
              accentBadge = 'bg-error/20 text-error';
            } else if (isMedium) {
              borderStyle =
                'border-tertiary/40 shadow-[0_0_15px_rgba(245,158,11,0.12)]';
              bgStyle = 'bg-tertiary/10 hover:bg-tertiary/15';
              accentBadge = 'bg-tertiary/20 text-tertiary';
            } else {
              borderStyle = 'border-primary/30 shadow-glow';
              bgStyle = 'bg-primary/10 hover:bg-primary/15';
            }

            if (isCompleted) {
              bgStyle = 'bg-surface-container-lowest/50 opacity-60';
              borderStyle = 'border-dashed border-outline/30';
            }

            const endTimeFormatted = formatDisplayTime(
              `${Math.floor(task.endMinutes / 60)}:${String(
                task.endMinutes % 60
              ).padStart(2, '0')}`
            );
            const startTimeFormatted = formatDisplayTime(task.dueTime);

            return (
              <div
                key={task.id}
                style={{
                  top: `${task.top}px`,
                  height: `${task.height}px`,
                  left: leftCalc,
                  width: widthCalc,
                }}
                className={`absolute z-10 rounded-xl sm:rounded-2xl border p-2.5 sm:p-3 flex flex-col justify-between backdrop-blur-xl transition-all duration-200 group ${borderStyle} ${bgStyle}`}
              >
                {/* Block Header: Checkbox + Time + Priority Tag */}
                <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <TactileAnimatedCheckbox
                      checked={task.completed}
                      onChange={() => onToggle(task.id)}
                      ariaLabel={`Mark task "${task.title}" as completed`}
                    />
                    <div className="min-w-0">
                      <span
                        className={`text-xs sm:text-label-md font-bold block truncate text-on-surface ${
                          isCompleted ? 'line-through opacity-70' : ''
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="text-mono-label font-mono text-[10px] sm:text-[11px] text-on-surface-variant font-medium flex items-center gap-1 tabular-nums">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: '12px' }}
                          aria-hidden="true"
                        >
                          schedule
                        </span>
                        {startTimeFormatted} – {endTimeFormatted}
                        <span className="opacity-60 font-sans">
                          ({task.duration}m)
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {task.hasConflict && (
                      <span
                        className="px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-mono font-bold flex items-center gap-0.5 border border-amber-500/30"
                        title="Time overlap with another task"
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: '11px' }}
                          aria-hidden="true"
                        >
                          warning
                        </span>
                        <span className="hidden sm:inline">Overlap</span>
                      </span>
                    )}

                    {accentBadge && (
                      <span
                        className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono uppercase font-bold ${accentBadge}`}
                      >
                        {task.priority}
                      </span>
                    )}

                    {/* Quick Edit/Delete on Hover / Touch */}
                    <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      <button
                        onClick={() => onEdit(task)}
                        aria-label={`Edit task "${task.title}"`}
                        className="min-h-[28px] min-w-[28px] p-1 text-on-surface-variant hover:text-primary rounded-md hover:bg-primary/10 transition-colors flex items-center justify-center cursor-pointer"
                        title="Edit task"
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: '16px' }}
                          aria-hidden="true"
                        >
                          edit
                        </span>
                      </button>
                      <button
                        onClick={() => onDelete(task.id)}
                        aria-label={`Delete task "${task.title}"`}
                        className="min-h-[28px] min-w-[28px] p-1 text-on-surface-variant hover:text-error rounded-md hover:bg-error/10 transition-colors flex items-center justify-center cursor-pointer"
                        title="Delete task"
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: '16px' }}
                          aria-hidden="true"
                        >
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Block Footer: Category / Notes preview */}
                {(task.category || task.notes) && (
                  <div className="flex items-center gap-2 mt-1 pt-1 border-t border-border-glass/40 text-[10px] sm:text-[11px] text-on-surface-variant truncate">
                    {task.category && (
                      <span className="px-1.5 py-0.2 rounded bg-surface-container-highest font-mono text-[9px] sm:text-[10px] text-on-surface">
                        #{task.category}
                      </span>
                    )}
                    {task.notes && (
                      <span className="truncate opacity-75 font-sans">
                        {task.notes}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
