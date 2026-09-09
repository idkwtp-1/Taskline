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

  // Default to the new Direction B 'day-blocker' view, with fallback to saved preference
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('taskline-today-view-mode') || 'day-blocker';
  });

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('taskline-today-view-mode', mode);
  };

  const allTodayTasks = [...todayPriorityTasks, ...todayOptionalTasks];

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      {/* Page Header with Radial Completion Gauge & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border-glass pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-headline-lg font-headline-lg text-on-background tracking-tight">Today</h1>
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-glow" />
          </div>
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-1 font-medium">{todayFormatted}</p>
        </div>

        {/* Action / Controls Group */}
        <div className="flex flex-wrap items-center gap-4">
          {/* View Switcher: Day-Blocker Calendar Agenda vs Bento Overview */}
          <div className="flex items-center gap-1 p-1 bg-surface-container-low border border-border-glass rounded-2xl shadow-sm">
            <button
              onClick={() => handleSetViewMode('day-blocker')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-label-md font-label-md font-bold transition-all cursor-pointer ${
                viewMode === 'day-blocker'
                  ? 'bg-primary text-on-primary shadow-glow scale-[1.02]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                calendar_view_day
              </span>
              <span>Day-Blocker</span>
            </button>
            <button
              onClick={() => handleSetViewMode('bento')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-label-md font-label-md font-bold transition-all cursor-pointer ${
                viewMode === 'bento'
                  ? 'bg-primary text-on-primary shadow-glow scale-[1.02]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                dashboard
              </span>
              <span>Bento Grid</span>
            </button>
          </div>

          {/* Dynamic SVG Radial Gauge Widget */}
          <RadialTaskGauge
            completedCount={completedTodayCount}
            totalCount={totalTodayCount}
          />
        </div>
      </div>

      {/* Main Content Area based on View Mode */}
      {viewMode === 'day-blocker' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
          {/* Proportional 24h Visual Agenda (Left 8/12) */}
          <div className="lg:col-span-8 w-full">
            <DayBlockerAgenda
              tasks={allTodayTasks}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onNewTask={onNewTask}
            />
          </div>

          {/* Flex Dock Side-Bay (Right 4/12) */}
          <div className="lg:col-span-4 w-full lg:sticky lg:top-24">
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
      ) : (
        /* Asymmetrical Bento Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
          {/* Main Tasks Column (Priority & Scheduled: 8/12) */}
          <div className="md:col-span-8 flex flex-col gap-4">
            <div className="flex items-center justify-between pl-4 pr-1 mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>
                  star
                </span>
                <h2 className="text-label-md font-label-md text-on-surface uppercase tracking-wider font-bold">
                  Priority &amp; Scheduled
                </h2>
              </div>
              <span className="text-mono-label text-on-surface-variant bg-surface-container-highest/60 px-2.5 py-0.5 rounded-full border border-border-glass">
                {todayPriorityTasks.length} {todayPriorityTasks.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {todayPriorityTasks.length === 0 ? (
              <div className="border border-dashed border-border-glass rounded-2xl p-12 text-center flex flex-col items-center justify-center bg-surface-glass backdrop-blur-md shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-glow">
                  <span className="material-symbols-outlined text-3xl">task_alt</span>
                </div>
                <p className="text-body-md text-on-surface font-semibold text-lg">All priority tasks complete</p>
                <p className="text-body-sm text-on-surface-variant mt-1 mb-6">No remaining scheduled items for today</p>
                <button
                  onClick={() => onNewTask({ type: 'one-time' })}
                  className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-label-md font-label-md font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-glow focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                  Add Priority Task
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {todayPriorityTasks.map(task => (
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

          {/* Sidebar Column (Optional / Flexible: 4/12) */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="flex items-center justify-between pl-4 pr-1 mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary" style={{ fontSize: '20px' }}>
                  lightbulb
                </span>
                <h2 className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider font-bold">
                  Optional / Flexible
                </h2>
              </div>
              <span className="text-mono-label text-on-surface-variant bg-surface-container-highest/60 px-2.5 py-0.5 rounded-full border border-border-glass">
                {todayOptionalTasks.length}
              </span>
            </div>

            {todayOptionalTasks.length === 0 ? (
              <div className="border border-dashed border-border-glass rounded-2xl p-8 text-center flex flex-col items-center justify-center bg-surface-glass/40 backdrop-blur-sm">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/40 mb-2">
                  auto_awesome
                </span>
                <p className="text-body-sm text-on-surface-variant">No flexible items</p>
                <button
                  onClick={() => onNewTask({ type: 'optional' })}
                  className="mt-4 px-3.5 py-2 text-mono-label text-primary hover:bg-primary/10 border border-primary/20 rounded-xl transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
                >
                  + Add Optional Task
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {todayOptionalTasks.map(task => (
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
      )}
    </div>
  );
}
