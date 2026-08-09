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
 * Reactive reset logic: checks if daily task was completed on a previous day.
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
