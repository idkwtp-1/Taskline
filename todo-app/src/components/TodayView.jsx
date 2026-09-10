import React, { useState } from 'react';
import { TaskCard } from './TaskCard';
import { RadialTaskGauge } from './RadialTaskGauge';
import { DayBlockerAgenda } from './DayBlockerAgenda';
import { FlexDock } from './FlexDock';
import { formatDisplayDate, getTodayString } from '../lib/dateUtils';

export function TodayView({
  todayPriorityTasks = [],
  todayOptionalTasks = [],
  completedTodayCount = 0,
  totalTodayCount = 0,
  onToggle,
  onEdit,
  onDelete,
  onNewTask,
  onSlotTask,
}) {
  const todayFormatted = formatDisplayDate(getTodayString());

  // Default to 'day-blocker' view mode, with fallback to saved preference
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('taskline-today-view-mode') || 'day-blocker';
  });

  // Mobile focused tab selectors to avoid vertical stacking overload
  const [mobileDayBlockerTab, setMobileDayBlockerTab] = useState('schedule'); // 'schedule' | 'unscheduled'
  const [mobileBentoTab, setMobileBentoTab] = useState('priority'); // 'priority' | 'optional'

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('taskline-today-view-mode', mode);
  };

  const allTodayTasks = [...todayPriorityTasks, ...todayOptionalTasks];
  const scheduledCount = allTodayTasks.filter((t) => Boolean(t.dueTime)).length;
  const unscheduledCount = allTodayTasks.filter((t) => !t.dueTime).length;

  return (
    <div className="max-w-[1280px] mx-auto space-y-4 sm:space-y-6">
      {/* Page Header with Radial Completion Gauge & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 border-b border-border-glass pb-4 sm:pb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-headline-lg font-headline-lg font-bold text-on-background tracking-tight">
                Today
              </h1>
              <span
                className="w-2.5 h-2.5 rounded-full bg-primary shadow-glow"
                aria-hidden="true"
              />
            </div>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5 font-medium">
              {todayFormatted}
            </p>
          </div>

          {/* Radial Completion Gauge on Mobile Screen */}
          <div className="sm:hidden shrink-0">
            <RadialTaskGauge
              completedCount={completedTodayCount}
              totalCount={totalTodayCount}
            />
          </div>
        </div>

        {/* Action / Controls Group */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* View Switcher: Day-Blocker Agenda vs Bento Grid */}
          <div className="flex items-center gap-1 p-1 bg-surface-container-low border border-border-glass rounded-2xl shadow-sm">
            <button
              onClick={() => handleSetViewMode('day-blocker')}
              aria-label="Switch to Day-Blocker visual schedule"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-label-md font-label-md font-bold transition-all cursor-pointer ${
                viewMode === 'day-blocker'
                  ? 'bg-primary text-on-primary shadow-glow scale-[1.02]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Day-Blocker Timeline"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '18px' }}
                aria-hidden="true"
              >
                calendar_view_day
              </span>
              <span className="hidden sm:inline">Day-Blocker</span>
            </button>
            <button
              onClick={() => handleSetViewMode('bento')}
              aria-label="Switch to Bento Grid overview"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-label-md font-label-md font-bold transition-all cursor-pointer ${
                viewMode === 'bento'
                  ? 'bg-primary text-on-primary shadow-glow scale-[1.02]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Bento Grid"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '18px' }}
                aria-hidden="true"
              >
                dashboard
              </span>
              <span className="hidden sm:inline">Bento Grid</span>
            </button>
          </div>

          {/* Dynamic SVG Radial Gauge Widget (Desktop) */}
          <div className="hidden sm:block shrink-0">
            <RadialTaskGauge
              completedCount={completedTodayCount}
              totalCount={totalTodayCount}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area based on View Mode */}
      {viewMode === 'day-blocker' ? (
        <div className="space-y-4">
          {/* Mobile Focus Tab Switcher (Visible only on < lg screens) */}
          <div className="flex lg:hidden items-center justify-center p-1 bg-surface-container-low border border-border-glass rounded-2xl w-full">
            <button
              onClick={() => setMobileDayBlockerTab('schedule')}
              aria-label="View scheduled daily timeline"
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mobileDayBlockerTab === 'schedule'
                  ? 'bg-primary text-on-primary shadow-glow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '17px' }}
                aria-hidden="true"
              >
                calendar_view_day
              </span>
              <span>Schedule ({scheduledCount})</span>
            </button>
            <button
              onClick={() => setMobileDayBlockerTab('unscheduled')}
              aria-label="View unscheduled flexible tasks dock"
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mobileDayBlockerTab === 'unscheduled'
                  ? 'bg-primary text-on-primary shadow-glow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '17px' }}
                aria-hidden="true"
              >
                inbox
              </span>
              <span>Unscheduled ({unscheduledCount})</span>
            </button>
          </div>

          {/* Desktop Dual-Pane Grid (lg:grid) vs Mobile Active Sub-tab */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Proportional 24h Visual Agenda (Left 8/12 on Desktop) */}
            <div
              className={`lg:col-span-8 w-full ${
                mobileDayBlockerTab === 'schedule' ? 'block' : 'hidden lg:block'
              }`}
            >
              <DayBlockerAgenda
                tasks={allTodayTasks}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                onNewTask={onNewTask}
              />
            </div>

            {/* Flex Dock Side-Bay (Right 4/12 on Desktop) */}
            <div
              className={`lg:col-span-4 w-full lg:sticky lg:top-24 ${
                mobileDayBlockerTab === 'unscheduled' ? 'block' : 'hidden lg:block'
              }`}
            >
              <FlexDock
                tasks={allTodayTasks}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                onNewTask={onNewTask}
                onSlotTask={onSlotTask}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Bento Grid Mode */
        <div className="space-y-4">
          {/* Mobile Focus Tab Switcher for Bento Mode (Visible only on < md screens) */}
          <div className="flex md:hidden items-center justify-center p-1 bg-surface-container-low border border-border-glass rounded-2xl w-full">
            <button
              onClick={() => setMobileBentoTab('priority')}
              aria-label="View priority and scheduled tasks"
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mobileBentoTab === 'priority'
                  ? 'bg-primary text-on-primary shadow-glow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '17px' }}
                aria-hidden="true"
              >
                star
              </span>
              <span>Priority ({todayPriorityTasks.length})</span>
            </button>
            <button
              onClick={() => setMobileBentoTab('optional')}
              aria-label="View optional and flexible tasks"
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mobileBentoTab === 'optional'
                  ? 'bg-primary text-on-primary shadow-glow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '17px' }}
                aria-hidden="true"
              >
                lightbulb
              </span>
              <span>Optional ({todayOptionalTasks.length})</span>
            </button>
          </div>

          {/* Bento Columns: Side-by-Side on Desktop (md:grid), Active Tab on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Main Tasks Column (Priority & Scheduled: 8/12 on Desktop) */}
            <div
              className={`md:col-span-8 flex flex-col gap-4 ${
                mobileBentoTab === 'priority' ? 'block' : 'hidden md:block'
              }`}
            >
              <div className="flex items-center justify-between pl-2 pr-1 mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontSize: '20px' }}
                    aria-hidden="true"
                  >
                    star
                  </span>
                  <h2 className="text-label-md font-label-md text-on-surface uppercase tracking-wider font-bold">
                    Priority &amp; Scheduled
                  </h2>
                </div>
                <span className="text-mono-label text-on-surface-variant bg-surface-container-highest/60 px-2.5 py-0.5 rounded-full border border-border-glass font-mono text-xs">
                  {todayPriorityTasks.length}{' '}
                  {todayPriorityTasks.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {todayPriorityTasks.length === 0 ? (
                <div className="border border-dashed border-border-glass rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center bg-surface-glass backdrop-blur-md shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 shadow-glow">
                    <span
                      className="material-symbols-outlined text-2xl"
                      aria-hidden="true"
                    >
                      task_alt
                    </span>
                  </div>
                  <p className="text-body-md text-on-surface font-semibold text-base sm:text-lg">
                    All priority tasks complete
                  </p>
                  <p className="text-body-sm text-on-surface-variant mt-1 mb-5 text-xs sm:text-sm">
                    No remaining scheduled items for today
                  </p>
                  <button
                    onClick={() => onNewTask({ type: 'one-time' })}
                    className="px-4 py-2 bg-primary text-on-primary rounded-xl text-label-md font-label-md font-bold hover:opacity-90 transition flex items-center gap-2 shadow-glow cursor-pointer"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '18px' }}
                      aria-hidden="true"
                    >
                      add
                    </span>
                    Add Priority Task
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {todayPriorityTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={onToggle}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Column (Optional / Flexible: 4/12 on Desktop) */}
            <div
              className={`md:col-span-4 flex flex-col gap-4 ${
                mobileBentoTab === 'optional' ? 'block' : 'hidden md:block'
              }`}
            >
              <div className="flex items-center justify-between pl-2 pr-1 mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-tertiary"
                    style={{ fontSize: '20px' }}
                    aria-hidden="true"
                  >
                    lightbulb
                  </span>
                  <h2 className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider font-bold">
                    Optional / Flexible
                  </h2>
                </div>
                <span className="text-mono-label text-on-surface-variant bg-surface-container-highest/60 px-2.5 py-0.5 rounded-full border border-border-glass font-mono text-xs">
                  {todayOptionalTasks.length}
                </span>
              </div>

              {todayOptionalTasks.length === 0 ? (
                <div className="border border-dashed border-border-glass rounded-2xl p-6 text-center flex flex-col items-center justify-center bg-surface-glass/40 backdrop-blur-sm">
                  <span
                    className="material-symbols-outlined text-2xl text-on-surface-variant/40 mb-2"
                    aria-hidden="true"
                  >
                    auto_awesome
                  </span>
                  <p className="text-body-sm text-on-surface-variant text-xs sm:text-sm">
                    No flexible items
                  </p>
                  <button
                    onClick={() => onNewTask({ type: 'optional' })}
                    className="mt-3 px-3.5 py-1.5 text-mono-label text-primary hover:bg-primary/10 border border-primary/20 rounded-xl transition flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    + Add Optional Task
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {todayOptionalTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={onToggle}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
