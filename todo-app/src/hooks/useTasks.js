import { useEffect, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { getTodayString, resetDailyTasksIfNeeded } from '../lib/dateUtils';

export function useTasks() {
  const todayStr = getTodayString();

  // Run daily reset logic on hook mount
  useEffect(() => {
    resetDailyTasksIfNeeded(db);
  }, [todayStr]);

  // Live query for all tasks in database
  const allTasks = useLiveQuery(() => db.tasks.toArray(), [], []);

  // Filter tasks for Today View
  // Today view receives:
  // - All daily tasks
  // - All optional tasks (unless assigned to a specific future date)
  // - One-time tasks with dueDate <= todayStr or no dueDate (includes overdue tasks)
  // - Specific-day tasks where dueDate <= todayStr (includes overdue tasks)
  const todayTasks = useMemo(() => {
    if (!allTasks) return [];
    return allTasks.filter(task => {
      if (task.type === 'daily') return true;
      if (task.type === 'optional') {
        return !task.dueDate || task.dueDate <= todayStr;
      }
      if (task.type === 'specific-day') {
        return task.dueDate <= todayStr;
      }
      if (task.type === 'one-time') {
        return !task.dueDate || task.dueDate <= todayStr;
      }
      return true;
    });
  }, [allTasks, todayStr]);

  // Priority & Scheduled tasks for Today view (Left Column: 8/12)
  const todayPriorityTasks = useMemo(() => {
    return todayTasks.filter(t => t.type !== 'optional');
  }, [todayTasks]);

  // Optional / Flexible tasks for Today view (Right Column: 4/12)
  const todayOptionalTasks = useMemo(() => {
    return todayTasks.filter(t => t.type === 'optional');
  }, [todayTasks]);

  // Progress stats
  const completedTodayCount = useMemo(() => {
    return todayTasks.filter(t => t.completed).length;
  }, [todayTasks]);

  const totalTodayCount = todayTasks.length;

  // Upcoming Tasks: specific-day or one-time tasks with a future dueDate > todayStr
  const upcomingTasks = useMemo(() => {
    if (!allTasks) return [];
    return allTasks.filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate > todayStr;
    });
  }, [allTasks, todayStr]);

  // Helper CRUD methods
  const addTask = useCallback(async (taskData) => {
    const newTask = {
      title: taskData.title?.trim() || 'Untitled Task',
      type: taskData.type || 'one-time', // 'daily' | 'optional' | 'one-time' | 'specific-day'
      priority: taskData.priority || 'none', // 'high' | 'medium' | 'low' | 'none'
      category: taskData.category?.trim() || '',
      completed: false,
      completedAt: null,
      dueDate: taskData.dueDate || (taskData.type === 'specific-day' ? todayStr : null),
      dueTime: taskData.dueTime || null,
      duration: Number(taskData.duration) || 45,
      createdAt: new Date().toISOString(),
      lastResetDate: getTodayString(),
      notes: taskData.notes?.trim() || '',
    };
    return await db.tasks.add(newTask);
  }, [todayStr]);

  const updateTask = useCallback(async (id, changes) => {
    return await db.tasks.update(id, changes);
  }, []);

  const toggleTask = useCallback(async (id) => {
    const task = await db.tasks.get(id);
    if (!task) return;
    const isNowCompleted = !task.completed;
    return await db.tasks.update(id, {
      completed: isNowCompleted,
      completedAt: isNowCompleted ? new Date().toISOString() : null,
      lastResetDate: getTodayString(),
    });
  }, []);

  const deleteTask = useCallback(async (id) => {
    return await db.tasks.delete(id);
  }, []);

  const exportTasksJSON = useCallback(async () => {
    const tasks = await db.tasks.toArray();
    return JSON.stringify(tasks, null, 2);
  }, []);

  const importTasksJSON = useCallback(async (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) throw new Error('Invalid JSON format: expected an array of tasks.');
      
      // Clean and validate items before making any DB changes
      const cleaned = parsed.map((t, idx) => {
        if (!t || typeof t !== 'object') {
          throw new Error(`Invalid task entry at index ${idx}`);
        }
        const { id, ...rest } = t;
        return {
          title: typeof rest.title === 'string' && rest.title.trim() ? rest.title.trim() : 'Untitled Task',
          type: ['daily', 'optional', 'one-time', 'specific-day'].includes(rest.type) ? rest.type : 'one-time',
          priority: ['high', 'medium', 'low', 'none'].includes(rest.priority) ? rest.priority : 'none',
          category: typeof rest.category === 'string' ? rest.category.trim() : '',
          completed: Boolean(rest.completed),
          completedAt: rest.completedAt || null,
          dueDate: rest.dueDate || null,
          dueTime: rest.dueTime || null,
          createdAt: rest.createdAt || new Date().toISOString(),
          lastResetDate: rest.lastResetDate || getTodayString(),
          notes: typeof rest.notes === 'string' ? rest.notes.trim() : '',
        };
      });

      // Atomic transaction: clear and bulkAdd together
      await db.transaction('rw', db.tasks, async () => {
        await db.tasks.clear();
        await db.tasks.bulkAdd(cleaned);
      });

      return true;
    } catch (err) {
      console.error('Failed to import tasks:', err);
      throw err;
    }
  }, []);

  const clearAllTasks = useCallback(async () => {
    await db.tasks.clear();
  }, []);

  const slotTaskIntoTime = useCallback(async (id, timeStr, duration = 45) => {
    return await db.tasks.update(id, {
      dueTime: timeStr,
      duration: Number(duration) || 45,
      dueDate: todayStr,
      type: 'specific-day',
    });
  }, [todayStr]);

  return {
    allTasks,
    todayTasks,
    todayPriorityTasks,
    todayOptionalTasks,
    upcomingTasks,
    completedTodayCount,
    totalTodayCount,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    slotTaskIntoTime,
    exportTasksJSON,
    importTasksJSON,
    clearAllTasks,
  };
}
