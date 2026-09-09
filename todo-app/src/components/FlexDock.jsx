import React, { useState } from 'react';
import { TactileAnimatedCheckbox } from './TactileAnimatedCheckbox';

export function FlexDock({
  tasks = [],
  onToggle,
  onEdit,
  onDelete,
  onNewTask,
  onSlotTask,
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'optional' | 'priority'
  const [slottingTaskId, setSlottingTaskId] = useState(null);
  const [slotTime, setSlotTime] = useState('11:00');

  // Filter tasks that do NOT have a dueTime (i.e. flexible, unscheduled, or optional)
  const flexibleTasks = tasks.filter(t => {
    // Tasks without an assigned time
    const isUntimed = !t.dueTime;
    if (activeTab === 'optional') return isUntimed && t.type === 'optional';
    if (activeTab === 'priority') return isUntimed && t.type !== 'optional';
    return isUntimed;
  });

  const handleConfirmSlot = (taskId) => {
    if (onSlotTask && slotTime) {
      onSlotTask(taskId, slotTime, 45);
      setSlottingTaskId(null);
    }
  };

  return (
    <div className="w-full bg-surface-glass backdrop-blur-xl border border-border-glass rounded-3xl p-5 shadow-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-glass pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-tertiary/15 text-tertiary flex items-center justify-center font-bold">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              inbox
            </span>
          </div>
          <div>
            <h2 className="text-body-md font-headline-md font-bold text-on-surface">
              Flex Dock
            </h2>
            <p className="text-mono-label text-on-surface-variant font-mono text-xs">
              {flexibleTasks.length} {flexibleTasks.length === 1 ? 'task ready to slot' : 'tasks ready to slot'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNewTask({ type: 'optional' })}
          className="px-3 py-1.5 bg-tertiary/15 text-tertiary hover:bg-tertiary/25 border border-tertiary/30 rounded-xl text-label-md font-label-md font-bold transition-all flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
          Add Flex
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-surface-container-low rounded-xl border border-border-glass mb-4">
        {[
          { id: 'all', label: 'All Unscheduled' },
          { id: 'priority', label: 'Priority' },
          { id: 'optional', label: 'Optional' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1 rounded-lg text-mono-label font-mono text-xs transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-surface-container-highest text-on-surface font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List in Flex Dock */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {flexibleTasks.length === 0 ? (
          <div className="border border-dashed border-border-glass rounded-2xl p-8 text-center flex flex-col items-center justify-center bg-surface-container-low/40">
            <span className="material-symbols-outlined text-2xl text-on-surface-variant/40 mb-2">
              task_alt
            </span>
            <p className="text-body-sm text-on-surface-variant font-medium">All tasks slotted</p>
            <p className="text-mono-label text-xs text-on-surface-variant/70 mt-0.5">
              Add flexible to-dos here to schedule them when you're ready
            </p>
            <button
              onClick={() => onNewTask({ type: 'optional' })}
              className="mt-4 px-3.5 py-1.5 text-mono-label text-primary hover:bg-primary/10 border border-primary/20 rounded-xl transition-colors cursor-pointer"
            >
              + Create Flexible Task
            </button>
          </div>
        ) : (
          flexibleTasks.map(task => {
            const isSlotting = slottingTaskId === task.id;
            const isHigh = task.priority === 'high';
            const isMedium = task.priority === 'medium';

            return (
              <div
                key={task.id}
                className="group p-3.5 bg-surface-container/60 hover:bg-surface-container-high/80 border border-border-glass rounded-2xl backdrop-blur-md transition-all duration-200 flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <TactileAnimatedCheckbox
                      checked={task.completed}
                      onChange={() => onToggle(task.id)}
                      label={`Mark task ${task.title} as completed`}
                    />
                    <div className="min-w-0">
                      <span className={`text-label-md font-bold block truncate text-on-surface ${task.completed ? 'line-through opacity-70' : ''}`}>
                        {task.title}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          task.type === 'optional'
                            ? 'bg-tertiary/15 text-tertiary border border-tertiary/20'
                            : 'bg-primary/15 text-primary border border-primary/20'
                        }`}>
                          {task.type}
                        </span>
                        {task.category && (
                          <span className="text-[10px] text-on-surface-variant font-mono">
                            #{task.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Priority indicator */}
                  {isHigh && (
                    <span className="w-2 h-2 rounded-full bg-error shrink-0 mt-1 shadow-[0_0_8px_rgba(244,63,94,0.6)]" title="High priority" />
                  )}
                  {isMedium && (
                    <span className="w-2 h-2 rounded-full bg-tertiary shrink-0 mt-1 shadow-[0_0_8px_rgba(245,158,11,0.6)]" title="Medium priority" />
                  )}
                </div>

                {/* Slotting Controller / Action Row */}
                {isSlotting ? (
                  <div className="p-2.5 bg-surface-container-highest rounded-xl border border-primary/30 flex items-center justify-between gap-2 animate-fade-in">
                    <div className="flex items-center gap-1.5 text-mono-label font-mono text-xs text-primary font-bold">
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>schedule</span>
                      <span>Slot Time:</span>
                    </div>
                    <input
                      type="time"
                      value={slotTime}
                      onChange={(e) => setSlotTime(e.target.value)}
                      className="px-2 py-1 bg-surface-container border border-border-glass rounded-lg text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => handleConfirmSlot(task.id)}
                      className="px-2.5 py-1 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setSlottingTaskId(null)}
                      className="p-1 text-on-surface-variant hover:text-on-surface rounded"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1 border-t border-border-glass/40">
                    <button
                      onClick={() => setSlottingTaskId(task.id)}
                      className="px-2.5 py-1 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary rounded-xl text-mono-label font-mono text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_add_on</span>
                      Slot into Agenda
                    </button>

                    <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        onClick={() => onEdit(task)}
                        aria-label="Edit task"
                        className="p-1 text-on-surface-variant hover:text-primary rounded"
                        title="Edit task"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                      </button>
                      <button
                        onClick={() => onDelete(task.id)}
                        aria-label="Delete task"
                        className="p-1 text-on-surface-variant hover:text-error rounded"
                        title="Delete task"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
