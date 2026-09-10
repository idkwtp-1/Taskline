import React, { useState } from 'react';
import { TaskCard } from '../TaskCard';
import { DayBlockerAgenda } from '../DayBlockerAgenda';
import { FlexDock } from '../FlexDock';
import { RadialTaskGauge } from '../RadialTaskGauge';
import { TaskEditor } from '../TaskEditor';
import { BottomNav } from '../BottomNav';
import { Sidebar } from '../Sidebar';
import { FloatingGlassPillNav } from '../FloatingGlassPillNav';
import { AmbientGlowThemeToggle } from '../AmbientGlowThemeToggle';
import { TactileAnimatedCheckbox } from '../TactileAnimatedCheckbox';
import { ExitConfirmationModal } from '../ExitConfirmationModal';
import { IosInstallBanner } from '../IosInstallBanner';
import { TodayView } from '../TodayView';
import { UpcomingView } from '../UpcomingView';
import { Settings } from '../Settings';
import {
  MOCK_TASK_HIGH,
  MOCK_TASK_MEDIUM,
  MOCK_TASK_OPTIONAL,
  MOCK_TASK_COMPLETED,
  MOCK_TASK_LONG_TEXT,
  MOCK_TODAY_PRIORITY,
  MOCK_TODAY_OPTIONAL,
  MOCK_ALL_TASKS,
} from './MockData';

// Interactive Card Preview Wrapper
function InteractiveCardPreview({ initialTask }) {
  const [task, setTask] = useState(initialTask);
  const [actionLog, setActionLog] = useState('');

  const handleToggle = () => {
    setTask((prev) => ({ ...prev, completed: !prev.completed }));
    setActionLog(`Toggled completion: ${!task.completed}`);
  };

  const handleEdit = (t) => {
    setActionLog(`Edit clicked for "${t.title}"`);
  };

  const handleDelete = (id) => {
    setActionLog(`Delete clicked for task ID #${id}`);
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto p-4">
      <TaskCard
        task={task}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      {actionLog && (
        <div className="text-[11px] font-mono text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg">
          ⚡ Event: {actionLog}
        </div>
      )}
    </div>
  );
}

// Interactive DayBlocker Preview
function InteractiveDayBlockerPreview() {
  const [tasks, setTasks] = useState(MOCK_ALL_TASKS);
  const [log, setLog] = useState('');

  const handleToggle = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between text-xs text-on-surface-variant px-2">
        <span>Click on empty hour slots to trigger new task action</span>
        {log && <span className="text-primary font-mono">{log}</span>}
      </div>
      <DayBlockerAgenda
        tasks={tasks}
        onToggle={handleToggle}
        onEdit={(t) => setLog(`Edit: ${t.title}`)}
        onDelete={(id) => {
          setTasks((prev) => prev.filter((t) => t.id !== id));
          setLog(`Deleted task #${id}`);
        }}
        onNewTask={(vals) => setLog(`New task at ${vals?.dueTime || 'default'}`)}
      />
    </div>
  );
}

// Interactive FlexDock Preview
function InteractiveFlexDockPreview() {
  const [tasks, setTasks] = useState(MOCK_ALL_TASKS);
  const [log, setLog] = useState('');

  const handleToggle = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleSlot = (id, time, duration) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dueTime: time, duration } : t))
    );
    setLog(`Slotted task #${id} into ${time} (${duration}m)`);
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {log && (
        <div className="text-[11px] font-mono text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg">
          {log}
        </div>
      )}
      <FlexDock
        tasks={tasks}
        onToggle={handleToggle}
        onEdit={(t) => setLog(`Edit: ${t.title}`)}
        onDelete={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))}
        onNewTask={() => setLog('New flexible task requested')}
        onSlotTask={handleSlot}
      />
    </div>
  );
}

// Interactive TaskEditor Preview
function InteractiveTaskEditorPreview() {
  const [isOpen, setIsOpen] = useState(true);
  const [savedData, setSavedData] = useState(null);

  return (
    <div className="p-8 text-center space-y-6">
      <button
        onClick={() => setIsOpen(true)}
        className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-glow hover:opacity-90 transition"
      >
        Open Task Editor Drawer
      </button>

      {savedData && (
        <pre className="text-left text-xs bg-surface-container-highest/80 p-4 rounded-xl border border-border-glass max-w-md mx-auto overflow-x-auto">
          {JSON.stringify(savedData, null, 2)}
        </pre>
      )}

      <TaskEditor
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={(data) => {
          setSavedData(data);
          setIsOpen(false);
        }}
        taskToEdit={MOCK_TASK_HIGH}
      />
    </div>
  );
}

// Interactive Checkbox Showcase
function CheckboxShowcase() {
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(true);

  return (
    <div className="p-8 max-w-sm mx-auto space-y-6 bg-surface-container/60 rounded-2xl border border-border-glass">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Unchecked State</span>
        <TactileAnimatedCheckbox
          checked={c1}
          onChange={() => setC1(!c1)}
          ariaLabel="Unchecked preview"
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Checked State</span>
        <TactileAnimatedCheckbox
          checked={c2}
          onChange={() => setC2(!c2)}
          ariaLabel="Checked preview"
        />
      </div>
    </div>
  );
}

export function SandboxRegistry() {
  return [
    // 1. CARDS & ITEMS
    {
      id: 'task-card-high',
      name: 'TaskCard — High Priority',
      category: 'Cards & Items',
      description: 'Spotlight card with red glowing accent bar, ping indicator, and time badge.',
      render: () => <InteractiveCardPreview initialTask={MOCK_TASK_HIGH} />,
    },
    {
      id: 'task-card-medium',
      name: 'TaskCard — Medium Priority',
      category: 'Cards & Items',
      description: 'Spotlight card with tertiary accent bar, daily sync badge, and notes.',
      render: () => <InteractiveCardPreview initialTask={MOCK_TASK_MEDIUM} />,
    },
    {
      id: 'task-card-optional',
      name: 'TaskCard — Optional / Flexible',
      category: 'Cards & Items',
      description: 'Glassmorphic card for flexible, unscheduled tasks with category tag.',
      render: () => <InteractiveCardPreview initialTask={MOCK_TASK_OPTIONAL} />,
    },
    {
      id: 'task-card-completed',
      name: 'TaskCard — Completed State',
      category: 'Cards & Items',
      description: 'Muted card with line-through animation and checked tactile checkbox.',
      render: () => <InteractiveCardPreview initialTask={MOCK_TASK_COMPLETED} />,
    },
    {
      id: 'task-card-long',
      name: 'TaskCard — Overflow & Long Text',
      category: 'Cards & Items',
      description: 'Stress-test card with multi-line title and notes truncation.',
      render: () => <InteractiveCardPreview initialTask={MOCK_TASK_LONG_TEXT} />,
    },
    {
      id: 'tactile-checkbox',
      name: 'TactileAnimatedCheckbox',
      category: 'Cards & Items',
      description: 'Interactive SVG checkbox with micro-animated checkmark and ripple.',
      render: () => <CheckboxShowcase />,
    },

    // 2. VIEWS & CANVAS
    {
      id: 'day-blocker-agenda',
      name: 'DayBlockerAgenda',
      category: 'Views & Canvas',
      description: 'Proportional 24h hourly canvas with live NOW wire, free gap indicators, and conflict detection.',
      render: () => <InteractiveDayBlockerPreview />,
    },
    {
      id: 'flex-dock',
      name: 'FlexDock',
      category: 'Views & Canvas',
      description: 'Side-bay for unscheduled tasks with quick filter tabs and slot-into-agenda control.',
      render: () => <InteractiveFlexDockPreview />,
    },
    {
      id: 'today-view',
      name: 'TodayView (Full Page)',
      category: 'Views & Canvas',
      description: 'Complete Today screen featuring dual-mode toggle (Day-Blocker vs Bento Grid).',
      render: () => (
        <div className="w-full">
          <TodayView
            todayPriorityTasks={MOCK_TODAY_PRIORITY}
            todayOptionalTasks={MOCK_TODAY_OPTIONAL}
            completedTodayCount={1}
            totalTodayCount={MOCK_TODAY_PRIORITY.length + MOCK_TODAY_OPTIONAL.length}
            onToggle={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
            onNewTask={() => {}}
            onSlotTask={() => {}}
          />
        </div>
      ),
    },
    {
      id: 'upcoming-view',
      name: 'UpcomingView (Full Page)',
      category: 'Views & Canvas',
      description: 'Upcoming scheduled agenda grouped chronologically by date.',
      render: () => (
        <div className="w-full">
          <UpcomingView
            allTasks={MOCK_ALL_TASKS}
            onToggle={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
            onNewTask={() => {}}
          />
        </div>
      ),
    },

    // 3. WIDGETS & GAUGES
    {
      id: 'radial-gauge',
      name: 'RadialTaskGauge',
      category: 'Widgets & Gauges',
      description: 'Dynamic SVG completion ring showing progress metrics (0%, 33%, 75%, 100%).',
      render: () => (
        <div className="flex flex-wrap items-center justify-center gap-6 p-8">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-on-surface-variant font-mono">0 / 4 (0%)</span>
            <RadialTaskGauge completedCount={0} totalCount={4} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-on-surface-variant font-mono">1 / 3 (33%)</span>
            <RadialTaskGauge completedCount={1} totalCount={3} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-on-surface-variant font-mono">3 / 4 (75%)</span>
            <RadialTaskGauge completedCount={3} totalCount={4} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-on-surface-variant font-mono">5 / 5 (100%)</span>
            <RadialTaskGauge completedCount={5} totalCount={5} />
          </div>
        </div>
      ),
    },
    {
      id: 'ambient-theme-toggle',
      name: 'AmbientGlowThemeToggle',
      category: 'Widgets & Gauges',
      description: 'Futuristic glowing toggle switch for light/dark mode.',
      render: () => {
        const [isDark, setIsDark] = useState(true);
        return (
          <div className="flex flex-col items-center justify-center p-8 gap-4">
            <AmbientGlowThemeToggle
              isDarkMode={isDark}
              onToggleTheme={() => setIsDark(!isDark)}
            />
            <span className="text-xs text-on-surface-variant">
              Current state: {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
        );
      },
    },

    // 4. NAVIGATION & CONTROLS
    {
      id: 'bottom-nav',
      name: 'BottomNav (Mobile Navigation)',
      category: 'Navigation & Controls',
      description: 'Fixed bottom tab bar with floating action button (FAB) for mobile viewports.',
      render: () => {
        const [tab, setTab] = useState('today');
        return (
          <div className="relative h-48 border border-dashed border-border-glass rounded-2xl overflow-hidden flex flex-col justify-end">
            <div className="p-4 text-center text-xs text-on-surface-variant">
              Active Tab: <span className="font-bold text-primary">{tab}</span>
            </div>
            <BottomNav
              currentTab={tab}
              onSelectTab={setTab}
              onNewTask={() => alert('New Task FAB Clicked')}
            />
          </div>
        );
      },
    },
    {
      id: 'sidebar',
      name: 'Sidebar (Desktop Navigation)',
      category: 'Navigation & Controls',
      description: 'Left drawer navigation rail with branding and section links.',
      render: () => {
        const [tab, setTab] = useState('today');
        return (
          <div className="relative h-[480px] w-64 border border-border-glass rounded-2xl overflow-hidden">
            <Sidebar
              currentTab={tab}
              onSelectTab={setTab}
              onNewTask={() => alert('Sidebar New Task Clicked')}
            />
          </div>
        );
      },
    },
    {
      id: 'floating-glass-pill-nav',
      name: 'FloatingGlassPillNav',
      category: 'Navigation & Controls',
      description: 'Floating glass capsule tab bar with animated sliding pill indicator.',
      render: () => {
        const [tab, setTab] = useState('today');
        const tabs = [
          { id: 'today', label: 'Today', icon: 'today' },
          { id: 'upcoming', label: 'Upcoming', icon: 'calendar_month' },
          { id: 'settings', label: 'Settings', icon: 'settings' },
        ];
        return (
          <div className="p-8 flex justify-center">
            <FloatingGlassPillNav
              tabs={tabs}
              activeTab={tab}
              onChange={setTab}
            />
          </div>
        );
      },
    },

    // 5. MODALS & SHEETS
    {
      id: 'task-editor',
      name: 'TaskEditor Drawer',
      category: 'Modals & Sheets',
      description: 'Slide-over editing sheet with duration chip selectors, priority, and date/time controls.',
      render: () => <InteractiveTaskEditorPreview />,
    },
    {
      id: 'exit-modal',
      name: 'ExitConfirmationModal',
      category: 'Modals & Sheets',
      description: 'Confirmation dialog triggered on desktop window exit / Escape key.',
      render: () => {
        const [isOpen, setIsOpen] = useState(false);
        return (
          <div className="p-8 text-center space-y-4">
            <button
              onClick={() => setIsOpen(true)}
              className="px-4 py-2 bg-error text-on-error rounded-xl font-bold text-sm shadow-sm"
            >
              Open Exit Modal
            </button>
            <ExitConfirmationModal
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              onConfirm={() => {
                alert('App would close now.');
                setIsOpen(false);
              }}
            />
          </div>
        );
      },
    },
    {
      id: 'ios-install-banner',
      name: 'IosInstallBanner',
      category: 'Modals & Sheets',
      description: 'Bottom slide-up banner prompting iOS / iPad users to add PWA to home screen.',
      render: () => (
        <div className="p-4 border border-border-glass rounded-2xl">
          <IosInstallBanner forceShow />
        </div>
      ),
    },
    {
      id: 'settings-view',
      name: 'Settings View',
      category: 'Modals & Sheets',
      description: 'Preferences screen with JSON export/import and data controls.',
      render: () => (
        <div className="max-w-2xl mx-auto">
          <Settings
            isDarkMode={true}
            onToggleTheme={() => {}}
            onExportJSON={() => alert('Export triggered')}
            onImportJSON={() => alert('Import triggered')}
            onClearAll={() => alert('Clear triggered')}
          />
        </div>
      ),
    },
  ];
}
