import React, { useState } from 'react';
import { TaskCard } from './TaskCard';
import { getUpcomingDays, formatDisplayDate, getTodayString } from '../lib/dateUtils';

export function UpcomingView({
  allTasks = [],
  onToggle,
  onEdit,
  onDelete,
  onNewTask,
}) {
  const todayStr = getTodayString();
  const upcomingDays = getUpcomingDays(7);
  const [selectedDate, setSelectedDate] = useState(null); // null means all upcoming

  const tasksWithDueDate = (allTasks || []).filter(task => Boolean(task.dueDate));

  const taskCountByDate = {};
  tasksWithDueDate.forEach(task => {
    taskCountByDate[task.dueDate] = (taskCountByDate[task.dueDate] || 0) + 1;
  });

  let displayedTasks = tasksWithDueDate;
  if (selectedDate) {
    displayedTasks = tasksWithDueDate.filter(t => t.dueDate === selectedDate);
  } else {
    displayedTasks = tasksWithDueDate.filter(t => t.dueDate >= todayStr);
  }

  const groupedTasks = displayedTasks.reduce((acc, task) => {
    const date = task.dueDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedTasks).sort();

  return (
    <div className="max-w-[1050px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-headline-lg font-headline-lg text-on-background tracking-tight">Upcoming</h1>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
            Schedule and plan ahead
          </p>
        </div>
        <button
          onClick={() => onNewTask({ type: 'specific-day', dueDate: selectedDate || todayStr })}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md font-label-md font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-glow"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          Schedule Task
        </button>
      </div>

      {/* 7-Day Horizontal Selector Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider font-bold">
            Next 7 Days
          </span>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-mono-label text-primary hover:underline flex items-center gap-1"
            >
              Show All Upcoming
            </button>
          )}
        </div>
        <div className="grid grid-cols-7 gap-2.5 overflow-x-auto pb-2">
          {upcomingDays.map(day => {
            const isSelected = selectedDate === day.dateStr;
            const count = taskCountByDate[day.dateStr] || 0;

            return (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDate(isSelected ? null : day.dateStr)}
                className={`p-3 rounded-xl border text-center transition-all duration-200 flex flex-col items-center justify-between min-w-[75px] backdrop-blur-md ${
                  isSelected
                    ? 'bg-primary text-on-primary border-primary shadow-glow scale-[1.02]'
                    : day.isToday
                    ? 'bg-surface-glass border-primary/40 text-on-surface'
                    : 'bg-surface-glass border-outline-variant/60 hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <span className="text-mono-label font-mono-label opacity-80 uppercase">{day.dayName}</span>
                <span className="text-headline-md font-headline-md font-bold my-1">{day.dayNum}</span>
                <span className={`text-mono-label font-mono-label px-2 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-on-primary/20 text-on-primary font-bold'
                    : count > 0
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'opacity-40'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date-Grouped Task List */}
      {sortedDates.length === 0 ? (
        <div className="border border-dashed border-outline-variant/60 rounded-xl p-10 text-center flex flex-col items-center justify-center bg-surface-glass backdrop-blur-sm shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-2xl">calendar_today</span>
          </div>
          <p className="text-body-md text-on-surface font-semibold">No scheduled tasks</p>
          <p className="text-body-sm text-on-surface-variant mt-1 mb-5">
            {selectedDate ? `No tasks found for ${formatDisplayDate(selectedDate)}` : 'Nothing scheduled for the coming days'}
          </p>
          <button
            onClick={() => onNewTask({ type: 'specific-day', dueDate: selectedDate || todayStr })}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md font-label-md font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-glow"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Add Task for {selectedDate ? formatDisplayDate(selectedDate) : 'Today'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {sortedDates.map(dateStr => (
            <div key={dateStr} className="flex flex-col gap-3.5">
              <div className="flex items-center gap-3 border-b border-outline-variant/50 pb-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>
                  event
                </span>
                <h2 className="text-body-md font-body-md font-semibold text-on-surface">
                  {dateStr === todayStr ? 'Today' : formatDisplayDate(dateStr)}
                </h2>
                <span className="text-mono-label font-mono-label text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-full border border-outline/30">
                  {groupedTasks[dateStr].length} {groupedTasks[dateStr].length === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {groupedTasks[dateStr].map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
