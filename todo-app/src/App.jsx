import React, { useState, useEffect } from 'react';
import { useTasks } from './hooks/useTasks';
import { TodayView } from './components/TodayView';
import { UpcomingView } from './components/UpcomingView';
import { Settings } from './components/Settings';
import { TaskEditor } from './components/TaskEditor';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { IosInstallBanner } from './components/IosInstallBanner';
import { ExitConfirmationModal } from './components/ExitConfirmationModal';
import { AmbientGlowThemeToggle } from './components/AmbientGlowThemeToggle';

export default function App() {
  const [currentTab, setCurrentTab] = useState('today');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [editorInitialValues, setEditorInitialValues] = useState({});

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('taskline-theme');
    if (saved !== null) return saved === 'dark';
    return true; // Default dark mode per spec
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('taskline-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('taskline-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  // Close desktop app execution
  const executeCloseApp = () => {
    if (window.pywebview && window.pywebview.api && window.pywebview.api.close_app) {
      window.pywebview.api.close_app();
    } else {
      window.close();
    }
  };

  // Listen for Escape key to trigger exit modal (when editor is not open)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (!isEditorOpen && !isExitModalOpen) {
          e.preventDefault();
          setIsExitModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditorOpen, isExitModalOpen]);

  // Task Data Hook
  const {
    allTasks,
    todayPriorityTasks,
    todayOptionalTasks,
    completedTodayCount,
    totalTodayCount,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    exportTasksJSON,
    importTasksJSON,
    clearAllTasks,
  } = useTasks();

  // Task Editor Handlers
  const handleOpenNewTask = (initialValues = {}) => {
    setTaskToEdit(null);
    setEditorInitialValues(initialValues);
    setIsEditorOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setTaskToEdit(task);
    setIsEditorOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    if (taskData.id) {
      await updateTask(taskData.id, taskData);
    } else {
      await addTask(taskData);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-sans selection:bg-primary/30">
      {/* iOS Safari Install Banner */}
      <IosInstallBanner />

      {/* Futuristic Glassmorphic Header Bar */}
      <header className="sticky top-0 z-30 h-[65px] border-b border-border-glass bg-surface-glass backdrop-blur-xl flex justify-between items-center px-margin_mobile md:px-margin_desktop">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold shadow-glow">
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              check_box
            </span>
          </div>
          <span className="text-headline-md font-headline-md font-bold text-primary tracking-tight">
            TaskLine
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenNewTask()}
            aria-label="Create a new task"
            className="hidden sm:flex px-4 py-2 bg-primary text-on-primary rounded-xl text-label-md font-label-md font-bold hover:opacity-90 transition-opacity items-center gap-1.5 shadow-glow focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            New Task
          </button>

          {/* Ambient Glow Theme Toggle Switch */}
          <AmbientGlowThemeToggle
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
          />

          {/* Close App Header Trigger (Desktop Only) */}
          <button
            onClick={() => setIsExitModalOpen(true)}
            aria-label="Close application"
            className="hidden md:flex p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-all duration-200 border border-outline-variant/40 focus-visible:ring-2 focus-visible:ring-error focus-visible:outline-none cursor-pointer"
            title="Close Application (Esc)"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              close
            </span>
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onNewTask={handleOpenNewTask}
        />

        {/* Main Content Area */}
        <main className="flex-1 ml-0 md:ml-sidebar_width p-margin_mobile md:p-margin_desktop pb-24 md:pb-12 overflow-y-auto">
          {currentTab === 'today' && (
            <TodayView
              todayPriorityTasks={todayPriorityTasks}
              todayOptionalTasks={todayOptionalTasks}
              completedTodayCount={completedTodayCount}
              totalTodayCount={totalTodayCount}
              onToggle={toggleTask}
              onEdit={handleOpenEditTask}
              onDelete={deleteTask}
              onNewTask={handleOpenNewTask}
            />
          )}

          {currentTab === 'upcoming' && (
            <UpcomingView
              allTasks={allTasks}
              onToggle={toggleTask}
              onEdit={handleOpenEditTask}
              onDelete={deleteTask}
              onNewTask={handleOpenNewTask}
            />
          )}

          {currentTab === 'settings' && (
            <Settings
              isDarkMode={isDarkMode}
              onToggleTheme={toggleTheme}
              onExportJSON={exportTasksJSON}
              onImportJSON={importTasksJSON}
              onClearAll={clearAllTasks}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation + FAB */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onNewTask={handleOpenNewTask}
      />

      {/* Slide-Over Task Editor Modal */}
      <TaskEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        initialValues={editorInitialValues}
      />

      {/* Exit Confirmation Modal */}
      <ExitConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={executeCloseApp}
      />
    </div>
  );
}
