/**
 * Helper date functions for TaskLine
 */

/**
 * Get current local date in YYYY-MM-DD format
 */
export function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add N days to a YYYY-MM-DD date string
 */
export function addDays(dateStr, numDays) {
  if (!dateStr) return getTodayString();
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + numDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dt = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dt}`;
}

/**
 * Difference in calendar days between dateStrA and dateStrB (B - A)
 */
export function daysBetween(dateStrA, dateStrB) {
  const [y1, m1, d1] = dateStrA.split('-').map(Number);
  const [y2, m2, d2] = dateStrB.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

/**
 * Format a YYYY-MM-DD date string for display, e.g. "Thursday, October 26"
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Short date format, e.g. "Thu, Oct 26"
 */
export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format 24h time string "14:30" into 12h format "2:30 PM"
 */
export function formatDisplayTime(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

/**
 * Get array of upcoming days starting from today for N days
 */
export function getUpcomingDays(count = 7) {
  const days = [];
  const today = new Date();
  const todayStr = getTodayString();

  for (let i = 0; i < count; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    days.push({
      dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
      isToday: dateStr === todayStr,
    });
  }
  return days;
}

/**
 * Check if a date string is before today's date (strictly past)
 */
export function isBeforeToday(dateStr) {
  if (!dateStr) return false;
  return dateStr < getTodayString();
}

/**
 * Reset completed state for Daily tasks when date rolls forward to a new day.
 */
export async function resetDailyTasksIfNeeded(dbInstance) {
  const todayStr = getTodayString();
  try {
    const dailyTasks = await dbInstance.tasks.where('type').equals('daily').toArray();
    for (const task of dailyTasks) {
      if (task.completed) {
        const completedDate = task.completedAt ? task.completedAt.split('T')[0] : (task.lastResetDate || '');
        if (completedDate && completedDate < todayStr) {
          await dbInstance.tasks.update(task.id, {
            completed: false,
            completedAt: null,
            lastResetDate: todayStr,
          });
        }
      }
    }
  } catch (err) {
    console.error('Failed to reset daily tasks:', err);
  }
}

/**
 * Generate matching recurrence dates for a template in a given forward window
 */
export function generateRecurrenceDates(template, windowDays = 21) {
  const todayStr = getTodayString();
  const startDate = template.recurrenceStartDate || todayStr;
  const endDate = template.recurrenceEndDate || null;
  const interval = Math.max(1, Number(template.recurrenceInterval) || 1);
  const type = template.recurrenceType || 'daily';
  const weekdays = Array.isArray(template.recurrenceWeekdays) && template.recurrenceWeekdays.length > 0
    ? template.recurrenceWeekdays
    : [1, 2, 3, 4, 5]; // default to weekdays

  const dates = [];

  for (let i = 0; i <= windowDays; i++) {
    const checkDate = addDays(todayStr, i);
    if (checkDate < startDate) continue;
    if (endDate && checkDate > endDate) break;

    const [y, m, d] = checkDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon ...

    let matches = false;

    if (type === 'daily') {
      matches = true;
    } else if (type === 'interval') {
      const diffFromStart = daysBetween(startDate, checkDate);
      if (diffFromStart >= 0 && diffFromStart % interval === 0) {
        matches = true;
      }
    } else if (type === 'weekly') {
      if (weekdays.includes(dayOfWeek)) {
        matches = true;
      }
    } else if (type === 'weekdays') {
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        matches = true;
      }
    }

    if (matches) {
      dates.push(checkDate);
    }
  }

  return dates;
}

/**
 * Idempotently synchronize recurring task instances from recurrence templates
 */
export async function syncRecurrenceInstances(dbInstance, windowDays = 21) {
  try {
    const allTasks = await dbInstance.tasks.toArray();
    const templates = allTasks.filter((t) => Boolean(t.isRecurrenceTemplate));

    for (const template of templates) {
      const targetDates = generateRecurrenceDates(template, windowDays);
      if (targetDates.length === 0) continue;

      // Find existing instances for this template
      const existing = allTasks.filter(
        (t) => t.recurrenceParentId === template.id
      );
      const existingDateSet = new Set(existing.map((t) => t.dueDate));

      const newInstances = [];
      for (const dateStr of targetDates) {
        if (!existingDateSet.has(dateStr)) {
          newInstances.push({
            title: template.title,
            type: 'specific-day',
            priority: template.priority || 'none',
            category: template.category || '',
            completed: false,
            completedAt: null,
            dueDate: dateStr,
            dueTime: template.dueTime || null,
            duration: Number(template.duration) || 45,
            createdAt: new Date().toISOString(),
            lastResetDate: getTodayString(),
            notes: template.notes || '',
            recurrenceParentId: template.id,
            isRecurrenceTemplate: false,
          });
        }
      }

      if (newInstances.length > 0) {
        await dbInstance.tasks.bulkAdd(newInstances);
      }
    }
  } catch (err) {
    console.error('Failed to sync recurrence instances:', err);
  }
}
